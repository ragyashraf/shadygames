import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { SignupView } from '@/components/AuthViews';

export const metadata: Metadata = { title: 'Sign up — Shady' };

export default function SignupPage() {
  return (
    <>
      <SiteHeader />
      <SignupView />
    </>
  );
}
