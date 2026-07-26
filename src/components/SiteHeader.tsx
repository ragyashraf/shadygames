import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { SiteHeaderClient } from '@/components/SiteHeaderClient';

export async function SiteHeader() {
  const jar = await cookies();
  const supabase = createClient(jar);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isStaff = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_staff')
      .eq('id', user.id)
      .maybeSingle();
    isStaff = Boolean(profile?.is_staff);
  }

  return (
    <SiteHeaderClient
      email={user?.email ?? null}
      isStaff={isStaff}
      signedIn={Boolean(user)}
    />
  );
}
