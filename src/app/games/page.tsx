import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';

export const metadata: Metadata = { title: 'TikTok Games — Shady' };

export default function GamesPage() {
  return (
    <>
      <SiteHeader />
      <main className="page">
        <header className="hero">
          <p className="kicker">Shelf</p>
          <h1>TikTok games</h1>
          <p className="lede">
            One-time game keys and drops. Catalog is managed in Supabase — ask staff to stock
            keys, then check out from the legacy shelf or upcoming storefront.
          </p>
          <p>
            <Link href="/pricing">Unlimited subscriptions</Link>
            {' · '}
            <Link href="/dashboard">Dashboard</Link>
          </p>
        </header>
      </main>
    </>
  );
}
