import { NextResponse } from 'next/server';
import { getPaddleServer } from '@/lib/paddle/server';
import { requireStaff } from '@/lib/staff-auth';

export const runtime = 'nodejs';

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

  const { data: tx, error: txErr } = await supabase
    .from('transactions')
    .select('transaction_id, status')
    .eq('transaction_id', transactionId)
    .maybeSingle();

  if (txErr || !tx) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
  }

  if (String(tx.status).includes('refund')) {
    return NextResponse.json({ error: 'Already refunded' }, { status: 409 });
  }

  try {
    const paddle = getPaddleServer();
    await paddle.adjustments.create({
      action: 'refund',
      type: 'full',
      reason: 'Staff dashboard refund',
      transactionId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Paddle refund failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const { error: updErr } = await supabase
    .from('transactions')
    .update({ status: 'refunded' })
    .eq('transaction_id', transactionId);

  if (updErr) {
    return NextResponse.json(
      { error: `Refunded in Paddle, but local update failed: ${updErr.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, status: 'refunded' });
}
