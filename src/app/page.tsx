import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';

export const metadata: Metadata = {
  title: 'Shady — Unlimited GTA V',
  description: 'Unlimited GTA V RP subscriptions and TikTok game keys.',
};

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="home-page">
        <section className="home-hero">
          <div>
            <p className="kicker">
              <span className="live-dot" /> Live Unlimited server
            </p>
            <h1>
              <span>SHADY</span>
              <span className="gold-line">Unlimited ranks</span>
            </h1>
            <p className="lede left">
              Subscribe to Access, Kingpin, or Dragon. Billing runs on Paddle. Your account, keys,
              and subscription state live on Supabase.
            </p>
            <div className="dash-actions">
              <Link href="/pricing" className="gold-btn">
                View plans
              </Link>
              <Link href="/signup" className="ghost-btn">
                Create account
              </Link>
            </div>
          </div>
          <div className="home-crest-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/shady-logo.webp" alt="Shady" className="home-crest" />
          </div>
        </section>
      </main>
    </>
  );
}
