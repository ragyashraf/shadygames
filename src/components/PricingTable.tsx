'use client';

import { useEffect, useMemo, useState } from 'react';
import { initializePaddle, type Paddle } from '@paddle/paddle-js';
import type { BillingCycle, Tier } from '@/lib/tiers';
import {
  getPaddleClientToken,
  getPaddleJsEnvironment,
} from '@/lib/paddle-env';

type Props = {
  tiers: Tier[];
  /** ISO country from server headers; omit when unknown so Paddle IP-detects. */
  countryCode?: string;
  /** Prefill when signed in */
  customerEmail?: string | null;
  paddleCustomerId?: string | null;
};

type PriceMap = Record<string, string>;

export function PricingTable({
  tiers,
  countryCode,
  customerEmail,
  paddleCustomerId,
}: Props) {
  const [billing, setBilling] = useState<BillingCycle>('month');
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [prices, setPrices] = useState<PriceMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activePriceIds = useMemo(
    () => tiers.map((t) => t.priceId[billing]),
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
        if (countryCode) {
          request.address = { countryCode };
        }

        const result = await paddle.PricePreview(request);
        if (cancelled) return;

        const next: PriceMap = {};
        for (const item of result.data.details.lineItems) {
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
    if (!paddle) return;
    const priceId = tier.priceId[billing];
    const successUrl =
      typeof window !== 'undefined'
        ? new URL('/welcome', window.location.origin).toString()
        : '/welcome';

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
          Monthly
        </button>
        <button
          type="button"
          className={billing === 'year' ? 'active' : ''}
          onClick={() => setBilling('year')}
        >
          Yearly · save 25%
        </button>
      </div>

      {error ? <p className="error">{error}</p> : null}

      <div className="tier-grid">
        {tiers.map((tier) => {
          const priceId = tier.priceId[billing];
          const label = loading ? '…' : prices[priceId] ?? '—';
          return (
            <article
              key={tier.name}
              className={`tier${tier.featured ? ' featured' : ''}`}
            >
              {tier.featured ? <div className="ribbon">Most popular</div> : null}
              <h2>{tier.name}</h2>
              <p className="desc">{tier.description}</p>
              <div className="price">
                <span className="amount">{label}</span>
                <span className="per">
                  {billing === 'month' ? '/ month' : '/ year'}
                </span>
              </div>
              <ul>
                {tier.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <button
                type="button"
                className="subscribe"
                disabled={!paddle || loading || !prices[priceId]}
                onClick={() => subscribe(tier)}
              >
                Subscribe
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
