'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

type Mode = 'login' | 'signup';

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthError = useMemo(() => searchParams.get('error'), [searchParams]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState<string | null>(oauthError);
  const [busy, setBusy] = useState(false);

  async function signInWithDiscord() {
    setBusy(true);
    setMessage(null);
    const supabase = createClient();
    // Prefer configured production site URL so Amplify OAuth never falls back to localhost.
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
      window.location.origin;
    const redirectTo = `${origin}/auth/callback?next=/dashboard`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo,
        scopes: 'identify email',
      },
    });

    if (error) {
      setMessage(error.message);
      setBusy(false);
    }
    // On success the browser redirects to Discord
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const supabase = createClient();

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName || email.split('@')[0] },
          },
        });
        if (error) throw error;
        await supabase.rpc('link_my_paddle_customer');
        setMessage(
          'Account created. Check your email if confirmation is required, then open the dashboard.'
        );
        router.push('/dashboard');
        router.refresh();
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await supabase.rpc('link_my_paddle_customer');
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Auth failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-form-wrap">
      <button
        type="button"
        className="discord-btn wide"
        onClick={signInWithDiscord}
        disabled={busy}
      >
        Continue with Discord
      </button>

      <div className="auth-divider" role="separator">
        <span>or email</span>
      </div>

      <form className="auth-form" onSubmit={onSubmit}>
        {mode === 'signup' ? (
          <label>
            <span>Display name</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name / IGN"
              autoComplete="nickname"
            />
          </label>
        ) : null}
        <label>
          <span>Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            autoComplete="email"
          />
        </label>
        <label>
          <span>Password</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />
        </label>
        <button type="submit" className="gold-btn wide" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Log in'}
        </button>
        {message ? <p className="form-msg">{message}</p> : null}
        <p className="form-switch">
          {mode === 'login' ? (
            <>
              New here? <Link href="/signup">Create an account</Link>
            </>
          ) : (
            <>
              Already have access? <Link href="/login">Log in</Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
