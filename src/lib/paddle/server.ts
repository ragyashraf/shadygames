import { Environment, Paddle } from '@paddle/paddle-node-sdk';
import { getPaddleEnvironment } from '@/lib/paddle-env';

let paddleSingleton: Paddle | null = null;

function requireServerEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required server env var ${name}.`);
  }
  return value;
}

/** Server-only Paddle SDK client (API key). */
export function getPaddleServer(): Paddle {
  if (paddleSingleton) return paddleSingleton;

  const apiKey = requireServerEnv('PADDLE_API_KEY');
  const env = getPaddleEnvironment();
  paddleSingleton = new Paddle(apiKey, {
    environment: env === 'live' ? Environment.production : Environment.sandbox,
  });
  return paddleSingleton;
}

export function getPaddleWebhookSecret(): string {
  return requireServerEnv('PADDLE_WEBHOOK_SECRET');
}

export function getFulfillmentToken(): string {
  return requireServerEnv('SUPABASE_FULFILLMENT_TOKEN');
}
