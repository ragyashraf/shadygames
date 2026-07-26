import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { SiteHeader } from '@/components/SiteHeader';
import { PricingTable } from '@/components/PricingTable';
import { getRequestCountryCode } from '@/lib/country';
import { getTiers } from '@/lib/tiers';
import { createClient } from '@/utils/supabase/server';
import './pricing/pricing.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Shady — Unlimited GTA V',
  description: 'Unlimited GTA V RP subscriptions — Access, Kingpin, and Dragon ranks.',
};

export default async function HomePage() {
  const tiers = getTiers();
  const countryCode = await getRequestCountryCode();
  const jar = await cookies();
  const supabase = createClient(jar);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let customerEmail = user?.email ?? null;
  let paddleCustomerId: string | null = null;

  if (user) {
    await supabase.rpc('link_my_paddle_customer');
    const { data: customer } = await supabase
      .from('customers')
      .select('customer_id, email')
      .eq('user_id', user.id)
      .maybeSingle();
    paddleCustomerId = customer?.customer_id ?? null;
    customerEmail = customer?.email ?? customerEmail;
  }

  return (
    <>
      <SiteHeader />
      <main>
        <section className="home-page home-hero-section">
          <div className="home-hero">
            <div>
              <p className="kicker">
                <span className="live-dot" /> Live Unlimited server
              </p>
              <h1>
                <span>SHADY</span>
                <span className="gold-line">Unlimited ranks</span>
              </h1>
              <p className="lede left">
                City whitelist, payouts, and Dragon perks — pick Access, Kingpin, or Dragon and get
                in tonight.
              </p>
              <div className="dash-actions">
                <a href="#plans" className="gold-btn">
                  View plans
                </a>
                <Link href={user ? '/dashboard' : '/signup'} className="ghost-btn">
                  {user ? 'Dashboard' : 'Create account'}
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
            <p className="kicker">Ranks</p>
            <h1>Choose your rank</h1>
            <p className="lede">
              Monthly or yearly. Prices localize to your country. Subscribe opens checkout for the
              exact amount shown.
            </p>
          </header>
          <PricingTable
            tiers={tiers}
            countryCode={countryCode}
            customerEmail={customerEmail}
            paddleCustomerId={paddleCustomerId}
          />
        </section>

        <section className="home-faq">
          <h2>FAQ</h2>
          <div className="faq-grid">
            <div>
              <h3>When do I get access?</h3>
              <p>
                As soon as payment clears, your rank and key show on the dashboard. Join Discord
                with the same email you used at checkout.
              </p>
            </div>
            <div>
              <h3>Can I change ranks?</h3>
              <p>
                Yes — open Billing from your account to manage the subscription, or pick a new plan
                here and check out again.
              </p>
            </div>
            <div>
              <h3>TikTok games?</h3>
              <p>
                One-time game keys live on the Games shelf. Unlimited RP ranks are the
                subscriptions on this page.
              </p>
            </div>
          </div>
        </section>

        <footer className="home-footer">
          <span>SHADY</span>
          <nav>
            <Link href="/pricing">Plans</Link>
            <Link href="/games">Games</Link>
            <Link href="/login">Log in</Link>
            <Link href="/account">Billing</Link>
          </nav>
        </footer>
      </main>
    </>
  );
}
