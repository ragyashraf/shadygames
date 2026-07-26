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

function formatUsd(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: Number.isInteger(n) ? 0 : 2,
  }).format(n);
}

export function GamesShop({ games, storeOpen = true, customerEmail }: Props) {
  const { t, ar } = useLang();
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<ShopGame | null>(games[0] ?? null);
  const [shot, setShot] = useState(0);

  useEffect(() => {
    setActive(games[0] ?? null);
    setShot(0);
  }, [games]);

  useEffect(() => {
    setShot(0);
  }, [active?.id]);

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

  const images = active?.image_urls?.filter(Boolean) ?? [];
  const cover = images[shot] || images[0] || null;
  const videos = active?.video_urls?.filter(Boolean) ?? [];

  return (
    <main className={`games-page${ar ? ' rtl' : ''}`}>
      <section className="games-stage">
        <div
          className="games-stage-bg"
          style={cover ? { backgroundImage: `url(${cover})` } : undefined}
          aria-hidden
        />
        <div className="games-stage-shade" aria-hidden />

        <div className="games-stage-inner">
          <header className="games-intro">
            <p className="games-brand">SHADY</p>
            <p className="kicker">{t.gamesKicker}</p>
            <h1>{t.gamesTitle}</h1>
            <p className="games-lede">{t.gamesBody}</p>
          </header>

          {error ? <p className="games-error">{error}</p> : null}
          {!storeOpen ? <p className="games-error">{t.gamesClosed}</p> : null}

          {games.length === 0 ? (
            <div className="games-empty-panel">
              <p>{t.gamesEmpty}</p>
              <div className="games-cta-row">
                <Link href="/pricing" className="ghost-btn">
                  {t.gamesLinkPlans}
                </Link>
                <Link href="/dashboard" className="ghost-btn">
                  {t.gamesLinkDash}
                </Link>
              </div>
            </div>
          ) : active ? (
            <div className="games-feature" key={active.id}>
              <div className="games-feature-art">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt={active.name} />
                ) : (
                  <div className="games-feature-fallback">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/shady-logo.webp" alt="" />
                    <span>{active.name}</span>
                  </div>
                )}
                {images.length > 1 ? (
                  <div className="games-shots" role="tablist" aria-label="Screenshots">
                    {images.map((url, i) => (
                      <button
                        key={url}
                        type="button"
                        role="tab"
                        aria-selected={shot === i}
                        className={shot === i ? 'on' : ''}
                        onClick={() => setShot(i)}
                        style={{ backgroundImage: `url(${url})` }}
                      />
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="games-feature-copy">
                <p className="games-sku">{active.sku}</p>
                <h2>{active.name}</h2>
                <p className="games-desc">{active.description || t.gamesNoDesc}</p>
                <div className="games-price-row">
                  <strong>{formatUsd(Number(active.price_usd))}</strong>
                  <span>{t.gamesOnce}</span>
                </div>
                <div className="games-cta-row">
                  <button
                    type="button"
                    className="gold-btn"
                    disabled={!storeOpen || busyId === active.id}
                    onClick={() => buy(active)}
                  >
                    {busyId === active.id ? t.pleaseWait : t.gamesBuy}
                  </button>
                  <Link href="/pricing" className="ghost-btn">
                    {t.gamesLinkPlans}
                  </Link>
                </div>
                {!active.paddle_price_id_month ? (
                  <p className="games-hint">{t.gamesNoPrice}</p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {games.length > 1 ? (
        <section className="games-shelf">
          <div className="games-shelf-head">
            <h3>{t.gamesShelf}</h3>
            <p>{t.gamesShelfHint}</p>
          </div>
          <div className="games-rail">
            {games.map((game) => {
              const thumb = game.image_urls?.[0];
              const selected = active?.id === game.id;
              return (
                <button
                  key={game.id}
                  type="button"
                  className={`games-rail-item${selected ? ' selected' : ''}`}
                  onClick={() => setActive(game)}
                  aria-pressed={selected}
                >
                  <div
                    className="games-rail-art"
                    style={thumb ? { backgroundImage: `url(${thumb})` } : undefined}
                  >
                    {!thumb ? (
                      <span>{game.name.slice(0, 2).toUpperCase()}</span>
                    ) : null}
                  </div>
                  <div className="games-rail-meta">
                    <strong>{game.name}</strong>
                    <span>{formatUsd(Number(game.price_usd))}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {active && videos.length > 0 ? (
        <section className="games-media">
          <h3>{t.gamesWatch}</h3>
          <div className="games-videos">
            {videos.map((url) =>
              url.includes('youtube.com') ||
              url.includes('youtu.be') ||
              url.includes('vimeo.com') ? (
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
        </section>
      ) : null}
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
