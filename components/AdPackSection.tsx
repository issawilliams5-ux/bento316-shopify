'use client';
import { useState } from 'react';
import { CopyButton } from './CopyButton';
import { sectionTitle, type SectionKey } from '@/lib/pack';
import { getAccessToken, getSupabaseBrowserClient } from '@/lib/supabase';

type Props = { sectionKey: SectionKey; items: string[]; sectionId?: string; saved?: boolean };

const networkSafe = (err: unknown, fallback: string) =>
  err instanceof TypeError ? "Can't reach the server. Check your connection and try again." : err instanceof Error ? err.message : fallback;

/** One pack section. Save and Regenerate appear only for a stored section: the demo pack has nothing to save. */
export function AdPackSection({ sectionKey, items: initialItems, sectionId, saved: initialSaved = false }: Props) {
  const [items, setItems] = useState(initialItems);
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState<'save' | 'regenerate' | null>(null);
  const [error, setError] = useState('');

  async function toggleSave() {
    setBusy('save'); setError('');
    try {
      const { error } = await getSupabaseBrowserClient()!.from('generated_sections').update({ saved: !saved }).eq('id', sectionId!);
      if (error) throw new Error(`Couldn't save: ${error.message}`);
      setSaved(!saved);
    } catch (err) { setError(networkSafe(err, "Couldn't save")); }
    finally { setBusy(null); }
  }

  async function regenerate() {
    setBusy('regenerate'); setError('');
    try {
      const res = await fetch('/api/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await getAccessToken()}` },
        body: JSON.stringify({ sectionId }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `Regeneration failed (${res.status})`);
      setItems(body.items);
    } catch (err) { setError(networkSafe(err, 'Regeneration failed')); }
    finally { setBusy(null); }
  }

  return <section className="glass rounded-2xl p-5" aria-busy={busy === 'regenerate'}>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-xl font-semibold">{sectionTitle(sectionKey, items.length)}</h2>
      <div className="flex gap-2">
        <CopyButton text={items.join('\n')} />
        {sectionId && <>
          <button type="button" onClick={toggleSave} disabled={busy !== null} aria-pressed={saved} className="rounded-lg bg-electric-strong px-3 py-2 text-sm disabled:opacity-50">{saved ? 'Saved' : 'Save'}</button>
          <button type="button" onClick={regenerate} disabled={busy !== null} className="rounded-lg bg-violet px-3 py-2 text-sm disabled:opacity-50">{busy === 'regenerate' ? 'Regenerating…' : 'Regenerate'}</button>
        </>}
      </div>
    </div>
    <div aria-live="polite">{error && <p role="alert" className="mb-3 text-sm text-red-300">{error}</p>}</div>
    <div className="space-y-3">{items.map((item, i) => <p key={i} className="rounded-xl bg-black/20 p-3 text-sm text-slate-200">{item}</p>)}</div>
  </section>;
}
