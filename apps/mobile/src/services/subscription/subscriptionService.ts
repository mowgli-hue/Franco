import { env } from '../../core/config/env';

const DEFAULT_FOUNDER_SEATS = 50;

type PlanType = 'founder' | 'pro';

export type SubscriptionStatusResponse = {
  userId: string;
  planType: 'free' | 'founder' | 'pro';
  subscriptionStatus: 'free' | 'active' | 'canceled' | 'past_due' | 'incomplete';
};

export async function fetchFounderSeatsRemaining(): Promise<number> {
  try {
    const response = await fetch(`${env.apiBaseUrl}/subscription/founder-seats`);
    if (!response.ok) return DEFAULT_FOUNDER_SEATS;
    const data = (await response.json()) as { founderSeatsRemaining?: number };
    const seats = Number(data.founderSeatsRemaining);
    return Number.isFinite(seats) ? Math.max(0, seats) : DEFAULT_FOUNDER_SEATS;
  } catch {
    return DEFAULT_FOUNDER_SEATS;
  }
}

export async function reserveFounderSeat(
  userId?: string
): Promise<{ ok: boolean; seatsRemaining: number; reason?: 'sold_out' | 'failed' }> {
  try {
    const response = await fetch(`${env.apiBaseUrl}/subscription/activate-founder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userId ?? 'guest' })
    });
    if (response.status === 409) {
      const soldOut = (await response.json()) as { founderSeatsRemaining?: number };
      return {
        ok: false,
        reason: 'sold_out',
        seatsRemaining: Math.max(0, Number(soldOut.founderSeatsRemaining ?? 0))
      };
    }
    if (!response.ok) {
      const fallbackSeats = await fetchFounderSeatsRemaining();
      return { ok: false, reason: 'failed', seatsRemaining: fallbackSeats };
    }
    const data = (await response.json()) as { founderSeatsRemaining?: number };
    return {
      ok: true,
      seatsRemaining: Math.max(0, Number(data.founderSeatsRemaining ?? DEFAULT_FOUNDER_SEATS))
    };
  } catch {
    const fallbackSeats = await fetchFounderSeatsRemaining();
    return { ok: false, reason: 'failed', seatsRemaining: fallbackSeats };
  }
}

export async function createCheckoutSession(input: {
  userId: string;
  email: string;
  planType: PlanType;
  successUrl?: string;
  cancelUrl?: string;
}): Promise<{ checkoutUrl: string }> {
  const response = await fetch(`${env.apiBaseUrl}/subscription/checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  if (response.status === 409) {
    const soldOut = (await response.json()) as { reason?: string };
    const err = new Error(soldOut.reason ?? 'sold_out');
    (err as Error & { code?: string }).code = 'sold_out';
    throw err;
  }

  if (!response.ok) {
    throw new Error(`Checkout session failed: ${response.status}`);
  }

  const data = (await response.json()) as { checkoutUrl?: string };
  if (!data.checkoutUrl) {
    throw new Error('Checkout URL missing');
  }
  return { checkoutUrl: data.checkoutUrl };
}

export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatusResponse | null> {
  const response = await fetch(`${env.apiBaseUrl}/subscription/status?userId=${encodeURIComponent(userId)}`);
  if (!response.ok) return null;
  return (await response.json()) as SubscriptionStatusResponse;
}

export async function openCustomerPortal(input: { userId: string; returnUrl?: string }): Promise<{ portalUrl: string }> {
  const response = await fetch(`${env.apiBaseUrl}/subscription/customer-portal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  if (!response.ok) {
    throw new Error(`Portal session failed: ${response.status}`);
  }
  const data = (await response.json()) as { portalUrl?: string };
  if (!data.portalUrl) {
    throw new Error('Portal URL missing');
  }
  return { portalUrl: data.portalUrl };
}
