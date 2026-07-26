'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useLang } from '@/components/LangProvider';

type Mode = 'login' | 'signup';

/** Callback used for OAuth + email confirmation. Must be in Supabase Redirect URLs. */
function authCallbackUrl() {
  // Same-origin is required for PKCE cookies. Prefer shadygames.xyz in production.
  return `${window.location.origin}/auth/callback`;
}

export function AuthForm({ mode }: { mode: Mode }) {
  const { t } = useLang();
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
    const redirectTo = authCallbackUrl();

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
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const supabase = createClient();

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // Without this, Supabase falls back to Site URL (often still localhost).
            emailRedirectTo: authCallbackUrl(),
            data: { display_name: displayName || email.split('@')[0] },
          },
        });
        if (error) throw error;

        if (!data.session) {
          setMessage(
            'Account created. Check your email and click the confirmation link to finish signing in.'
          );
          setBusy(false);
          return;
        }

        await supabase.rpc('link_my_paddle_customer');
        setMessage('Account created.');
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
        {t.discordContinue}
      </button>

      <div className="auth-divider" role="separator">
        <span>{t.orEmail}</span>
      </div>

      <form className="auth-form" onSubmit={onSubmit}>
        {mode === 'signup' ? (
          <label>
            <span>{t.displayName}</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name / IGN"
              autoComplete="nickname"
            />
          </label>
        ) : null}
        <label>
          <span>{t.email}</span>
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
          <span>{t.password}</span>
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
          {busy ? t.pleaseWait : mode === 'signup' ? t.createAccount : t.logIn}
        </button>
        {message ? <p className="form-msg">{message}</p> : null}
        <p className="form-switch">
          {mode === 'login' ? (
            <>
              {t.newHere} <Link href="/signup">{t.createAccount}</Link>
            </>
          ) : (
            <>
              {t.alreadyHave} <Link href="/login">{t.logIn}</Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
