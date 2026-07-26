export type BillingCycle = 'month' | 'year';

export interface Tier {
  name: 'Starter' | 'Pro' | 'Advanced';
  description: string;
  features: string[];
  /** Highlight as most popular */
  featured?: boolean;
  priceId: { month: string; year: string };
}

/**
 * Static process.env.NEXT_PUBLIC_* access so Next.js inlines them at build time.
 * Dynamic process.env[name] breaks on Amplify SSR.
 */
function requirePublicEnv(
  name: string,
  value: string | undefined
): string {
  if (!value) {
    throw new Error(
      `Missing required env var ${name}. Set it in Amplify / .env.local (see .env.example).`
    );
  }
  return value;
}

/** Edit tier copy here. Price IDs come from env so live/sandbox stay swapable. */
export function getTiers(): Tier[] {
  return [
    {
      name: 'Starter',
      description: 'City access for Unlimited GTA V — whitelist, jobs, and Discord member.',
      features: [
        'Activated Unlimited server access',
        'Full RP economy, jobs, and gangs',
        'Two characters',
        'Member Discord role',
      ],
      priceId: {
        month: requirePublicEnv(
          'NEXT_PUBLIC_PADDLE_PRICE_STARTER_MONTH',
          process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER_MONTH
        ),
        year: requirePublicEnv(
          'NEXT_PUBLIC_PADDLE_PRICE_STARTER_YEAR',
          process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER_YEAR
        ),
      },
    },
    {
      name: 'Pro',
      description: 'Monthly payout, daily rewards, and priority queue.',
      featured: true,
      features: [
        'Everything in Starter',
        '$1,000,000 in-game per month',
        'Daily login rewards',
        'Priority queue',
        'Custom plates + 5 garage slots',
        'Kingpin Discord role',
      ],
      priceId: {
        month: requirePublicEnv(
          'NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTH',
          process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTH
        ),
        year: requirePublicEnv(
          'NEXT_PUBLIC_PADDLE_PRICE_PRO_YEAR',
          process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_YEAR
        ),
      },
    },
    {
      name: 'Advanced',
      description: 'Battlepass, custom car, exclusive jobs, and unlimited garage.',
      features: [
        'Everything in Pro',
        'Full Battlepass access',
        '$2,000,000 in-game per month',
        'Custom car built to your spec',
        'Exclusive jobs and contracts',
        'Unlimited garage slots',
        'Direct line to admins',
      ],
      priceId: {
        month: requirePublicEnv(
          'NEXT_PUBLIC_PADDLE_PRICE_ADVANCED_MONTH',
          process.env.NEXT_PUBLIC_PADDLE_PRICE_ADVANCED_MONTH
        ),
        year: requirePublicEnv(
          'NEXT_PUBLIC_PADDLE_PRICE_ADVANCED_YEAR',
          process.env.NEXT_PUBLIC_PADDLE_PRICE_ADVANCED_YEAR
        ),
      },
    },
  ];
}
