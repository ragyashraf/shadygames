import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { SiteHeader } from '@/components/SiteHeader';
import { GamesShop, type ShopGame } from '@/components/GamesShop';
import { createClient } from '@/utils/supabase/server';
import { ensureGamesHavePaddlePrices } from '@/lib/paddle/games-catalog';
import './games.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'TikTok Games — Shady',
  description: 'One-time TikTok games from the Shady shelf.',
};

export default async function GamesPage() {
  const jar = await cookies();
  const supabase = createClient(jar);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: games }, { data: settings }] = await Promise.all([
    supabase
      .from('products')
      .select(
        'id, sku, name, description, price_usd, image_urls, video_urls, paddle_price_id_month, stock'
      )
      .eq('kind', 'game')
      .eq('live', true)
      .order('sort_order'),
    supabase.from('store_settings').select('store_open').eq('id', 1).maybeSingle(),
  ]);

  const withPrices = await ensureGamesHavePaddlePrices((games as ShopGame[]) ?? []);

  return (
    <>
      <SiteHeader />
      <GamesShop
        games={withPrices}
        storeOpen={settings?.store_open !== false}
        customerEmail={user?.email ?? null}
      />
    </>
  );
}
