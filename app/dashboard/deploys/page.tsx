'use client';
import { useEffect, useState } from 'react';
import type { Deploy } from '@/lib/deploys';
import { getAccessToken } from '@/lib/supabase';

const tone: Record<string, string> = { live: 'text-emerald-300', deactivated: 'text-slate-400', build_failed: 'text-red-300', update_failed: 'text-red-300', pre_deploy_failed: 'text-red-300', canceled: 'text-slate-400' };
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : '—');

async function fetchDeploys(): Promise<{ deploys: Deploy[] } | { error: string }> {
  try {
    const token = await getAccessToken();
    if (!token) return { error: 'Log in to see deploys.' };
    const res = await fetch('/api/deploys', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: data.error || `Loading deploys failed (${res.status})` };
    return { deploys: data.deploys };
  } catch (err) {
    return { error: err instanceof TypeError ? "Can't reach the server. Check your connection and try again." : 'Loading deploys failed' };
  }
}

export default function Deploys() {
  const [deploys, setDeploys] = useState<Deploy[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);

  function load() {
    return fetchDeploys().then((r) => {
      if ('deploys' in r) { setDeploys(r.deploys); setError(''); } else setError(r.error);
      setBusy(false);
    });
  }

  useEffect(() => {
    let live = true;
    fetchDeploys().then((r) => {
      if (!live) return;
      if ('deploys' in r) setDeploys(r.deploys); else setError(r.error);
      setBusy(false);
    });
    return () => { live = false; };
  }, []);

  return <div>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-3xl font-bold">Deploys</h1>
      <button type="button" onClick={() => { setBusy(true); load(); }} disabled={busy} className="rounded-lg bg-electric-strong px-4 py-2 text-sm font-bold disabled:opacity-50">{busy ? 'Refreshing…' : 'Refresh'}</button>
    </div>
    <p className="mt-2 text-slate-300">Recent deploys of this app on Render. Read-only: redeploy from the Render dashboard.</p>
    <div aria-live="polite" className="mt-4">{error && <p role="alert" className="text-red-300">{error}</p>}</div>
    {deploys === null ? (!error && <p role="status" className="mt-6 text-slate-400">Loading…</p>)
      : deploys.length === 0 ? <p className="mt-6 text-slate-400">No deploys yet.</p>
      : <ul className="mt-6 space-y-3">{deploys.map((d) => <li key={d.id} className="glass rounded-2xl p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className={`font-semibold ${tone[d.status] ?? 'text-amber-300'}`}>{d.status.replaceAll('_', ' ')}</p>
          <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-sm text-electric underline">Open in Render<span className="sr-only"> (deploy {d.commitId || d.id})</span></a>
        </div>
        <p className="mt-1 text-slate-200">{d.commitId && <code className="mr-2 text-slate-400">{d.commitId}</code>}{d.commitMessage || 'No commit message'}</p>
        <p className="mt-1 text-sm text-slate-400">Started {when(d.createdAt)} · finished {when(d.finishedAt)}{d.trigger && ` · ${d.trigger.replaceAll('_', ' ')}`}</p>
      </li>)}</ul>}
  </div>;
}
