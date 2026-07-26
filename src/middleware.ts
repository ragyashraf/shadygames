import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // Supabase sometimes returns the OAuth code to Site URL root (/?code=...).
  // Forward to the App Router callback so the session can be exchanged.
  if (
    url.pathname === '/' &&
    (url.searchParams.has('code') || url.searchParams.has('error'))
  ) {
    const dest = url.clone();
    dest.pathname = '/auth/callback';
    if (!dest.searchParams.has('next')) {
      dest.searchParams.set('next', '/dashboard');
    }
    return NextResponse.redirect(dest);
  }

  if (url.pathname.startsWith('/api/paddle/webhook')) {
    return NextResponse.next();
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
