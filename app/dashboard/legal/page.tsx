'use client';
import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import type { LegalMode, LegalReview } from '@/lib/legal';

const modes: [LegalMode, string][] = [['contract', 'Contract / NDA'], ['claims', 'Ad & product claims'], ['policy', 'Store policy']];
const tone = { high: 'text-red-300', medium: 'text-amber-300', low: 'text-slate-300' };

export default function Legal() {
  const [mode, setMode] = useState<LegalMode>('contract');
  const [text, setText] = useState('');
  const [review, setReview] = useState<LegalReview | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(''); setReview(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const token = supabase ? (await supabase.auth.getSession()).data.session?.access_token : undefined;
      if (!token) throw new Error('Log in to run a legal review.');
      const res = await fetch('/api/legal', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify({ mode, text }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Review failed (${res.status})`);
      setReview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Review failed');
    } finally { setBusy(false); }
  }

  return <div className="max-w-3xl">
    <h1 className="text-3xl font-bold">Legal assistant</h1>
    <p className="mt-2 text-slate-300">Paste a contract, ad copy or store policy for an AI first pass. Triage only, not legal advice.</p>
    <form onSubmit={submit} className="mt-6 grid gap-4">
      <fieldset className="flex flex-wrap gap-2"><legend className="sr-only">Review type</legend>
        {modes.map(([value, label]) => <label key={value} className={`cursor-pointer rounded-xl px-3 py-2 ${mode === value ? 'bg-electric font-bold' : 'bg-white/10'}`}>
          <input type="radio" name="mode" value={value} checked={mode === value} onChange={() => setMode(value)} className="sr-only" />{label}</label>)}
      </fieldset>
      <label className="grid gap-2 text-sm text-slate-300">Document
        <textarea required maxLength={60000} rows={14} value={text} onChange={e => setText(e.target.value)} className="rounded-xl bg-white/10 p-3 text-white" /></label>
      <button disabled={busy || !text.trim()} className="rounded-xl bg-electric p-4 font-bold disabled:opacity-50">{busy ? 'Reviewing…' : 'Review'}</button>
    </form>
    <div aria-live="polite">
      {error && <p role="alert" className="mt-6 text-red-300">{error}</p>}
      {review && <section className="mt-8 grid gap-4">
        <p className="glass rounded-2xl p-5">{review.summary}</p>
        {review.issues.length === 0 && <p className="text-slate-300">No issues flagged.</p>}
        {review.issues.map((i, n) => <article key={n} className="glass rounded-2xl p-5">
          <p className={`text-sm font-bold uppercase ${tone[i.severity]}`}>{i.severity}</p>
          {i.quote && <blockquote className="mt-2 border-l-2 border-white/20 pl-3 text-slate-400">{i.quote}</blockquote>}
          <p className="mt-2">{i.issue}</p>
          {i.suggestion && <p className="mt-2 text-slate-300">Suggestion: {i.suggestion}</p>}
        </article>)}
        {review.questionsForCounsel.length > 0 && <div className="glass rounded-2xl p-5"><h2 className="font-bold">Questions for a lawyer</h2><ul className="mt-2 list-disc pl-5 text-slate-300">{review.questionsForCounsel.map((q, n) => <li key={n}>{q}</li>)}</ul></div>}
        <p className="text-xs text-slate-400">{review.disclaimer}</p>
      </section>}
    </div>
  </div>;
}
