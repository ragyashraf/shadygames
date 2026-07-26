export type PaddlePublicEnv = 'live' | 'sandbox';

/**
 * Read Paddle environment from env. Fails loudly if unset or invalid
 * so we never silently hit the wrong account.
 */
export function getPaddleEnvironment(): PaddlePublicEnv {
  const raw = process.env.NEXT_PUBLIC_PADDLE_ENV;
  if (raw !== 'live' && raw !== 'sandbox') {
    throw new Error(
      `NEXT_PUBLIC_PADDLE_ENV must be set to "live" or "sandbox" (got: ${JSON.stringify(raw)}).`
    );
  }
  return raw;
}

/** Maps our env name to @paddle/paddle-js `environment` option. */
export function getPaddleJsEnvironment(): 'production' | 'sandbox' {
  return getPaddleEnvironment() === 'live' ? 'production' : 'sandbox';
}

export function getPaddleClientToken(): string {
  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  if (!token) {
    throw new Error('Missing NEXT_PUBLIC_PADDLE_CLIENT_TOKEN.');
  }
  const env = getPaddleEnvironment();
  if (env === 'live' && !token.startsWith('live_')) {
    throw new Error('Live environment requires a client token prefixed with live_.');
  }
  if (env === 'sandbox' && !token.startsWith('test_')) {
    throw new Error('Sandbox environment requires a client token prefixed with test_.');
  }
  return token;
}
