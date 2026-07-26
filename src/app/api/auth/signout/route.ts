import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  const jar = await cookies();
  const supabase = createClient(jar);
  await supabase.auth.signOut();
  const url = new URL(request.url);
  return NextResponse.redirect(new URL('/login', url.origin), { status: 303 });
}
