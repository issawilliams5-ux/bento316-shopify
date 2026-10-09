import { AdPackSection } from './AdPackSection';
import { CopyButton } from './CopyButton';
import type { AdPack } from '@/lib/types';

const claimNote = { skipped: 'Claim check is off (no TypeSafe key), so this copy has not been screened.', unavailable: 'Claim check failed, so this copy has not been screened. Review it yourself before running ads.' } as const;

function ClaimReview({ check }: { check: NonNullable<AdPack['claimCheck']> }) {
  if (check.status !== 'checked') return <p role="status" className="glass rounded-2xl p-5 text-sm text-amber-200">{claimNote[check.status]}</p>;
  if (!check.flags.length) return <p role="status" className="glass rounded-2xl p-5 text-sm text-slate-300">Claim check found no guaranteed-result or health/income claims. A check is not legal clearance.</p>;
  return <section className="glass rounded-2xl border-amber-400/40 p-5" aria-labelledby="claims-heading"><h2 id="claims-heading" className="text-xl font-semibold text-amber-200">Claims to review ({check.flags.length})</h2><p className="mt-1 text-sm text-slate-300">These lines may promise results or make health/income claims that need proof. Edit or drop them before running ads.</p><ul className="mt-4 space-y-3">{check.flags.map((flag) => <li key={`${flag.section}-${flag.index}`} className="rounded-xl bg-black/20 p-3 text-sm text-slate-200"><span className="block text-xs text-slate-400">{flag.section} #{flag.index + 1} · {Math.round(flag.probability * 100)}% likely</span>{flag.text}</li>)}</ul></section>;
}

export function AdPackView({ pack, title }: { pack: AdPack; title: string }) {
  return <div className="space-y-5"><div className="glass rounded-2xl p-6"><h1 className="text-3xl font-bold">{title}</h1><p className="mt-2 text-slate-300">{pack.productSummary}</p><div className="mt-4"><CopyButton text={JSON.stringify(pack,null,2)}/></div></div>{pack.claimCheck && <ClaimReview check={pack.claimCheck}/>}<AdPackSection title="50 Hooks" items={pack.hooks}/><AdPackSection title="10 TikTok/Reels Scripts" items={pack.tiktokScripts}/><AdPackSection title="10 Meta Ad Variations" items={pack.metaAds}/><AdPackSection title="10 Instagram Captions" items={pack.instagramCaptions}/><AdPackSection title="10 Static Ad Concepts" items={pack.staticAdConcepts}/><AdPackSection title="5 UGC Scripts" items={pack.ugcScripts}/><AdPackSection title="Product Page Audit" items={pack.productPageAudit}/><AdPackSection title="FAQs" items={pack.faqs}/><AdPackSection title="SEO" items={[pack.seo.title, pack.seo.metaDescription]}/><AdPackSection title="7-Day Testing Plan" items={pack.testingPlan}/></div>;
}
