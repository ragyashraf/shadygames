import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';

type Props = {
  title: string;
  updated: string;
  children: React.ReactNode;
};

export function LegalDoc({ title, updated, children }: Props) {
  return (
    <>
      <SiteHeader />
      <main className="legal-page">
        <header className="legal-header">
          <p className="kicker">Shady · Legal</p>
          <h1>{title}</h1>
          <p className="legal-updated">Last updated {updated}</p>
        </header>
        <article className="legal-body">{children}</article>
        <footer className="home-footer legal-footer">
          <span>SHADY</span>
          <nav>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/refund">Refunds</Link>
            <Link href="/">Home</Link>
          </nav>
        </footer>
      </main>
    </>
  );
}
