import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { createClient } from '@/utils/supabase/server';
import { StaffPanel } from '@/components/StaffPanel';
import { StaffHeader } from '@/components/StaffHeader';
import { StaffChat } from '@/components/StaffChat';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Staff — Shady' };

export default async function StaffPage() {
  const jar = await cookies();
  const supabase = createClient(jar);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_staff, display_name')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.is_staff) redirect('/dashboard');

  const [{ data: products }, { data: codes }, { data: keys }, { data: transactions }] =
    await Promise.all([
      supabase.from('products').select('*').order('sort_order'),
      supabase.from('discount_codes').select('*').order('code'),
      supabase
        .from('access_keys')
        .select('id, key_value, product_sku, status, assigned_to, transaction_id')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('transactions')
        .select('transaction_id, customer_id, status, total_cents, currency, price_id')
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

  const productRows = products ?? [];
  const codeRows = codes ?? [];
  const keyRows = keys ?? [];
  const txRows = transactions ?? [];

  return (
    <>
      <SiteHeader />
      <main className="staff-page">
        <StaffHeader />
        <StaffPanel
          products={productRows}
          codes={codeRows}
          keys={keyRows}
          transactions={txRows}
        />
        <StaffChat
          store={{
            products: productRows.map((p) => ({
              name: p.name,
              price_usd: Number(p.price_usd),
              live: Boolean(p.live),
            })),
            codes: codeRows.map((c) => ({
              code: c.code,
              percent: Number(c.percent),
              active: Boolean(c.active),
            })),
            keysAvailable: keyRows.filter((k) => k.status === 'available').length,
            keysTotal: keyRows.length,
            recentTx: txRows.length,
          }}
        />
      </main>
    </>
  );
}
