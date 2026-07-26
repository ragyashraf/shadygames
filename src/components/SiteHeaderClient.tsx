'use client';

import Link from 'next/link';
import { LangToggle } from '@/components/LangToggle';
import { useLang } from '@/components/LangProvider';

type Props = {
  email: string | null;
  isStaff: boolean;
  signedIn: boolean;
};

export function SiteHeaderClient({ email, isStaff, signedIn }: Props) {
  const { t } = useLang();

  return (
    <header className="site-header">
      <Link href="/" className="brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/shady-logo.webp" alt="" width={40} height={40} />
        <span>SHADY</span>
      </Link>
      <nav>
        <a href="/#plans">{t.navPlans}</a>
        <Link href="/games">{t.navGames}</Link>
        {signedIn ? <Link href="/dashboard">{t.navDashboard}</Link> : null}
        {signedIn ? <Link href="/account">{t.navBilling}</Link> : null}
        {isStaff ? <Link href="/staff">{t.navStaff}</Link> : null}
      </nav>
      <div className="header-actions">
        <LangToggle />
        {signedIn ? (
          <>
            <span className="user-chip">{email}</span>
            <form action="/api/auth/signout" method="post">
              <button type="submit" className="ghost-btn">
                {t.signOut}
              </button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className="ghost-btn">
              {t.login}
            </Link>
            <Link href="/signup" className="gold-btn">
              {t.getAccess}
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
