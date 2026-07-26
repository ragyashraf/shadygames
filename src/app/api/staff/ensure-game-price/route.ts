import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/staff-auth';
import { ensureGamePaddlePrice } from '@/lib/paddle/games-catalog';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const auth = await requireStaff();
  if ('error' in auth) return auth.error;
  const { supabase } = auth;

  let body: { productId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const productId = body.productId?.trim();
  if (!productId) {
    return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
  }

  const { data: product, error } = await supabase
    .from('products')
    .select('id, sku, name, kind, price_usd, paddle_price_id_month')
    .eq('id', productId)
    .maybeSingle();

  if (error || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  if (product.kind !== 'game') {
    return NextResponse.json({ error: 'Not a game product' }, { status: 400 });
  }

  try {
    const priceId = await ensureGamePaddlePrice(
      {
        id: product.id,
        sku: product.sku,
        name: product.name,
        price_usd: Number(product.price_usd) || 0,
        paddle_price_id_month: product.paddle_price_id_month,
      },
      { resyncAmount: true }
    );

    const { data: updated } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    return NextResponse.json({
      ok: true,
      priceId,
      product: updated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create Paddle price';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
