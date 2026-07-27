'use client';

import { useEffect, useMemo, useState } from 'react';
import { initializePaddle, type Paddle } from '@paddle/paddle-js';
import type { BillingCycle, Tier } from '@/lib/tiers';
import {
  getPaddleClientToken,
  getPaddleJsEnvironment,
} from '@/lib/paddle-env';
import { useLang } from '@/components/LangProvider';

type Props = {
  tiers: Tier[];
  /** ISO country from server headers; omit when unknown so Paddle IP-detects. */
  countryCode?: string;
  /** Prefill when signed in */
  customerEmail?: string | null;
  paddleCustomerId?: string | null;
  /** When false, Subscribe is disabled (staff closed the store). */
  storeOpen?: boolean;
};

type PriceMap = Record<string, string>;

const TIER_INDEX: Record<Tier['name'], 0 | 1 | 2> = {
  Starter: 0,
  Pro: 1,
  Advanced: 2,
};

export function PricingTable({
  tiers,
  countryCode,
  customerEmail,
  paddleCustomerId,
  storeOpen = true,
}: Props) {
  const { t, ar } = useLang();
  const [billing, setBilling] = useState<BillingCycle>('month');
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [prices, setPrices] = useState<PriceMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activePriceIds = useMemo(
    () => tiers.map((tier) => tier.priceId[billing]),
    [tiers, billing]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const instance = await initializePaddle({
          environment: getPaddleJsEnvironment(),
          token: getPaddleClientToken(),
          ...(paddleCustomerId
            ? { pwCustomer: { id: paddleCustomerId } }
            : {}),
        });
        if (!cancelled && instance) setPaddle(instance);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to initialize Paddle');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [paddleCustomerId]);

  useEffect(() => {
    if (!paddle) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const request: {
          items: { priceId: string; quantity: number }[];
          address?: { countryCode: string };
        } = {
          items: activePriceIds.map((priceId) => ({ priceId, quantity: 1 })),
        };
        // Only pass a real ISO country. Never send sentinels like OTHERS.
        if (countryCode) {
          request.address = { countryCode };
        }

        const result = await paddle.PricePreview(request);
        if (cancelled) return;

        const next: PriceMap = {};
        for (const item of result.data.details.lineItems) {
          // Display Paddle's formatted total only — no frontend price math.
          next[item.price.id] = item.formattedTotals.total;
        }
        setPrices(next);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load localized prices');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [paddle, activePriceIds, countryCode]);

  function subscribe(tier: Tier) {
    if (!paddle || !storeOpen) return;
    const priceId = tier.priceId[billing];
    if (!prices[priceId]) return;

    const successUrl = new URL('/welcome', window.location.origin).toString();

    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      ...(customerEmail ? { customer: { email: customerEmail } } : {}),
      settings: {
        displayMode: 'overlay',
        variant: 'one-page',
        successUrl,
        allowLogout: false,
      },
    });
  }

  return (
    <div className="pricing">
      <div className="billing-toggle" role="group" aria-label="Billing cycle">
        <button
          type="button"
          className={billing === 'month' ? 'active' : ''}
          onClick={() => setBilling('month')}
        >
          {t.monthly}
        </button>
        <button
          type="button"
          className={billing === 'year' ? 'active' : ''}
          onClick={() => setBilling('year')}
        >
          {t.yearly}
        </button>
      </div>

      {error ? <p className="error">{error}</p> : null}
      {!storeOpen ? (
        <p className="error">Checkout is temporarily closed. Check back soon.</p>
      ) : null}

      <div className="tier-grid">
        {tiers.map((tier) => {
          const idx = TIER_INDEX[tier.name];
          const priceId = tier.priceId[billing];
          const label = loading ? '…' : prices[priceId] ?? '—';
          const description = ar ? t.planPitches[idx] : tier.description;
          const features = ar ? t.planPerks[idx] : tier.features;
          return (
            <article
              key={tier.name}
              className={`tier${tier.featured ? ' featured' : ''}`}
            >
              {tier.featured ? <div className="ribbon">{t.ribbonPopular}</div> : null}
              <h2>{t.planNames[idx]}</h2>
              <p className="desc">{description}</p>
              <div className="price">
                <span className="amount">{label}</span>
                <span className="per">
                  {billing === 'month' ? t.perMonth : t.perYear}
                </span>
              </div>
              <ul>
                {features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <button
                type="button"
                className="subscribe"
                disabled={!paddle || loading || !prices[priceId] || !storeOpen}
                onClick={() => subscribe(tier)}
              >
                {t.subscribe}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
