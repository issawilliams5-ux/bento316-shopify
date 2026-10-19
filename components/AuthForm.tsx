'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { isAuthRetryableFetchError } from '@supabase/supabase-js';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase';

const input = 'rounded-xl bg-white/10 p-3';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const signup = mode === 'signup';
  const passwordHint = useId();

  if (!isSupabaseConfigured) {
    return <div className="mt-6 grid gap-3"><p className="text-slate-300">Demo mode: Supabase env vars are missing, so there is no account to sign in to.</p>
      <Link href="/dashboard" className="rounded-xl bg-electric-strong p-3 text-center font-bold">Continue in demo mode</Link></div>;
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email')).trim();
    const password = String(form.get('password'));
    setBusy(true); setError(''); setNotice('');
    try {
      const auth = getSupabaseBrowserClient()!.auth;
      if (signup) {
        const { data, error } = await auth.signUp({ email, password, options: { data: { full_name: String(form.get('name') || '').trim() }, emailRedirectTo: `${location.origin}/login` } });
        if (error) throw error;
        // With email confirmation on, Supabase returns no session until the link is clicked.
        if (!data.session) { setNotice('Check your email to confirm your account, then log in.'); return; }
      } else {
        const { error } = await auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      router.push('/dashboard');
    } catch (err) {
      // A network failure surfaces as the browser's bare "Failed to fetch"; say what happened instead.
      setError(isAuthRetryableFetchError(err) ? "Can't reach the sign-in service. Check your connection and try again."
        : err instanceof Error ? err.message : 'Something went wrong');
    } finally { setBusy(false); }
  }

  return <form onSubmit={submit} className="mt-6 grid gap-3">
    {signup && <label className="grid gap-1 text-sm text-slate-300">Name<input name="name" autoComplete="name" className={input} /></label>}
    <label className="grid gap-1 text-sm text-slate-300">Email<input name="email" type="email" required autoComplete="email" className={input} /></label>
    <div className="grid gap-1">
      <label className="grid gap-1 text-sm text-slate-300">Password<input name="password" type="password" required minLength={signup ? 8 : undefined} aria-describedby={signup ? passwordHint : undefined} autoComplete={signup ? 'new-password' : 'current-password'} className={input} /></label>
      {signup && <p id={passwordHint} className="text-xs text-slate-400">At least 8 characters.</p>}
    </div>
    <button disabled={busy} className="rounded-xl bg-electric-strong p-3 font-bold disabled:opacity-50">{busy ? 'Please wait…' : signup ? 'Create account' : 'Log in'}</button>
    <div aria-live="polite">{error && <p role="alert" className="text-red-300">{error}</p>}{notice && <p className="text-emerald-300">{notice}</p>}</div>
    <p className="text-sm text-slate-400">{signup ? <>Have an account? <Link className="underline" href="/login">Log in</Link></> : <>New here? <Link className="underline" href="/signup">Create an account</Link></>}</p>
  </form>;
}
