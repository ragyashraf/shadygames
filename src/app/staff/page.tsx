import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { StaffDashboard, type StoreSettings } from '@/components/StaffDashboard';
import './staff.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Staff — Shady' };

const DEFAULT_SETTINGS: StoreSettings = {
  store_open: true,
  accept_crypto: true,
  discounts_enabled: true,
  auto_whitelist: true,
  arabic_default: false,
  auto_deliver: true,
  rule_instant_delivery: true,
  rule_low_stock_alert: true,
  rule_fraud_hold: false,
  server_slots: 220,
};

export default async function StaffPage() {
  const jar = await cookies();
  const supabase = createClient(jar);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_staff, display_name, email')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.is_staff) redirect('/dashboard');

  const [
    { data: products },
    { data: codes },
    { data: keys },
    { data: transactions },
    { count: activeSubs },
    { data: staffMembers },
    { data: settingsRow },
  ] = await Promise.all([
    supabase.from('products').select('*').order('sort_order'),
    supabase.from('discount_codes').select('*').order('code'),
    supabase
      .from('access_keys')
      .select('id, key_value, product_sku, status, assigned_to, transaction_id')
      .order('created_at', { ascending: false })
      .limit(200),
    supabase
      .from('transactions')
      .select(
        'transaction_id, customer_id, status, total_cents, currency, price_id, created_at'
      )
      .order('created_at', { ascending: false })
      .limit(200),
    supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'trialing', 'past_due']),
    supabase
      .from('profiles')
      .select('id, display_name, email, is_staff')
      .eq('is_staff', true)
      .order('display_name'),
    supabase.from('store_settings').select('*').eq('id', 1).maybeSingle(),
  ]);

  const settings: StoreSettings = {
    ...DEFAULT_SETTINGS,
    ...(settingsRow
      ? {
          store_open: Boolean(settingsRow.store_open),
          accept_crypto: Boolean(settingsRow.accept_crypto),
          discounts_enabled: Boolean(settingsRow.discounts_enabled),
          auto_whitelist: Boolean(settingsRow.auto_whitelist),
          arabic_default: Boolean(settingsRow.arabic_default),
          auto_deliver: Boolean(settingsRow.auto_deliver),
          rule_instant_delivery: Boolean(settingsRow.rule_instant_delivery),
          rule_low_stock_alert: Boolean(settingsRow.rule_low_stock_alert),
          rule_fraud_hold: Boolean(settingsRow.rule_fraud_hold),
          server_slots: Number(settingsRow.server_slots) || 220,
        }
      : {}),
  };

  return (
    <StaffDashboard
      ownerName={profile.display_name || profile.email || user.email || 'Staff'}
      ownerEmail={user.email || profile.email || ''}
      products={products ?? []}
      codes={codes ?? []}
      keys={keys ?? []}
      transactions={transactions ?? []}
      activeSubs={activeSubs ?? 0}
      staffMembers={staffMembers ?? []}
      settings={settings}
    />
  );
}
