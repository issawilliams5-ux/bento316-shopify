'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { INPUT_FIELDS, TONES } from '@/lib/pack';
import { getAccessToken, isSupabaseConfigured } from '@/lib/supabase';

const field = 'rounded-xl bg-white/10 p-3 text-white';

/** The brief form. Generation runs server-side for the signed-in user and opens the saved pack. */
export function NewPackForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!isSupabaseConfigured) {
    return <div className="mt-6 grid gap-3"><p className="text-slate-300">Demo mode: generating and saving packs needs an account, and Supabase isn&apos;t configured here.</p>
      <Link href="/dashboard/packs/demo-1" className="rounded-xl bg-electric-strong p-4 text-center font-bold">View the demo pack</Link></div>;
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const body: Record<string, string> = { tone: String(form.get('tone')) };
    for (const f of INPUT_FIELDS) body[f.key] = String(form.get(f.key) ?? '').trim();
    setBusy(true); setError('');
    try {
      const token = await getAccessToken();
      if (!token) { router.replace('/login'); return; }
      const res = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Generation failed (${res.status})`);
      router.push(`/dashboard/packs/${data.id}`); // stays busy while the pack page loads
    } catch (err) {
      setError(err instanceof TypeError ? "Can't reach the server. Check your connection and try again." : err instanceof Error ? err.message : 'Generation failed');
      setBusy(false);
    }
  }

  return <form onSubmit={submit} className="mt-6 grid gap-4">
    {INPUT_FIELDS.map((f) => <label key={f.key} className="grid gap-2 text-sm text-slate-300">
      {f.label}{f.optional && ' (optional)'}
      <input name={f.key} required={!f.optional} maxLength={f.max} type={f.optional ? 'url' : 'text'} className={field} />
    </label>)}
    <label className="grid gap-2 text-sm text-slate-300">Tone
      <select name="tone" className={field}>{TONES.map((t) => <option key={t}>{t}</option>)}</select>
    </label>
    <button disabled={busy} className="rounded-xl bg-electric-strong p-4 font-bold disabled:opacity-50">{busy ? 'Generating… this can take a minute' : 'Generate Ad Pack'}</button>
    <div aria-live="polite">{error && <p role="alert" className="text-red-300">{error}</p>}</div>
  </form>;
}
