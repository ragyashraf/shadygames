import { getPaddleServer } from '@/lib/paddle/server';
import { createFulfillmentClient } from '@/lib/supabase/fulfillment';
import { getFulfillmentToken } from '@/lib/paddle/server';

/** Live Paddle catalog product for one-time TikTok games. */
export const PADDLE_GAMES_PRODUCT_ID =
  process.env.PADDLE_GAMES_PRODUCT_ID || 'pro_01kygdffxq0mbazaykmms94spm';

export type GamePriceInput = {
  id: string;
  sku: string;
  name: string;
  price_usd: number;
  paddle_price_id_month: string | null;
};

function usdToCents(priceUsd: number) {
  return String(Math.max(0, Math.round(Number(priceUsd) * 100)));
}

async function persistPriceId(productId: string, priceId: string) {
  const supabase = createFulfillmentClient();
  const { data, error } = await supabase.rpc('fulfill_set_game_paddle_price', {
    p_token: getFulfillmentToken(),
    p_product_id: productId,
    p_price_id: priceId,
  });
  if (error) throw error;
  if (!data) throw new Error('Failed to save Paddle price on game product');
}

async function createOneTimePrice(game: GamePriceInput) {
  const paddle = getPaddleServer();
  const amount = usdToCents(game.price_usd);
  const price = await paddle.prices.create({
    productId: PADDLE_GAMES_PRODUCT_ID,
    description: `TikTok game ${game.sku}`,
    name: `${game.name} · one-time`,
    unitPrice: {
      amount,
      currencyCode: 'USD',
    },
    quantity: { minimum: 1, maximum: 1 },
    customData: {
      brand: 'Shady',
      kind: 'game',
      sku: game.sku,
      product_id: game.id,
      price_usd: String(game.price_usd),
    },
  });
  return price.id;
}

/**
 * Ensure a catalog game has a matching one-time Paddle price.
 * Creates a new price when missing or when the USD amount changed.
 */
export async function ensureGamePaddlePrice(game: GamePriceInput): Promise<string> {
  const amount = usdToCents(game.price_usd);
  const paddle = getPaddleServer();

  if (game.paddle_price_id_month) {
    try {
      const existing = await paddle.prices.get(game.paddle_price_id_month);
      if (existing.unitPrice?.amount === amount && existing.status === 'active') {
        return existing.id;
      }
    } catch {
      // Missing/invalid — create a fresh price below.
    }
  }

  const priceId = await createOneTimePrice(game);
  await persistPriceId(game.id, priceId);
  return priceId;
}

/** Ensure every live game in a list has a checkout-ready Paddle price. */
export async function ensureGamesHavePaddlePrices<T extends GamePriceInput>(
  games: T[]
): Promise<T[]> {
  const out: T[] = [];
  for (const game of games) {
    try {
      const priceId = await ensureGamePaddlePrice(game);
      out.push({ ...game, paddle_price_id_month: priceId });
    } catch (err) {
      console.error('[ensureGamesHavePaddlePrices]', game.sku, err);
      out.push(game);
    }
  }
  return out;
}
