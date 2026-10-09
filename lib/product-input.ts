import type { ProductInput, Tone } from './types';

export const tones: Tone[] = ['Premium','Viral TikTok','Luxury','Problem/Solution','UGC','Bold Direct Response'];
const required = ['productName','category','price','targetCustomer','mainProblem','mainBenefit','keyFeatures'] as const;
const optionalUrls = ['productUrl','competitorLink'] as const;
const MAX = 1000;

// Validates the untrusted request body for /api/generate. Returns the clean input or a message for the user.
export function parseProductInput(body: unknown): { input: ProductInput } | { error: string } {
  if (!body || typeof body !== 'object') return { error: 'Send the product details as JSON.' };
  const raw = body as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const key of required) {
    const value = typeof raw[key] === 'string' ? raw[key].trim() : '';
    if (!value) return { error: `${key} is required.` };
    if (value.length > MAX) return { error: `${key} must be ${MAX} characters or fewer.` };
    out[key] = value;
  }
  for (const key of optionalUrls) {
    const value = typeof raw[key] === 'string' ? raw[key].trim() : '';
    if (!value) continue;
    let url: URL;
    try { url = new URL(value); } catch { return { error: `${key} must be a full URL.` }; }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return { error: `${key} must be an http(s) URL.` };
    out[key] = url.toString();
  }
  if (!tones.includes(raw.tone as Tone)) return { error: 'Pick one of the listed tones.' };
  return { input: { ...out, tone: raw.tone } as ProductInput };
}
