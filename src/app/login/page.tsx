import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { LoginView } from '@/components/AuthViews';

export const metadata: Metadata = { title: 'Log in — Shady' };

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <LoginView />
    </>
  );
}
