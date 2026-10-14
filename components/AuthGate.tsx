'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';

// The session lives in browser storage, so the check runs client-side. This is
// UX, not security: every API route still verifies the bearer token itself.
export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [ready, setReady] = useState(!supabase); // demo mode: nothing to check

  useEffect(() => {
    if (!supabase) return;
    const go = (signedIn: boolean) => signedIn ? setReady(true) : router.replace('/login');
    supabase.auth.getSession().then(({ data }) => go(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => go(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, [supabase, router]);

  return ready ? <>{children}</> : <p role="status" className="text-slate-400">Checking your session…</p>;
}

export function LogoutButton() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [error, setError] = useState('');
  if (!supabase) return null;
  async function logout() {
    const { error } = await supabase!.auth.signOut();
    if (error) { setError(error.message); return; }
    router.replace('/login');
  }
  return <div><button onClick={logout} className="w-full rounded-xl px-3 py-2 text-left text-slate-300 hover:bg-white/10 hover:text-white">Log out</button>{error && <p role="alert" className="px-3 text-sm text-red-300">{error}</p>}</div>;
}
