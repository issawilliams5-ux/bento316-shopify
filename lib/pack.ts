import type { AdPack, ProductInput, Tone } from './types';

export const TONES: Tone[] = ['Premium', 'Viral TikTok', 'Luxury', 'Problem/Solution', 'UGC', 'Bold Direct Response'];

/** Pack sections in display order. Titles take the real item count, so they never overstate what a pack holds. */
export const SECTIONS = [
  { key: 'hooks', title: (n: number) => `${n} Hooks` },
  { key: 'tiktokScripts', title: (n: number) => `${n} TikTok/Reels Scripts` },
  { key: 'metaAds', title: (n: number) => `${n} Meta Ad Variations` },
  { key: 'instagramCaptions', title: (n: number) => `${n} Instagram Captions` },
  { key: 'staticAdConcepts', title: (n: number) => `${n} Static Ad Concepts` },
  { key: 'ugcScripts', title: (n: number) => `${n} UGC Scripts` },
  { key: 'productPageAudit', title: () => 'Product Page Audit' },
  { key: 'faqs', title: () => 'FAQs' },
  { key: 'seo', title: () => 'SEO' },
  { key: 'testingPlan', title: (n: number) => `${n}-Day Testing Plan` },
] as const;
export type SectionKey = (typeof SECTIONS)[number]['key'];
export const isSectionKey = (key: string): key is SectionKey => SECTIONS.some((s) => s.key === key);
export const sectionTitle = (key: SectionKey, count: number) => SECTIONS.find((s) => s.key === key)!.title(count);

/** Every section is stored and shown as a list of strings; SEO becomes [title, meta description]. */
export function sectionItems(pack: AdPack, key: SectionKey): string[] {
  return key === 'seo' ? [pack.seo.title, pack.seo.metaDescription] : pack[key];
}

const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '') : []);
const string = (v: unknown) => (typeof v === 'string' ? v : '');

/** Model output is untrusted: keep only the expected keys and shapes, so a malformed reply can't break storage or rendering. */
export function normalizePack(raw: unknown): AdPack {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const seo = (r.seo && typeof r.seo === 'object' ? r.seo : {}) as Record<string, unknown>;
  return {
    productSummary: string(r.productSummary),
    hooks: strings(r.hooks), tiktokScripts: strings(r.tiktokScripts), metaAds: strings(r.metaAds),
    instagramCaptions: strings(r.instagramCaptions), staticAdConcepts: strings(r.staticAdConcepts),
    ugcScripts: strings(r.ugcScripts), productPageAudit: strings(r.productPageAudit), faqs: strings(r.faqs),
    seo: { title: string(seo.title), metaDescription: string(seo.metaDescription) },
    testingPlan: strings(r.testingPlan),
  };
}

export class InputError extends Error {
  readonly status = 400;
}

const FIELDS: { key: keyof ProductInput; label: string; max: number; optionalUrl?: true }[] = [
  { key: 'productName', label: 'Product name', max: 200 },
  { key: 'productUrl', label: 'Product URL', max: 2048, optionalUrl: true },
  { key: 'category', label: 'Category', max: 200 },
  { key: 'price', label: 'Price', max: 50 },
  { key: 'targetCustomer', label: 'Target customer', max: 1000 },
  { key: 'mainProblem', label: 'Main problem solved', max: 1000 },
  { key: 'mainBenefit', label: 'Main benefit', max: 1000 },
  { key: 'keyFeatures', label: 'Key features', max: 2000 },
  { key: 'competitorLink', label: 'Competitor link', max: 2048, optionalUrl: true },
];
/** Form fields in order, for the new-pack page. */
export const INPUT_FIELDS = FIELDS.map(({ key, label, max, optionalUrl }) => ({ key, label, max, optional: Boolean(optionalUrl) }));

function isHttpUrl(value: string) {
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
}

/** Validates a product brief from a request or a stored row. Bounded lengths keep prompts, and the AI bill, in check. */
export function parseProductInput(body: unknown): ProductInput {
  if (!body || typeof body !== 'object') throw new InputError('Expected a JSON object');
  const b = body as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const f of FIELDS) {
    const value = typeof b[f.key] === 'string' ? (b[f.key] as string).trim() : '';
    if (!value) {
      if (f.optionalUrl) continue;
      throw new InputError(`${f.label} is required`);
    }
    if (value.length > f.max) throw new InputError(`${f.label} must be ${f.max} characters or fewer`);
    if (f.optionalUrl && !isHttpUrl(value)) throw new InputError(`${f.label} must be an http(s) URL`);
    out[f.key] = value;
  }
  if (!TONES.includes(b.tone as Tone)) throw new InputError(`Tone must be one of: ${TONES.join(', ')}`);
  return { ...(out as Omit<ProductInput, 'tone'>), tone: b.tone as Tone };
}

/** products table row <-> ProductInput. */
export const productRow = (userId: string, i: ProductInput) => ({
  user_id: userId, name: i.productName, url: i.productUrl ?? null, category: i.category, price: i.price,
  target_customer: i.targetCustomer, main_problem: i.mainProblem, main_benefit: i.mainBenefit,
  key_features: i.keyFeatures, competitor_link: i.competitorLink ?? null, tone: i.tone,
});
export const inputFromProductRow = (r: Record<string, unknown>) => parseProductInput({
  productName: r.name, productUrl: r.url ?? undefined, category: r.category, price: r.price,
  targetCustomer: r.target_customer, mainProblem: r.main_problem, mainBenefit: r.main_benefit,
  keyFeatures: r.key_features, competitorLink: r.competitor_link ?? undefined, tone: r.tone,
});
