'use client';
import { useState, type FormEvent } from 'react';
import { AdPackView } from '@/components/AdPackView';
import { tones } from '@/lib/product-input';
import type { AdPack } from '@/lib/types';

const fields = [
  { name:'productName', label:'Product name', required:true },
  { name:'productUrl', label:'Product URL', type:'url', required:false },
  { name:'category', label:'Category', required:true },
  { name:'price', label:'Price', required:true },
  { name:'targetCustomer', label:'Target customer', required:true },
  { name:'mainProblem', label:'Main problem solved', required:true },
  { name:'mainBenefit', label:'Main benefit', required:true },
  { name:'keyFeatures', label:'Key features', required:true },
  { name:'competitorLink', label:'Competitor link (optional)', type:'url', required:false }
] as const;

export default function NewPack() {
  const [pack, setPack] = useState<{ pack: AdPack; title: string } | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const body = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    setValues(body);
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/generate', { method:'POST', headers:{ 'content-type':'application/json' }, body:JSON.stringify(body) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Generation failed. Try again in a moment.');
      setPack({ pack:data as AdPack, title:`${body.productName} Ad Pack` });
      window.scrollTo({ top:0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed. Try again in a moment.');
    } finally { setBusy(false); }
  }

  if (pack) return <div className="space-y-5"><button type="button" onClick={() => setPack(null)} className="rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/20">← Edit product details</button><AdPackView pack={pack.pack} title={pack.title}/></div>;

  return <div className="max-w-3xl"><h1 className="text-3xl font-bold">Create new ad pack</h1><p className="mt-2 text-slate-300">Enter details and generate a structured ecommerce creative pack.</p>
    <form onSubmit={submit} aria-busy={busy} className="mt-6 grid gap-4">
      {fields.map(f => <label key={f.name} className="grid gap-2 text-sm text-slate-300">{f.label}<input name={f.name} defaultValue={values[f.name] ?? ''} type={'type' in f ? f.type : 'text'} required={f.required} maxLength={1000} disabled={busy} className="rounded-xl bg-white/10 p-3 text-white disabled:opacity-60" placeholder={f.label}/></label>)}
      <label className="grid gap-2 text-sm text-slate-300">Tone<select name="tone" defaultValue={values.tone} required disabled={busy} className="rounded-xl bg-white/10 p-3 text-white disabled:opacity-60">{tones.map(t => <option key={t}>{t}</option>)}</select></label>
      {error && <p role="alert" className="rounded-xl bg-red-500/15 p-3 text-sm text-red-200">{error}</p>}
      <button type="submit" disabled={busy} className="rounded-xl bg-electric p-4 text-center font-bold disabled:opacity-60">{busy ? 'Generating… this can take a minute' : 'Generate Ad Pack'}</button>
    </form></div>;
}
