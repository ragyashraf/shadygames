import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalDoc } from '@/components/LegalDoc';

export const metadata: Metadata = {
  title: 'Refund Policy — Shady',
  description: 'Refund and cancellation policy for Shady subscriptions and digital game products.',
};

const UPDATED = '26 July 2026';

export default function RefundPage() {
  return (
    <LegalDoc title="Refund Policy" updated={UPDATED}>
      <p>
        This Refund Policy explains how cancellations and refunds work for Shady digital products,
        including Unlimited GTA V RP subscription ranks and one-time game keys. Payments are
        processed by Paddle as Merchant of Record.
      </p>

      <h2>1. Digital nature of our products</h2>
      <p>
        Our products are digital goods. Access (ranks, keys, Discord roles, dashboard entitlements)
        is typically delivered immediately after payment confirms. By completing checkout you
        acknowledge that delivery may begin right away.
      </p>

      <h2>2. Subscriptions — cancel anytime</h2>
      <ul>
        <li>
          You can cancel renewal at any time from your{' '}
          <Link href="/account">Account</Link> billing portal (Paddle customer portal).
        </li>
        <li>
          Cancellation stops the next renewal. You keep access until the end of the period you
          already paid for.
        </li>
        <li>
          Cancelling does not automatically refund the current period.
        </li>
      </ul>

      <h2>3. When we grant refunds</h2>
      <p>We may approve a refund or credit when:</p>
      <ul>
        <li>
          There was a duplicate charge or clear billing error on our / Paddle’s side.
        </li>
        <li>
          You were unable to receive the purchased access because of a verified fulfillment failure
          on our side, and we cannot restore access within a reasonable time.
        </li>
        <li>
          Consumer law in your country requires a refund (including applicable cooling-off rights
          where digital supply has not begun, or where consent/acknowledgment rules were not met).
        </li>
      </ul>

      <h2>4. When refunds are usually declined</h2>
      <ul>
        <li>
          Change of mind after access, keys, or Discord roles have been delivered.
        </li>
        <li>
          Ban or suspension for cheating, harassment, or other Terms / community-rules violations.
        </li>
        <li>
          Sharing, reselling, or transferring an account or key.
        </li>
        <li>
          Partial use of a billing period, server downtime of short duration, or dislike of
          gameplay/content changes that do not prevent use of the core purchased access.
        </li>
        <li>
          Purchases made with incorrect emails when the customer refuses to help us locate the
          order (we will still try in good faith when you provide the Paddle receipt).
        </li>
      </ul>

      <h2>5. One-time game keys</h2>
      <p>
        Once a game key is revealed or redeemed, it is generally non-refundable except where
        required by law or where the key is demonstrably invalid and we cannot replace it.
      </p>

      <h2>6. How to request a refund</h2>
      <ol>
        <li>
          Open the official Shady / Unlimited Discord and contact support with: purchase email,
          approximate purchase date, plan/product name, and Paddle receipt or transaction id if you
          have it.
        </li>
        <li>
          Or start from <Link href="/account">Account</Link> → billing portal and use Paddle’s
          support options for payment disputes where appropriate.
        </li>
      </ol>
      <p>
        We aim to respond within a few business days. Approved refunds are issued by Paddle to the
        original payment method; timing depends on your bank or card issuer.
      </p>

      <h2>7. Chargebacks</h2>
      <p>
        Please contact us before filing a chargeback so we can help. Unfounded chargebacks may
        result in suspension of accounts and access while the dispute is investigated.
      </p>

      <h2>8. Changes</h2>
      <p>
        We may update this Policy by posting a revised version with a new “Last updated” date.
        The version in effect when you purchase applies to that purchase, subject to mandatory
        consumer protections.
      </p>

      <h2>9. Related policies</h2>
      <p>
        See our <Link href="/terms">Terms of Service</Link> and{' '}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </LegalDoc>
  );
}
