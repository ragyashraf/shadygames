import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import '../pricing/pricing.css';

export const metadata: Metadata = {
  title: 'Welcome — Shady',
};

export default function WelcomePage() {
  return (
    <>
      <SiteHeader />
      <main className="page welcome">
        <h1>You&apos;re in</h1>
        <p className="lede">
          Payment received. Your Unlimited rank unlocks as soon as Paddle confirms the transaction
          via webhook — open your dashboard for status and keys.
        </p>
        <p>
          <Link href="/dashboard">Go to dashboard</Link>
          {' · '}
          <Link href="/pricing">Back to plans</Link>
        </p>
      </main>
    </>
  );
}
