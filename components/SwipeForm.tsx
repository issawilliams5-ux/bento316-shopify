'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SwipeItem } from '@/lib/types';

const FIELDS: { key: 'adLink' | 'platform' | 'product' | 'hook' | 'angle' | 'notes'; label: string }[] = [
  { key: 'adLink', label: 'Ad link' },
  { key: 'platform', label: 'Platform' },
  { key: 'product', label: 'Product' },
  { key: 'hook', label: 'Hook' },
  { key: 'angle', label: 'Angle' },
  { key: 'notes', label: 'Notes' },
];

export function SwipeForm() {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<SwipeItem['status']>('Idea');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const item: SwipeItem = { adLink: values.adLink ?? '', platform: values.platform ?? '', product: values.product ?? '', hook: values.hook ?? '', angle: values.angle ?? '', notes: values.notes ?? '', status };
      const res = await fetch('/api/swipe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Save failed');
      }
      setValues({});
      setStatus('Idea');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid gap-3 md:grid-cols-2">
      {FIELDS.map(({ key, label }) => (
        <input key={key} className="rounded-xl bg-white/10 p-3" placeholder={label} value={values[key] ?? ''} onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))} />
      ))}
      <select className="rounded-xl bg-white/10 p-3" value={status} onChange={(e) => setStatus(e.target.value as SwipeItem['status'])}>
        <option>Idea</option>
        <option>Testing</option>
        <option>Winner</option>
        <option>Loser</option>
      </select>
      {error && <p className="text-sm text-red-400 md:col-span-2">{error}</p>}
      <button type="submit" disabled={saving} className="rounded-xl bg-electric p-3 font-bold disabled:opacity-50 md:col-span-2">{saving ? 'Saving…' : 'Save inspiration'}</button>
    </form>
  );
}
