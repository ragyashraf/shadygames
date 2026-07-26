import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalDoc } from '@/components/LegalDoc';

export const metadata: Metadata = {
  title: 'Privacy Policy — Shady',
  description: 'How Shady collects, uses, and shares personal data for subscriptions and accounts.',
};

const UPDATED = '26 July 2026';

export default function PrivacyPage() {
  return (
    <LegalDoc title="Privacy Policy" updated={UPDATED}>
      <p>
        This Privacy Policy explains how Shady (“we”, “us”, “our”) collects, uses, and shares
        information when you visit our website, create an account, or buy digital products.
      </p>

      <h2>1. Who is responsible</h2>
      <p>
        Shady operates this website and fulfillment systems. Payment processing is handled by
        Paddle as Merchant of Record. Paddle processes your payment data under its own privacy
        notice. Discord may process data when you sign in with Discord OAuth under Discord’s
        policies.
      </p>

      <h2>2. Information we collect</h2>
      <ul>
        <li>
          <strong>Account data</strong> — email address, display name, authentication identifiers
          (including Discord user id when you use Discord login), and staff flags where applicable.
        </li>
        <li>
          <strong>Billing linkage</strong> — Paddle customer id, subscription status, price/product
          ids, and related webhook event metadata needed to grant or revoke access.
        </li>
        <li>
          <strong>Usage data</strong> — pages visited, device/browser type, approximate location
          derived from IP or CDN country headers (used for tax-localized pricing), and diagnostic
          logs.
        </li>
        <li>
          <strong>Support messages</strong> — information you send us in Discord or email when you
          contact support.
        </li>
      </ul>
      <p>
        We do not store full payment card numbers on our servers. Cards are handled by Paddle and
        its payment partners.
      </p>

      <h2>3. How we use information</h2>
      <ul>
        <li>Provide accounts, dashboards, and subscription access.</li>
        <li>Process purchases, renewals, cancellations, and refunds with Paddle.</li>
        <li>Match checkout emails to user accounts for fulfillment.</li>
        <li>Prevent fraud, abuse, and unauthorized access.</li>
        <li>Improve the site and respond to support requests.</li>
        <li>Comply with legal obligations.</li>
      </ul>

      <h2>4. Legal bases (EEA/UK where applicable)</h2>
      <p>We process personal data where needed to:</p>
      <ul>
        <li>Perform a contract with you (account and subscription fulfillment).</li>
        <li>Pursue legitimate interests (security, product improvement, analytics).</li>
        <li>Comply with law.</li>
        <li>Obtain consent where required (for example certain cookies or marketing).</li>
      </ul>

      <h2>5. Sharing</h2>
      <p>We share data only as needed with:</p>
      <ul>
        <li>
          <strong>Paddle</strong> — payments, tax, invoices, and customer portal.
        </li>
        <li>
          <strong>Supabase / hosting providers</strong> — database, auth, and application hosting
          (including AWS Amplify for this site).
        </li>
        <li>
          <strong>Discord</strong> — if you authenticate with Discord or we assign roles tied to
          your subscription.
        </li>
        <li>
          <strong>Professional advisers or authorities</strong> — when required by law or to protect
          rights and safety.
        </li>
      </ul>
      <p>We do not sell your personal information.</p>

      <h2>6. Cookies and similar tech</h2>
      <p>
        We use cookies and similar storage for authentication sessions, security, and essential site
        functions. Third parties (such as Paddle checkout) may set their own cookies when you open
        payment flows.
      </p>

      <h2>7. Retention</h2>
      <p>
        We keep account and subscription records for as long as your account is active and as needed
        for billing disputes, fraud prevention, and legal retention. Webhook/event logs may be kept
        for a limited period for debugging and audit.
      </p>

      <h2>8. Security</h2>
      <p>
        We use industry-standard measures (encrypted transport, access controls, and provider
        security features). No method of transmission or storage is 100% secure.
      </p>

      <h2>9. Your rights</h2>
      <p>
        Depending on where you live, you may have rights to access, correct, delete, or export your
        personal data, or to object to certain processing. To exercise these rights, contact us via
        the official Shady / Unlimited Discord using the email on your account, or through{' '}
        <Link href="/account">Account</Link> billing support channels.
      </p>
      <p>
        You may also manage payment data directly in the Paddle customer portal. You can close your
        account by contacting support; some records may be retained where legally required.
      </p>

      <h2>10. International transfers</h2>
      <p>
        Our providers may process data in the United States and other countries. Where required, we
        rely on appropriate safeguards offered by those providers.
      </p>

      <h2>11. Children</h2>
      <p>
        The Service is not directed to children under 18. We do not knowingly collect personal data
        from children. If you believe we have, contact us and we will delete it.
      </p>

      <h2>12. Changes</h2>
      <p>
        We may update this Policy by posting a revised version with a new “Last updated” date.
        Significant changes will be highlighted on the site where practical.
      </p>

      <h2>13. Contact</h2>
      <p>
        Privacy questions: reach us in the official Shady / Unlimited Discord with the email linked
        to your purchase or account. See also our <Link href="/terms">Terms of Service</Link> and{' '}
        <Link href="/refund">Refund Policy</Link>.
      </p>
    </LegalDoc>
  );
}
