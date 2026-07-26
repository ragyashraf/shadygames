import Link from 'next/link';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export async function SiteHeader() {
  const jar = await cookies();
  const supabase = createClient(jar);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isStaff = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_staff')
      .eq('id', user.id)
      .maybeSingle();
    isStaff = Boolean(profile?.is_staff);
  }

  return (
    <header className="site-header">
      <Link href="/" className="brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/shady-logo.webp" alt="" width={40} height={40} />
        <span>SHADY</span>
      </Link>
      <nav>
        <Link href="/pricing">Plans</Link>
        <Link href="/games">Games</Link>
        {user ? <Link href="/dashboard">Dashboard</Link> : null}
        {user ? <Link href="/account">Billing</Link> : null}
        {isStaff ? <Link href="/staff">Staff</Link> : null}
      </nav>
      <div className="header-actions">
        {user ? (
          <>
            <span className="user-chip">{user.email}</span>
            <form action="/api/auth/signout" method="post">
              <button type="submit" className="ghost-btn">
                Sign out
              </button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className="ghost-btn">
              Log in
            </Link>
            <Link href="/signup" className="gold-btn">
              Get access
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
