'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { initializePaddle, type Paddle } from '@paddle/paddle-js';
import { useLang } from '@/components/LangProvider';
import {
  getPaddleClientToken,
  getPaddleJsEnvironment,
} from '@/lib/paddle-env';

export type ShopGame = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price_usd: number;
  image_urls: string[] | null;
  video_urls: string[] | null;
  paddle_price_id_month: string | null;
  stock: number | null;
};

type Props = {
  games: ShopGame[];
  storeOpen?: boolean;
  customerEmail?: string | null;
};

export function GamesShop({ games, storeOpen = true, customerEmail }: Props) {
  const { t, ar } = useLang();
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<ShopGame | null>(games[0] ?? null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const instance = await initializePaddle({
          environment: getPaddleJsEnvironment(),
          token: getPaddleClientToken(),
        });
        if (!cancelled && instance) setPaddle(instance);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Paddle failed to load');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function buy(game: ShopGame) {
    setError(null);
    if (!storeOpen) {
      setError(t.gamesClosed);
      return;
    }
    if (!game.paddle_price_id_month) {
      setError(t.gamesNoPrice);
      return;
    }
    if (!paddle) {
      setError(t.gamesPaddleWait);
      return;
    }
    setBusyId(game.id);
    const successUrl = new URL('/welcome', window.location.origin).toString();
    paddle.Checkout.open({
      items: [{ priceId: game.paddle_price_id_month, quantity: 1 }],
      ...(customerEmail ? { customer: { email: customerEmail } } : {}),
      settings: {
        displayMode: 'overlay',
        variant: 'one-page',
        successUrl,
        allowLogout: false,
      },
    });
    setBusyId(null);
  }

  return (
    <main className={`games-shop${ar ? ' rtl' : ''}`}>
      <header className="games-hero">
        <p className="kicker">{t.gamesKicker}</p>
        <h1>{t.gamesTitle}</h1>
        <p className="lede">{t.gamesBody}</p>
        <p className="games-links">
          <Link href="/pricing">{t.gamesLinkPlans}</Link>
          {' · '}
          <Link href="/dashboard">{t.gamesLinkDash}</Link>
        </p>
      </header>

      {error ? <p className="games-error">{error}</p> : null}
      {!storeOpen ? <p className="games-error">{t.gamesClosed}</p> : null}

      {games.length === 0 ? (
        <p className="games-empty">{t.gamesEmpty}</p>
      ) : (
        <div className="games-layout">
          <div className="games-grid">
            {games.map((game) => {
              const cover = game.image_urls?.[0];
              const selected = active?.id === game.id;
              return (
                <button
                  key={game.id}
                  type="button"
                  className={`game-card${selected ? ' selected' : ''}`}
                  onClick={() => setActive(game)}
                >
                  <div
                    className="game-card-art"
                    style={
                      cover
                        ? { backgroundImage: `url(${cover})` }
                        : undefined
                    }
                  >
                    {!cover ? <span>{game.name.slice(0, 2).toUpperCase()}</span> : null}
                  </div>
                  <div className="game-card-body">
                    <h2>{game.name}</h2>
                    <p>{game.description || t.gamesNoDesc}</p>
                    <div className="game-card-meta">
                      <strong>${Number(game.price_usd).toFixed(0)}</strong>
                      <span>{t.gamesOnce}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {active ? (
            <aside className="game-detail">
              <div className="game-detail-media">
                {active.image_urls?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={active.image_urls[0]} alt={active.name} />
                ) : (
                  <div className="game-detail-placeholder">{active.name}</div>
                )}
              </div>
              <h2>{active.name}</h2>
              <p className="game-detail-desc">{active.description || t.gamesNoDesc}</p>
              <div className="game-detail-price">
                <strong>${Number(active.price_usd).toFixed(0)}</strong>
                <span>{t.gamesOnce}</span>
              </div>

              {active.image_urls && active.image_urls.length > 1 ? (
                <div className="game-thumbs">
                  {active.image_urls.map((url) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={url} src={url} alt="" />
                  ))}
                </div>
              ) : null}

              {active.video_urls && active.video_urls.length > 0 ? (
                <div className="game-videos">
                  {active.video_urls.map((url) =>
                    url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com') ? (
                      <iframe
                        key={url}
                        src={embedVideo(url)}
                        title={active.name}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video key={url} src={url} controls playsInline />
                    )
                  )}
                </div>
              ) : null}

              <button
                type="button"
                className="gold-btn wide"
                disabled={!storeOpen || busyId === active.id}
                onClick={() => buy(active)}
              >
                {busyId === active.id ? t.pleaseWait : t.gamesBuy}
              </button>
              {!active.paddle_price_id_month ? (
                <p className="game-hint">{t.gamesNoPrice}</p>
              ) : null}
            </aside>
          ) : null}
        </div>
      )}
    </main>
  );
}

function embedVideo(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    /* ignore */
  }
  return url;
}
