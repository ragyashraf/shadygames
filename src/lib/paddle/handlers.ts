import { EventName, type EventEntity } from '@paddle/paddle-node-sdk';
import {
  claimAccessKey,
  markEventProcessed,
  upsertCustomer,
  upsertSubscription,
  upsertTransaction,
} from '@/lib/supabase/fulfillment';

type SubLike = {
  id: string;
  status: string;
  customerId: string;
  items: Array<{
    price?: { id?: string; productId?: string } | null;
    product?: { id?: string } | null;
  }>;
  scheduledChange?: { action?: string; effectiveAt?: string } | null;
  currentBillingPeriod?: { endsAt?: string } | null;
};

type CustomerLike = {
  id: string;
  email: string;
};

type TxLike = {
  id: string;
  status: string;
  customerId: string | null;
  currencyCode?: string;
  customData?: unknown;
  details?: {
    totals?: { total?: string | null } | null;
  } | null;
  items: Array<{
    price?: { id?: string } | null;
  }>;
};

function firstPriceProduct(sub: SubLike) {
  const item = sub.items?.[0];
  const priceId = item?.price?.id ?? 'unknown';
  const productId = item?.product?.id ?? item?.price?.productId ?? 'unknown';
  return { priceId, productId };
}

async function handleCustomer(data: CustomerLike) {
  await upsertCustomer(data.id, data.email);
}

async function handleSubscription(data: SubLike) {
  const { priceId, productId } = firstPriceProduct(data);
  await upsertSubscription({
    subscriptionId: data.id,
    customerId: data.customerId,
    status: data.status,
    priceId,
    productId,
    scheduledChangeAction: data.scheduledChange?.action ?? null,
    scheduledChangeAt: data.scheduledChange?.effectiveAt ?? null,
    currentPeriodEnd: data.currentBillingPeriod?.endsAt ?? null,
  });
}

async function handleTransaction(data: TxLike) {
  const priceId = data.items?.[0]?.price?.id ?? null;
  const totalRaw = data.details?.totals?.total;
  const totalCents = totalRaw != null ? Number.parseInt(totalRaw, 10) : null;

  await upsertTransaction({
    transactionId: data.id,
    customerId: data.customerId,
    status: data.status,
    totalCents: Number.isFinite(totalCents as number) ? totalCents : null,
    currency: data.currencyCode ?? null,
    priceId,
    customData: data.customData ?? null,
  });

  if (priceId && data.customerId) {
    await claimAccessKey({
      priceId,
      customerId: data.customerId,
      transactionId: data.id,
      email: null,
    });
  }
}

/**
 * Route a verified Paddle event to idempotent handlers.
 * Returns whether the event was newly processed.
 */
export async function handlePaddleEvent(event: EventEntity): Promise<{
  processed: boolean;
  ignored?: boolean;
}> {
  const eventId = event.eventId;
  const eventType = event.eventType;

  const isNew = await markEventProcessed(eventId, eventType);
  if (!isNew) {
    return { processed: false };
  }

  switch (eventType) {
    case EventName.CustomerCreated:
    case EventName.CustomerUpdated:
      await handleCustomer(event.data as unknown as CustomerLike);
      break;
    case EventName.SubscriptionCreated:
    case EventName.SubscriptionUpdated:
    case EventName.SubscriptionCanceled:
      // Also mirror status-transition events so past_due/paused/etc stay accurate
      await handleSubscription(event.data as unknown as SubLike);
      break;
    case EventName.SubscriptionActivated:
    case EventName.SubscriptionPastDue:
    case EventName.SubscriptionPaused:
    case EventName.SubscriptionResumed:
    case EventName.SubscriptionTrialing:
      await handleSubscription(event.data as unknown as SubLike);
      break;
    case EventName.TransactionCompleted:
      await handleTransaction(event.data as unknown as TxLike);
      break;
    default:
      return { processed: true, ignored: true };
  }

  return { processed: true };
}
