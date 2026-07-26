import type { Metadata } from 'next';
import Script from 'next/script';
import { Anton, Barlow, Cairo } from 'next/font/google';
import { LangProvider } from '@/components/LangProvider';
import { LANG_STORAGE_KEY } from '@/lib/i18n/copy';
import './globals.css';
import './pricing/pricing.css';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-display' });
const barlow = Barlow({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-body',
});
const cairo = Cairo({
  weight: ['400', '600', '700', '900'],
  subsets: ['arabic', 'latin'],
  variable: '--font-ar',
});

export const metadata: Metadata = {
  title: 'Shady',
  description: 'Unlimited GTA V subscriptions',
};

const langBootScript = `
(function(){try{var k=${JSON.stringify(LANG_STORAGE_KEY)};var l=localStorage.getItem(k);if(l!=='ar'&&l!=='en'){var m=document.cookie.match(/(?:^|; )shady-lang=([^;]*)/);l=m?decodeURIComponent(m[1]):'en';}if(l!=='ar'&&l!=='en')l='en';document.documentElement.lang=l;document.documentElement.dir=l==='ar'?'rtl':'ltr';document.documentElement.dataset.lang=l;}catch(e){}})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${barlow.variable} ${cairo.variable}`}
      suppressHydrationWarning
    >
      <body className={`${anton.variable} ${barlow.variable} ${cairo.variable}`}>
        <Script id="shady-lang-boot" strategy="beforeInteractive">
          {langBootScript}
        </Script>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
