import { createClient } from '@supabase/supabase-js';
import { getFulfillmentToken } from '@/lib/paddle/server';

function getPublishableKey(): string {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
  }
  return key;
}

/** Browser-safe key client used only to invoke SECURITY DEFINER fulfillment RPCs. */
export function createFulfillmentClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL.');
  return createClient(url, getPublishableKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function markEventProcessed(eventId: string, eventType: string) {
  const supabase = createFulfillmentClient();
  const { data, error } = await supabase.rpc('fulfill_mark_event', {
    p_token: getFulfillmentToken(),
    p_event_id: eventId,
    p_event_type: eventType,
  });
  if (error) throw error;
  return Boolean(data);
}

/** Undo mark so Paddle retries can re-run a failed handler. */
export async function unmarkEventProcessed(eventId: string) {
  const supabase = createFulfillmentClient();
  const { error } = await supabase.rpc('fulfill_unmark_event', {
    p_token: getFulfillmentToken(),
    p_event_id: eventId,
  });
  if (error) throw error;
}

export async function upsertCustomer(customerId: string, email: string) {
  const supabase = createFulfillmentClient();
  const { error } = await supabase.rpc('fulfill_upsert_customer', {
    p_token: getFulfillmentToken(),
    p_customer_id: customerId,
    p_email: email,
  });
  if (error) throw error;
}

export async function upsertSubscription(input: {
  subscriptionId: string;
  customerId: string;
  status: string;
  priceId: string;
  productId: string;
  scheduledChangeAction: string | null;
  scheduledChangeAt: string | null;
  currentPeriodEnd: string | null;
}) {
  const supabase = createFulfillmentClient();
  const { error } = await supabase.rpc('fulfill_upsert_subscription', {
    p_token: getFulfillmentToken(),
    p_subscription_id: input.subscriptionId,
    p_customer_id: input.customerId,
    p_status: input.status,
    p_price_id: input.priceId,
    p_product_id: input.productId,
    p_scheduled_change_action: input.scheduledChangeAction,
    p_scheduled_change_at: input.scheduledChangeAt,
    p_current_period_end: input.currentPeriodEnd,
  });
  if (error) throw error;
}

export async function upsertTransaction(input: {
  transactionId: string;
  customerId: string | null;
  status: string;
  totalCents: number | null;
  currency: string | null;
  priceId: string | null;
  customData: unknown;
}) {
  const supabase = createFulfillmentClient();
  const { error } = await supabase.rpc('fulfill_upsert_transaction', {
    p_token: getFulfillmentToken(),
    p_transaction_id: input.transactionId,
    p_customer_id: input.customerId,
    p_status: input.status,
    p_total_cents: input.totalCents,
    p_currency: input.currency,
    p_price_id: input.priceId,
    p_custom_data: input.customData,
  });
  if (error) throw error;
}

export async function claimAccessKey(input: {
  priceId: string;
  customerId: string | null;
  transactionId: string;
  email: string | null;
}) {
  const supabase = createFulfillmentClient();
  const { data, error } = await supabase.rpc('fulfill_claim_access_key', {
    p_token: getFulfillmentToken(),
    p_price_id: input.priceId,
    p_customer_id: input.customerId,
    p_transaction_id: input.transactionId,
    p_email: input.email,
  });
  if (error) throw error;
  return (data as string | null) ?? null;
}
