import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { GamesView } from '@/components/PageViews';

export const metadata: Metadata = { title: 'TikTok Games — Shady' };

export default function GamesPage() {
  return (
    <>
      <SiteHeader />
      <GamesView />
    </>
  );
}
