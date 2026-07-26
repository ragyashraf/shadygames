import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { WelcomeView } from '@/components/PageViews';

export const metadata: Metadata = {
  title: 'Welcome — Shady',
};

export default function WelcomePage() {
  return (
    <>
      <SiteHeader />
      <WelcomeView />
    </>
  );
}
