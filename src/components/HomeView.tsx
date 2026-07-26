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
  signedIn: boolean;
};

export function HomeView({
  tiers,
  countryCode,
  customerEmail,
  paddleCustomerId,
  signedIn,
}: Props) {
  const { t } = useLang();

  return (
    <main>
      <section className="home-page home-hero-section">
        <div className="home-hero">
          <div>
            <p className="kicker">
              <span className="live-dot" /> {t.heroKicker}
            </p>
            <h1>
              <span>SHADY</span>
              <span className="gold-line">{t.heroLine2}</span>
            </h1>
            <p className="lede left">{t.heroBody}</p>
            <div className="dash-actions">
              <a href="#plans" className="gold-btn">
                {t.heroCta1}
              </a>
              <Link href={signedIn ? '/dashboard' : '/signup'} className="ghost-btn">
                {signedIn ? t.heroCta2Dash : t.heroCta2Signup}
              </Link>
            </div>
          </div>
          <div className="home-crest-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/shady-logo.webp" alt="Shady" className="home-crest" />
          </div>
        </div>
      </section>

      <section id="plans" className="page home-plans">
        <header className="hero">
          <p className="kicker">{t.plansKicker}</p>
          <h1>{t.plansTitle}</h1>
          <p className="lede">{t.plansNote}</p>
        </header>
        <PricingTable
          tiers={tiers}
          countryCode={countryCode}
          customerEmail={customerEmail}
          paddleCustomerId={paddleCustomerId}
        />
      </section>

      <section className="home-faq">
        <h2>{t.faqTitle}</h2>
        <div className="faq-grid">
          {t.faqs.map(([q, a]) => (
            <div key={q}>
              <h3>{q}</h3>
              <p>{a}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="home-footer">
        <span>SHADY</span>
        <nav>
          <Link href="/pricing">{t.footerPlans}</Link>
          <Link href="/games">{t.footerGames}</Link>
          <Link href="/terms">{t.footerTerms}</Link>
          <Link href="/privacy">{t.footerPrivacy}</Link>
          <Link href="/refund">{t.footerRefunds}</Link>
          <Link href="/account">{t.footerBilling}</Link>
        </nav>
      </footer>
    </main>
  );
}
