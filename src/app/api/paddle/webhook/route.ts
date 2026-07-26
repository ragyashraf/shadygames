import { NextResponse } from 'next/server';
import { getPaddleServer, getPaddleWebhookSecret } from '@/lib/paddle/server';
import { handlePaddleEvent } from '@/lib/paddle/handlers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Paddle webhook endpoint.
 * Must receive the RAW body for signature verification.
 */
export async function POST(request: Request) {
  const signature = request.headers.get('paddle-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing paddle-signature' }, { status: 400 });
  }

  let secret: string;
  try {
    secret = getPaddleWebhookSecret();
  } catch {
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 503 }
    );
  }

  const rawBody = await request.text();
  const paddle = getPaddleServer();

  let event;
  try {
    event = await paddle.webhooks.unmarshal(rawBody, secret, signature);
  } catch (err) {
    console.error('[paddle webhook] signature verification failed', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    const result = await handlePaddleEvent(event);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error('[paddle webhook] handler failed', err);
    // Non-2xx so Paddle retries
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }
}
