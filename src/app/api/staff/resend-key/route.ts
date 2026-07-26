import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/staff-auth';
import { getTiers } from '@/lib/tiers';

export const runtime = 'nodejs';

function skuForPriceId(priceId: string | null): string | null {
  if (!priceId) return null;
  const tiers = getTiers();
  const map = [
    { sku: 'GTA-ACCESS', ids: [tiers[0].priceId.month, tiers[0].priceId.year] },
    { sku: 'GTA-KING', ids: [tiers[1].priceId.month, tiers[1].priceId.year] },
    { sku: 'GTA-DRAGON', ids: [tiers[2].priceId.month, tiers[2].priceId.year] },
  ];
  return map.find((m) => m.ids.includes(priceId))?.sku ?? null;
}

export async function POST(req: Request) {
  const auth = await requireStaff();
  if ('error' in auth) return auth.error;
  const { supabase } = auth;

  let body: { transactionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const transactionId = body.transactionId?.trim();
  if (!transactionId) {
    return NextResponse.json({ error: 'Missing transactionId' }, { status: 400 });
  }

  const { data: tx } = await supabase
    .from('transactions')
    .select('transaction_id, customer_id, price_id, status')
    .eq('transaction_id', transactionId)
    .maybeSingle();

  if (!tx) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from('access_keys')
    .select('id, key_value, status, product_sku')
    .eq('transaction_id', transactionId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({
      ok: true,
      key: existing.key_value,
      product_sku: existing.product_sku,
      reused: true,
    });
  }

  const sku = skuForPriceId(tx.price_id);
  if (!sku) {
    return NextResponse.json(
      { error: 'No product SKU mapped for this price. Import a key manually.' },
      { status: 422 }
    );
  }

  const { data: available } = await supabase
    .from('access_keys')
    .select('id, key_value, product_sku')
    .eq('product_sku', sku)
    .eq('status', 'available')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!available) {
    return NextResponse.json({ error: `No available keys for ${sku}` }, { status: 409 });
  }

  const { data: updated, error } = await supabase
    .from('access_keys')
    .update({
      status: 'delivered',
      transaction_id: transactionId,
      customer_id: tx.customer_id,
      assigned_to: tx.customer_id,
    })
    .eq('id', available.id)
    .eq('status', 'available')
    .select('id, key_value, product_sku, status, assigned_to, transaction_id')
    .maybeSingle();

  if (error || !updated) {
    return NextResponse.json(
      { error: error?.message || 'Could not assign key' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    key: updated.key_value,
    product_sku: updated.product_sku,
    reused: false,
  });
}
