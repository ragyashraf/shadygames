import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { SiteHeader } from '@/components/SiteHeader';
import { PricingView } from '@/components/PageViews';
import { getRequestCountryCode } from '@/lib/country';
import { getTiers } from '@/lib/tiers';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Shady — Plans',
  description: 'Unlimited GTA V subscription ranks — Starter, Pro, and Advanced.',
};

export default async function PricingPage() {
  const tiers = getTiers();
  const countryCode = await getRequestCountryCode();
  const jar = await cookies();
  const supabase = createClient(jar);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let customerEmail = user?.email ?? null;
  let paddleCustomerId: string | null = null;

  if (user) {
    await supabase.rpc('link_my_paddle_customer');
    const { data: customer } = await supabase
      .from('customers')
      .select('customer_id, email')
      .eq('user_id', user.id)
      .maybeSingle();
    paddleCustomerId = customer?.customer_id ?? null;
    customerEmail = customer?.email ?? customerEmail;
  }

  const { data: settings } = await supabase
    .from('store_settings')
    .select('store_open')
    .eq('id', 1)
    .maybeSingle();

  return (
    <>
      <SiteHeader />
      <PricingView
        tiers={tiers}
        countryCode={countryCode}
        customerEmail={customerEmail}
        paddleCustomerId={paddleCustomerId}
        storeOpen={settings?.store_open !== false}
      />
    </>
  );
}
