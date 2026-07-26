import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { AuthForm } from '@/components/AuthForm';

export const metadata: Metadata = { title: 'Sign up — Shady' };

export default function SignupPage() {
  return (
    <>
      <SiteHeader />
      <main className="auth-page">
        <div className="auth-panel">
          <p className="kicker">Join Unlimited</p>
          <h1>Create account</h1>
          <p className="lede left">
            Continue with Discord, or use the same email you will check out with so Paddle can link
            your subscription.
          </p>
          <Suspense fallback={<p className="empty">Loading…</p>}>
            <AuthForm mode="signup" />
          </Suspense>
          <p className="muted-link">
            <Link href="/pricing">See ranks</Link>
          </p>
        </div>
      </main>
    </>
  );
}
