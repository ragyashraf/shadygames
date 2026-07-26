'use client';

import Link from 'next/link';
import { PricingTable } from '@/components/PricingTable';
import { useLang } from '@/components/LangProvider';
import type { Tier } from '@/lib/tiers';

type Props = {
  tiers: Tier[];
  countryCode?: string;
  customerEmail?: string | null;
  paddleCustomerId?: string | null;
  storeOpen?: boolean;
};

export function PricingView(props: Props) {
  const { t } = useLang();
  return (
    <main className="page">
      <header className="hero">
        <p className="kicker">{t.pricingKicker}</p>
        <h1>{t.pricingTitle}</h1>
        <p className="lede">{t.pricingNote}</p>
      </header>
      <PricingTable {...props} />
    </main>
  );
}

export function WelcomeView() {
  const { t } = useLang();
  return (
    <main className="page welcome">
      <h1>{t.welcomeTitle}</h1>
      <p className="lede">{t.welcomeBody}</p>
      <p>
        <Link href="/dashboard">{t.welcomeDash}</Link>
        {' · '}
        <Link href="/pricing">{t.welcomePlans}</Link>
      </p>
    </main>
  );
}
