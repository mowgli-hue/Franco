import { promises as fs } from 'fs';
import path from 'path';

type PlanType = 'free' | 'founder' | 'pro';
type SubscriptionStatus = 'free' | 'active' | 'canceled' | 'past_due' | 'incomplete';

type SubscriptionProfileRecord = {
  userId: string;
  planType: PlanType;
  subscriptionStatus: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  updatedAt: string;
};

type SubscriptionProfilesState = {
  byUserId: Record<string, SubscriptionProfileRecord>;
  userIdByCustomerId: Record<string, string>;
};

const DATA_DIR = path.resolve(process.cwd(), '.local-data');
const DB_PATH = path.join(DATA_DIR, 'subscription-profiles.json');

let cache: SubscriptionProfilesState | null = null;

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeStatus(raw?: string): SubscriptionStatus {
  if (raw === 'active') return 'active';
  if (raw === 'canceled') return 'canceled';
  if (raw === 'past_due') return 'past_due';
  if (raw === 'incomplete') return 'incomplete';
  return 'free';
}

async function ensureState(): Promise<SubscriptionProfilesState> {
  if (cache) return cache;
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DB_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<SubscriptionProfilesState>;
    cache = {
      byUserId: parsed.byUserId ?? {},
      userIdByCustomerId: parsed.userIdByCustomerId ?? {}
    };
  } catch {
    cache = {
      byUserId: {},
      userIdByCustomerId: {}
    };
  }
  return cache;
}

async function persist(state: SubscriptionProfilesState): Promise<void> {
  cache = state;
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(state, null, 2), 'utf8');
}

export async function getSubscriptionProfile(userId: string): Promise<SubscriptionProfileRecord> {
  const state = await ensureState();
  return (
    state.byUserId[userId] ?? {
      userId,
      planType: 'free',
      subscriptionStatus: 'free',
      updatedAt: nowIso()
    }
  );
}

export async function linkStripeCustomerToUser(userId: string, customerId?: string): Promise<void> {
  if (!customerId) return;
  const state = await ensureState();
  state.userIdByCustomerId[customerId] = userId;
  await persist(state);
}

export async function getUserIdByStripeCustomerId(customerId?: string): Promise<string | null> {
  if (!customerId) return null;
  const state = await ensureState();
  return state.userIdByCustomerId[customerId] ?? null;
}

export async function upsertSubscriptionProfileFromStripe(input: {
  userId: string;
  planType: PlanType;
  subscriptionStatus: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
}): Promise<SubscriptionProfileRecord> {
  const state = await ensureState();
  const next: SubscriptionProfileRecord = {
    userId: input.userId,
    planType: input.planType,
    subscriptionStatus: normalizeStatus(input.subscriptionStatus),
    stripeCustomerId: input.stripeCustomerId,
    stripeSubscriptionId: input.stripeSubscriptionId,
    stripePriceId: input.stripePriceId,
    updatedAt: nowIso()
  };
  state.byUserId[input.userId] = next;
  if (input.stripeCustomerId) {
    state.userIdByCustomerId[input.stripeCustomerId] = input.userId;
  }
  await persist(state);
  return next;
}
