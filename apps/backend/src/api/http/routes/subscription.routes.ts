import crypto from 'crypto';
import type { Request, Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';

import { config } from '../../../infrastructure/config/env';
import { getFounderSeatsRemaining, reserveFounderSeat } from '../../../modules/subscription/founderSeats.store';
import {
  getSubscriptionProfile,
  getUserIdByStripeCustomerId,
  linkStripeCustomerToUser,
  upsertSubscriptionProfileFromStripe
} from '../../../modules/subscription/subscriptionProfiles.store';

export const subscriptionRouter = Router();

const activateFounderSchema = z.object({
  userId: z.string().trim().min(1).default('guest')
});

const statusSchema = z.object({
  userId: z.string().trim().min(1)
});

const checkoutSchema = z.object({
  userId: z.string().trim().min(1),
  email: z.string().email(),
  planType: z.enum(['founder', 'pro']),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional()
});

const portalSchema = z.object({
  userId: z.string().trim().min(1),
  returnUrl: z.string().url().optional()
});

function ensureStripeConfigured() {
  if (!config.stripeSecretKey) {
    throw new Error('Stripe is not configured: STRIPE_SECRET_KEY missing');
  }
}

function getStripePriceId(planType: 'founder' | 'pro'): string {
  if (planType === 'founder') {
    if (!config.stripeFounderPriceId) throw new Error('Missing STRIPE_FOUNDER_PRICE_ID');
    return config.stripeFounderPriceId;
  }
  if (!config.stripeProPriceId) throw new Error('Missing STRIPE_PRO_PRICE_ID');
  return config.stripeProPriceId;
}

function stripeApiHeaders() {
  return {
    Authorization: `Bearer ${config.stripeSecretKey}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  };
}

function buildFormBody(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) return;
    search.append(key, String(value));
  });
  return search.toString();
}

async function stripeRequestForm(pathname: string, body: Record<string, string | number | undefined>) {
  ensureStripeConfigured();
  const response = await fetch(`https://api.stripe.com/v1/${pathname}`, {
    method: 'POST',
    headers: stripeApiHeaders(),
    body: buildFormBody(body)
  });
  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new Error(`Stripe API failed (${response.status}) ${details}`);
  }
  return (await response.json()) as Record<string, any>;
}

async function stripeRequestGet(pathname: string) {
  ensureStripeConfigured();
  const response = await fetch(`https://api.stripe.com/v1/${pathname}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${config.stripeSecretKey}`
    }
  });
  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new Error(`Stripe API failed (${response.status}) ${details}`);
  }
  return (await response.json()) as Record<string, any>;
}

function parseStripeSignature(header: string): { t: string; v1: string[] } | null {
  const items = header.split(',').map((part) => part.trim());
  let t = '';
  const v1: string[] = [];
  for (const item of items) {
    const [key, value] = item.split('=');
    if (!key || !value) continue;
    if (key === 't') t = value;
    if (key === 'v1') v1.push(value);
  }
  if (!t || v1.length === 0) return null;
  return { t, v1 };
}

function verifyStripeWebhookSignature(rawBody: Buffer, signatureHeader?: string): boolean {
  if (!config.stripeWebhookSecret) return false;
  if (!signatureHeader) return false;
  const parsed = parseStripeSignature(signatureHeader);
  if (!parsed) return false;
  const payload = `${parsed.t}.${rawBody.toString('utf8')}`;
  const expected = crypto.createHmac('sha256', config.stripeWebhookSecret).update(payload).digest('hex');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  return parsed.v1.some((sig) => {
    const candidate = Buffer.from(sig, 'utf8');
    if (candidate.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(candidate, expectedBuffer);
  });
}

function mapPriceToPlanType(priceId?: string): 'founder' | 'pro' {
  if (priceId && config.stripeFounderPriceId && priceId === config.stripeFounderPriceId) return 'founder';
  return 'pro';
}

async function processStripeEvent(event: any): Promise<void> {
  const eventType = event?.type;

  if (eventType === 'checkout.session.completed') {
    const session = event.data?.object ?? {};
    const userId = String(session.client_reference_id ?? session.metadata?.userId ?? '').trim();
    const customerId = typeof session.customer === 'string' ? session.customer : undefined;
    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : undefined;
    const priceId = typeof session.metadata?.priceId === 'string' ? session.metadata.priceId : undefined;
    const planType = mapPriceToPlanType(priceId);

    if (!userId) return;
    await linkStripeCustomerToUser(userId, customerId);
    await upsertSubscriptionProfileFromStripe({
      userId,
      planType,
      subscriptionStatus: 'active',
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId
    });
    return;
  }

  if (eventType === 'customer.subscription.updated' || eventType === 'customer.subscription.created' || eventType === 'customer.subscription.deleted') {
    const subscription = event.data?.object ?? {};
    const customerId = typeof subscription.customer === 'string' ? subscription.customer : undefined;
    const userIdFromMetadata = String(subscription.metadata?.userId ?? '').trim();
    const userId = userIdFromMetadata || (await getUserIdByStripeCustomerId(customerId)) || '';
    if (!userId) return;

    const subscriptionId = typeof subscription.id === 'string' ? subscription.id : undefined;
    const subscriptionStatus = String(subscription.status ?? 'free');
    const priceId = subscription.items?.data?.[0]?.price?.id as string | undefined;
    const planType = mapPriceToPlanType(priceId);

    await upsertSubscriptionProfileFromStripe({
      userId,
      planType,
      subscriptionStatus,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId
    });
  }
}

export async function handleStripeWebhook(req: Request, res: Response) {
  try {
    if (!config.stripeWebhookSecret) {
      return res.status(400).json({ ok: false, message: 'Stripe webhook secret missing' });
    }

    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body ?? '');
    const sig = req.headers['stripe-signature'];
    const signatureHeader = typeof sig === 'string' ? sig : Array.isArray(sig) ? sig[0] : undefined;
    const valid = verifyStripeWebhookSignature(rawBody, signatureHeader);

    if (!valid) {
      return res.status(400).json({ ok: false, message: 'Invalid Stripe signature' });
    }

    const event = JSON.parse(rawBody.toString('utf8'));
    await processStripeEvent(event);
    return res.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return res.status(400).json({ ok: false, message });
  }
}

