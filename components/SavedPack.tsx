'use client';
import { useEffect, useState } from 'react';
import { AdPackSection } from './AdPackSection';
import { CopyButton } from './CopyButton';
import { SECTIONS } from '@/lib/pack';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import type { ClaimCheck } from '@/lib/types';

type Row = { id: string; section_key: string; content: unknown; saved: boolean };
type State =
  | { status: 'loading' }
  | { status: 'missing'; message: string }
  | { status: 'ready'; title: string; summary: string; rows: Row[] };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A stored pack, read in the browser so row level security limits it to its owner. */
export function SavedPack({ id }: { id: string }) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let live = true;
    (async () => {
      const db = getSupabaseBrowserClient();
      if (!db) return setState({ status: 'missing', message: 'Saved packs need an account. In demo mode only the demo pack exists.' });
      if (!UUID.test(id)) return setState({ status: 'missing', message: 'This pack was not found.' });
      const [{ data: pack, error: packError }, { data: rows, error: rowsError }] = await Promise.all([
        db.from('ad_packs').select('title, product_summary').eq('id', id).maybeSingle(),
        db.from('generated_sections').select('id, section_key, content, saved').eq('ad_pack_id', id),
      ]);
      if (!live) return;
      if (packError || rowsError) return setState({ status: 'missing', message: "Couldn't load this pack. Check your connection and try again." });
      if (!pack) return setState({ status: 'missing', message: 'This pack was not found.' });
      setState({ status: 'ready', title: pack.title, summary: pack.product_summary ?? '', rows: (rows ?? []) as Row[] });
    })();
    return () => { live = false; };
  }, [id]);

  if (state.status === 'loading') return <p role="status" className="text-slate-400">Loading pack…</p>;
  if (state.status === 'missing') return <p role="alert" className="text-slate-300">{state.message}</p>;

  const byKey = new Map(state.rows.map((r) => [r.section_key, r]));
  const flags = (byKey.get('claimCheck')?.content as ClaimCheck | undefined)?.flags ?? [];
  const exportable = { title: state.title, productSummary: state.summary, ...Object.fromEntries(SECTIONS.map((s) => [s.key, byKey.get(s.key)?.content ?? []])) };

  return <div className="space-y-5">
    <div className="glass rounded-2xl p-6">
      <h1 className="text-3xl font-bold">{state.title}</h1>
      <p className="mt-2 text-slate-300">{state.summary}</p>
      <div className="mt-4"><CopyButton text={JSON.stringify(exportable, null, 2)} /></div>
    </div>
    {flags.length > 0 && <div className="glass rounded-2xl border border-amber-300/40 p-5">
      <h2 className="text-lg font-semibold">{flags.length} line{flags.length === 1 ? '' : 's'} flagged for human review</h2>
      <p className="mt-1 text-sm text-slate-300">These may guarantee results or make health, income or before/after claims. A flag is a prompt to check, not legal advice.</p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-200">{flags.map((f, i) => <li key={i}>{f.text}</li>)}</ul>
    </div>}
    {SECTIONS.map((s) => {
      const row = byKey.get(s.key);
      return row && <AdPackSection key={row.id} sectionKey={s.key} items={Array.isArray(row.content) ? row.content.filter((x): x is string => typeof x === 'string') : []} sectionId={row.id} saved={row.saved} />;
    })}
  </div>;
}
