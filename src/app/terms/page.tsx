import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalDoc } from '@/components/LegalDoc';

export const metadata: Metadata = {
  title: 'Terms of Service — Shady',
  description: 'Terms of service for Shady Unlimited GTA V subscriptions and digital products.',
};

const UPDATED = '26 July 2026';

export default function TermsPage() {
  return (
    <LegalDoc title="Terms of Service" updated={UPDATED}>
      <p>
        These Terms of Service (“Terms”) govern your access to and use of the Shady website, Discord
        integrations, and digital products (together, the “Service”), including Unlimited GTA V RP
        subscription ranks and any one-time game keys sold through this site.
      </p>
      <p>
        By creating an account, completing a purchase, or using the Service, you agree to these
        Terms. If you do not agree, do not use the Service.
      </p>

      <h2>1. Who we are</h2>
      <p>
        The Service is operated by Shady (“we”, “us”, “our”). Payments for subscriptions and digital
        goods are processed by Paddle as Merchant of Record. Paddle’s buyer terms also apply to your
        purchase.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least 18 years old (or the age of digital majority where you live) to create
        an account or buy a subscription. You are responsible for keeping your login credentials
        secure and for activity under your account.
      </p>

      <h2>3. The Service</h2>
      <p>
        Shady sells digital access products for community game servers and related perks (for
        example whitelist ranks, in-game benefits, Discord roles, and game keys). Features for each
        plan are described on the pricing and product pages at the time of purchase and may change
        as the server evolves.
      </p>
      <p>
        Access is provisional on successful payment, webhook confirmation, and compliance with
        these Terms and the community rules of the Unlimited / Shady Discord and game servers.
      </p>

      <h2>4. Accounts and linking</h2>
      <p>
        To receive rank fulfillment you should use the same email at checkout and when signing in
        (including Discord OAuth). We may link your Paddle customer record to your account so you
        can manage billing and view subscription status on the dashboard.
      </p>

      <h2>5. Subscriptions and billing</h2>
      <ul>
        <li>
          Subscriptions renew automatically at the end of each billing period (monthly or yearly)
          until cancelled.
        </li>
        <li>
          Prices shown at checkout include applicable taxes where Paddle calculates them for your
          location.
        </li>
        <li>
          You can manage payment methods, invoices, and cancellation through the customer billing
          portal linked from your{' '}
          <Link href="/account">Account</Link> page.
        </li>
        <li>
          Cancelling stops future renewals. You keep access until the end of the paid period unless
          we suspend the account for a Terms or community-rules violation.
        </li>
      </ul>

      <h2>6. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Share, resell, or transfer subscription access, keys, or accounts without our written permission.</li>
        <li>Cheat, exploit, harass players or staff, or disrupt server operations.</li>
        <li>Attempt unauthorized access to our systems, APIs, or other users’ accounts.</li>
        <li>Use the Service for any unlawful purpose.</li>
      </ul>
      <p>
        We may suspend or terminate access without refund when we reasonably believe you have
        breached these Terms or community rules. Serious or repeated abuse may result in a permanent
        ban from the Service.
      </p>

      <h2>7. Digital goods</h2>
      <p>
        Subscriptions and keys are digital goods. Delivery begins when payment is confirmed and
        access or a key is made available in your dashboard or Discord. See our{' '}
        <Link href="/refund">Refund Policy</Link> for how refunds work.
      </p>

      <h2>8. Availability</h2>
      <p>
        We aim for high uptime but do not guarantee uninterrupted service. Scheduled maintenance,
        outages, game updates, or third-party failures (hosting, Discord, payment processors) may
        affect availability. We are not liable for temporary downtime outside our reasonable
        control.
      </p>

      <h2>9. Intellectual property</h2>
      <p>
        Shady branding, site content, and custom assets we create remain our property. Grand Theft
        Auto and related marks belong to their respective owners. We are not affiliated with or
        endorsed by Take-Two Interactive or Rockstar Games.
      </p>

      <h2>10. Disclaimers</h2>
      <p>
        The Service is provided “as is” and “as available.” To the fullest extent permitted by law,
        we disclaim warranties of merchantability, fitness for a particular purpose, and
        non-infringement. Nothing in these Terms limits rights you cannot waive under consumer law.
      </p>

      <h2>11. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, our total liability arising from the Service or a
        purchase is limited to the amount you paid us for the relevant product in the 12 months
        before the claim. We are not liable for indirect, incidental, special, or consequential
        damages, or loss of data, profits, or goodwill.
      </p>

      <h2>12. Changes</h2>
      <p>
        We may update these Terms by posting a new version on this page with a revised “Last
        updated” date. Continued use after changes means you accept the updated Terms. Material
        changes to paid subscriptions will be communicated where required by law.
      </p>

      <h2>13. Contact</h2>
      <p>
        Questions about these Terms: open a support ticket in the official Shady / Unlimited Discord
        using the email on your purchase, or manage billing via{' '}
        <Link href="/account">Account</Link>. Privacy details are in our{' '}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </LegalDoc>
  );
}
