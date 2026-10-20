'use client';
import { useEffect, useState } from 'react';
import { demoSwipe } from '@/lib/demo';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import type { SwipeItem } from '@/lib/types';

const STATUSES: SwipeItem['status'][] = ['Idea', 'Testing', 'Winner', 'Loser'];
// Limits match migration 006's check constraints.
const FIELDS = [
  { key: 'platform', label: 'Platform', max: 100 },
  { key: 'product', label: 'Product', max: 200 },
  { key: 'hook', label: 'Hook', max: 1000 },
  { key: 'angle', label: 'Angle', max: 1000 },
  { key: 'notes', label: 'Notes', max: 2000 },
] as const;
const field = 'rounded-xl bg-white/10 p-3 text-white';
type Row = { id: string; ad_link: string; platform: string | null; product: string | null; hook: string | null; angle: string | null; notes: string | null; status: SwipeItem['status'] };

/** Swipe file: the signed-in user's saved ads (RLS limits rows to them). Demo mode shows sample items read-only. */
export function SwipeFile() {
  const db = getSupabaseBrowserClient();
  const [items, setItems] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!db) return;
    db.from('swipe_file_items').select('id, ad_link, platform, product, hook, angle, notes, status').order('created_at', { ascending: false })
      .then(({ data, error }) => { if (error) setError("Couldn't load your swipe file."); setItems((data ?? []) as Row[]); });
  }, [db]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const text = (k: string) => String(form.get(k) ?? '').trim() || null;
    setBusy(true); setError('');
    try {
      const { data: { session } } = await db!.auth.getSession();
      if (!session) throw new Error('Your session has expired. Log in again.');
      const { data, error } = await db!.from('swipe_file_items').insert({
        user_id: session.user.id, ad_link: text('ad_link'), status: String(form.get('status')),
        ...Object.fromEntries(FIELDS.map((f) => [f.key, text(f.key)])),
      }).select('id, ad_link, platform, product, hook, angle, notes, status').single();
      if (error) throw new Error(`Couldn't save: ${error.message}`);
      setItems((prev) => [data as Row, ...(prev ?? [])]);
      formEl.reset();
    } catch (err) {
      setError(err instanceof TypeError ? "Can't reach the server. Check your connection and try again." : err instanceof Error ? err.message : "Couldn't save");
    } finally { setBusy(false); }
  }

  const shown: Row[] = db ? items ?? [] : demoSwipe.map((s, i) => ({ id: String(i), ad_link: s.adLink, platform: s.platform, product: s.product, hook: s.hook, angle: s.angle, notes: s.notes, status: s.status }));

  return <>
    {db ? <form onSubmit={submit} className="mt-6 grid gap-3 md:grid-cols-2">
      <label className="grid gap-2 text-sm text-slate-300">Ad link
        <input name="ad_link" type="url" required maxLength={2048} pattern="https?://.+" className={field} /></label>
      {FIELDS.map((f) => <label key={f.key} className="grid gap-2 text-sm text-slate-300">{f.label}
        <input name={f.key} maxLength={f.max} className={field} /></label>)}
      <label className="grid gap-2 text-sm text-slate-300">Status
        <select name="status" className={field}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label>
      <button disabled={busy} className="self-end rounded-xl bg-electric-strong p-3 font-bold disabled:opacity-50">{busy ? 'Saving…' : 'Save inspiration'}</button>
      <div aria-live="polite" className="md:col-span-2">{error && <p role="alert" className="text-red-300">{error}</p>}</div>
    </form> : <p className="mt-6 text-slate-300">Demo mode: saving needs an account. Showing a sample item.</p>}
    {db && items === null ? <p role="status" className="mt-6 text-slate-400">Loading…</p>
      : db && shown.length === 0 ? <p className="mt-6 text-slate-400">Nothing saved yet.</p>
      : <div className="mt-6 grid gap-4 md:grid-cols-2">{shown.map((item) => <article key={item.id} className="glass rounded-2xl p-5">
        <p className="text-sm text-electric">{item.platform || 'Unknown platform'} • {item.status}</p>
        <h2 className="mt-2 text-xl font-bold">{item.product || 'Untitled'}</h2>
        {item.hook && <p className="mt-2 text-slate-200">{item.hook}</p>}
        {(item.angle || item.notes) && <p className="mt-2 text-slate-400">{[item.angle, item.notes].filter(Boolean).join(' — ')}</p>}
        <a href={item.ad_link} target="_blank" rel="noopener noreferrer nofollow" className="mt-2 inline-block text-sm text-electric underline">Open ad</a>
      </article>)}</div>}
  </>;
}
