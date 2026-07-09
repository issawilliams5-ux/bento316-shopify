'use client';
export function CopyButton({ text }: { text: string }) { return <button onClick={() => navigator.clipboard?.writeText(text)} className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20">Copy</button>; }
