import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  const path = request.nextUrl.pathname;

  // Session cookie is refreshed in updateSession; re-check via header is not available.
  // Route-level redirects handle auth for /dashboard and /staff.
  if (path.startsWith('/api/paddle/webhook')) {
    return NextResponse.next();
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
