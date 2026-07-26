'use client';

import Link from 'next/link';
import { PortalButton } from '@/components/PortalButton';
import { useLang } from '@/components/LangProvider';
import { getTiers } from '@/lib/tiers';

type Sub = {
  subscription_id: string;
  status: string;
  price_id: string;
  product_id?: string | null;
  scheduled_change_action: string | null;
  current_period_end: string | null;
};

type KeyRow = {
  key_value: string;
  product_sku: string;
  status: string;
  transaction_id: string | null;
};

type Props = {
  email: string;
  displayName: string | null;
  discord: string | null;
  paddleCustomerId: string | null;
  hasAccess: boolean;
  activePriceId: string | null;
  subscriptions: Sub[];
  keys: KeyRow[];
};

function useTierLabel(priceId: string | null): string {
  const { t } = useLang();
  if (!priceId) return t.dashboard;
  const tiers = getTiers();
  const idx = tiers.findIndex(
    (tier) => tier.priceId.month === priceId || tier.priceId.year === priceId
  );
  if (idx < 0) return t.planNames[0];
  return t.planNames[idx as 0 | 1 | 2];
}

export function DashboardView({
  email,
  displayName,
  discord,
  paddleCustomerId,
  hasAccess,
  activePriceId,
  subscriptions,
  keys,
}: Props) {
  const { t } = useLang();
  const title = useTierLabel(hasAccess ? activePriceId : null);

  return (
    <main className="dash-page">
      <header className="dash-hero">
        <div>
          <p className={`status-pill ${hasAccess ? 'on' : 'off'}`}>
            {hasAccess ? t.dashActive : t.dashInactive}
          </p>
          <h1>{hasAccess ? title : t.dashboard}</h1>
          <p className="lede left">
            {displayName
              ? t.dashWelcomeNamed.replace('{name}', displayName)
              : t.dashWelcome}
          </p>
          <div className="dash-actions">
            {paddleCustomerId ? <PortalButton /> : null}
            <Link href="/pricing" className="ghost-btn">
              {hasAccess ? t.changeRank : t.choosePlan}
            </Link>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="dash-crest" src="/shady-logo.webp" alt="" />
      </header>

      <section className="dash-grid">
        <article>
          <h2>{t.accountTitle}</h2>
          <dl>
            <div>
              <dt>{t.email}</dt>
              <dd>{email}</dd>
            </div>
            <div>
              <dt>Discord</dt>
              <dd>{discord ?? '—'}</dd>
            </div>
            <div>
              <dt>{t.paddleCustomer}</dt>
              <dd>{paddleCustomerId ?? t.notLinked}</dd>
            </div>
          </dl>
        </article>

        <article>
          <h2>{t.subscriptionsTitle}</h2>
          {subscriptions.length === 0 ? (
            <p className="empty">{t.noSubs}</p>
          ) : (
            <ul className="stack-list">
              {subscriptions.map((s) => (
                <SubRow key={s.subscription_id} sub={s} />
              ))}
            </ul>
          )}
        </article>

        <article>
          <h2>{t.keysTitle}</h2>
          {keys.length === 0 ? (
            <p className="empty">{t.noKeys}</p>
          ) : (
            <ul className="stack-list">
              {keys.map((k) => (
                <li key={k.key_value}>
                  <code>{k.key_value}</code>
                  <span>
                    {k.product_sku} · {k.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </main>
  );
}

function SubRow({ sub }: { sub: Sub }) {
  const { t } = useLang();
  const label = useTierLabel(sub.price_id);
  return (
    <li>
      <strong>{label}</strong>
      <span>{sub.status}</span>
      {sub.scheduled_change_action ? (
        <span className="muted">
          {t.scheduled}: {sub.scheduled_change_action}
        </span>
      ) : null}
      {sub.current_period_end ? (
        <span className="muted">
          {t.periodEnds} {new Date(sub.current_period_end).toLocaleDateString()}
        </span>
      ) : null}
    </li>
  );
}

type AccountProps = {
  email: string;
  paddleCustomerId: string | null;
  hasAccess: boolean;
  subscriptions: Pick<
    Sub,
    'subscription_id' | 'status' | 'scheduled_change_action'
  >[];
};

export function AccountView({
  email,
  paddleCustomerId,
  hasAccess,
  subscriptions,
}: AccountProps) {
  const { t } = useLang();
  return (
    <main className="dash-page">
      <header className="dash-hero" style={{ gridTemplateColumns: '1fr' }}>
        <div>
          <p className="kicker">{t.billingKicker}</p>
          <h1>{t.billingTitle}</h1>
          <p className="lede left">{t.billingBody}</p>
          <div className="dash-actions">
            {paddleCustomerId ? (
              <PortalButton />
            ) : (
              <Link href="/pricing" className="gold-btn">
                {t.subscribeFirst}
              </Link>
            )}
            <Link href="/dashboard" className="ghost-btn">
              {t.dashboard}
            </Link>
          </div>
        </div>
      </header>

      <section className="dash-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <article>
          <h2>{t.signedIn}</h2>
          <dl>
            <div>
              <dt>{t.email}</dt>
              <dd>{email}</dd>
            </div>
            <div>
              <dt>{t.paddleCustomer}</dt>
              <dd>{paddleCustomerId ?? t.notLinked}</dd>
            </div>
            <div>
              <dt>{t.accessStatus}</dt>
              <dd>{hasAccess ? t.accessOn : t.accessOff}</dd>
            </div>
          </dl>
        </article>
        <article>
          <h2>{t.subscriptionsTitle}</h2>
          {subscriptions.length === 0 ? (
            <p className="empty">{t.noSubs}</p>
          ) : (
            <ul className="stack-list">
              {subscriptions.map((s) => (
                <li key={s.subscription_id}>
                  <code>{s.subscription_id}</code>
                  <span>{s.status}</span>
                  {s.scheduled_change_action ? (
                    <span className="muted">
                      {t.scheduled}: {s.scheduled_change_action}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </main>
  );
}
