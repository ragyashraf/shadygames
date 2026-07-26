import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { AuthForm } from '@/components/AuthForm';

export const metadata: Metadata = { title: 'Log in — Shady' };

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="auth-page">
        <div className="auth-panel">
          <p className="kicker">Member access</p>
          <h1>Log in</h1>
          <p className="lede left">
            Sign in with Discord or email to see your Unlimited rank, keys, and billing portal.
          </p>
          <Suspense fallback={<p className="empty">Loading…</p>}>
            <AuthForm mode="login" />
          </Suspense>
          <p className="muted-link">
            <Link href="/pricing">Browse plans</Link>
          </p>
        </div>
      </main>
    </>
  );
}
