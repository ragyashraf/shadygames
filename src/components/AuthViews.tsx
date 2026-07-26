'use client';

import Link from 'next/link';
import { useLang } from '@/components/LangProvider';
import { AuthForm } from '@/components/AuthForm';
import { Suspense } from 'react';

export function LoginView() {
  const { t } = useLang();
  return (
    <main className="auth-page">
      <div className="auth-panel">
        <p className="kicker">{t.loginKicker}</p>
        <h1>{t.loginTitle}</h1>
        <p className="lede left">{t.loginBody}</p>
        <Suspense fallback={<p className="empty">{t.loading}</p>}>
          <AuthForm mode="login" />
        </Suspense>
        <p className="muted-link">
          <Link href="/pricing">{t.browsePlans}</Link>
        </p>
      </div>
    </main>
  );
}

export function SignupView() {
  const { t } = useLang();
  return (
    <main className="auth-page">
      <div className="auth-panel">
        <p className="kicker">{t.signupKicker}</p>
        <h1>{t.signupTitle}</h1>
        <p className="lede left">{t.signupBody}</p>
        <Suspense fallback={<p className="empty">{t.loading}</p>}>
          <AuthForm mode="signup" />
        </Suspense>
        <p className="muted-link">
          <Link href="/pricing">{t.seeRanks}</Link>
        </p>
      </div>
    </main>
  );
}