subscriptionRouter.get('/founder-seats', async (_req, res) => {
  try {
    const founderSeatsRemaining = await getFounderSeatsRemaining();
    return res.json({ founderSeatsRemaining });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return res.status(500).json({ message });
  }
});

subscriptionRouter.get('/status', async (req, res) => {
  try {
    const { userId } = statusSchema.parse(req.query ?? {});
    const profile = await getSubscriptionProfile(userId);
    return res.json({
      ...profile,
      status: profile.subscriptionStatus === 'active' ? 'pro' : 'free'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return res.status(400).json({ ok: false, message });
  }
});

subscriptionRouter.post('/activate-founder', async (req, res) => {
  try {
    const { userId } = activateFounderSchema.parse(req.body ?? {});
    const result = await reserveFounderSeat(userId);

    if (!result.ok) {
      return res.status(409).json({
        ok: false,
        reason: 'sold_out',
        founderSeatsRemaining: result.founderSeatsRemaining
      });
    }

    return res.json({
      ok: true,
      founderSeatsRemaining: result.founderSeatsRemaining
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return res.status(400).json({ message });
  }
});

async function handleCreateCheckoutSession(req: Request, res: Response) {
  try {
    const input = checkoutSchema.parse(req.body ?? {});
    const priceId = getStripePriceId(input.planType);

    if (input.planType === 'founder') {
      const seat = await reserveFounderSeat(input.userId);
      if (!seat.ok) {
        return res.status(409).json({
          ok: false,
          reason: 'sold_out',
          founderSeatsRemaining: seat.founderSeatsRemaining
        });
      }
    }

    const successUrl = input.successUrl ?? config.stripeSuccessUrl;
    const cancelUrl = input.cancelUrl ?? config.stripeCancelUrl;

    const session = await stripeRequestForm('checkout/sessions', {
      mode: 'subscription',
      'payment_method_types[0]': 'card',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': 1,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: input.email,
      client_reference_id: input.userId,
      'metadata[userId]': input.userId,
      'metadata[email]': input.email,
      'metadata[planType]': input.planType,
      'metadata[priceId]': priceId,
      'subscription_data[metadata][userId]': input.userId,
      'subscription_data[metadata][email]': input.email,
      'subscription_data[metadata][planType]': input.planType
    });

    return res.json({ ok: true, checkoutUrl: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return res.status(400).json({ ok: false, message });
  }
}

subscriptionRouter.post('/checkout-session', handleCreateCheckoutSession);
subscriptionRouter.post('/create-checkout-session', handleCreateCheckoutSession);

subscriptionRouter.post('/customer-portal', async (req, res) => {
  try {
    const input = portalSchema.parse(req.body ?? {});
    const profile = await getSubscriptionProfile(input.userId);
    if (!profile.stripeCustomerId) {
      return res.status(404).json({ ok: false, message: 'No active Stripe customer found' });
    }

    const session = await stripeRequestForm('billing_portal/sessions', {
      customer: profile.stripeCustomerId,
      return_url: input.returnUrl ?? config.stripeSuccessUrl,
      configuration: config.stripePortalConfigurationId || undefined
    });

    return res.json({ ok: true, portalUrl: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return res.status(400).json({ ok: false, message });
  }
});

subscriptionRouter.post('/sync-from-stripe', async (req, res) => {
  try {
    const { userId } = statusSchema.parse(req.body ?? {});
    const profile = await getSubscriptionProfile(userId);
    if (!profile.stripeSubscriptionId) {
      return res.json({ ok: true, profile });
    }

    const subscription = await stripeRequestGet(`subscriptions/${profile.stripeSubscriptionId}`);
    const priceId = subscription.items?.data?.[0]?.price?.id as string | undefined;
    const next = await upsertSubscriptionProfileFromStripe({
      userId,
      planType: mapPriceToPlanType(priceId),
      subscriptionStatus: String(subscription.status ?? 'free'),
      stripeCustomerId: (subscription.customer as string) ?? profile.stripeCustomerId,
      stripeSubscriptionId: subscription.id as string,
      stripePriceId: priceId
    });
    return res.json({ ok: true, profile: next });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return res.status(400).json({ ok: false, message });
  }
});

subscriptionRouter.post('/admin-grant', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ ok: false, message: 'userId required' });
    await upsertSubscriptionProfileFromStripe({
      userId,
      planType: 'pro',
      subscriptionStatus: 'active',
      stripeCustomerId: undefined,
      stripeSubscriptionId: undefined,
      stripePriceId: undefined
    });
    return res.json({ ok: true, message: `Premium granted to ${userId}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return res.status(400).json({ ok: false, message });
  }
});
