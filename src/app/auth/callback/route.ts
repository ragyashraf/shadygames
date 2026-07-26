import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * OAuth callback — exchanges Discord (or other) auth code for a session.
 * Configure this URL in Supabase Auth → Redirect URLs.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const nextRaw = url.searchParams.get('next') || '/dashboard';
  const next = nextRaw.startsWith('/') ? nextRaw : '/dashboard';
  const origin = url.origin;

  if (code) {
    const jar = await cookies();
    const supabase = createClient(jar);
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      try {
        await supabase.rpc('link_my_paddle_customer');
      } catch {
        // Non-fatal — customer may not exist yet
      }
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error('[auth/callback]', error.message);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(`${origin}/login?error=missing_code`);
}
