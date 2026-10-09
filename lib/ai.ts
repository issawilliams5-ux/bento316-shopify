import OpenAI from 'openai';
import { checkClaims } from './claim-check';
import { mockAdPack } from './demo';
import type { AdPack, ProductInput } from './types';

const listKeys = ['hooks','tiktokScripts','metaAds','instagramCaptions','staticAdConcepts','ugcScripts','productPageAudit','faqs','testingPlan'] as const;
// The model's JSON is untrusted: check the shape the UI renders before returning it.
function isAdPack(value: unknown): value is AdPack {
  if (!value || typeof value !== 'object') return false;
  const pack = value as Record<string, unknown>;
  const seo = pack.seo as Record<string, unknown> | undefined;
  return typeof pack.productSummary === 'string'
    && listKeys.every((key) => Array.isArray(pack[key]) && (pack[key] as unknown[]).every((item) => typeof item === 'string'))
    && !!seo && typeof seo.title === 'string' && typeof seo.metaDescription === 'string';
}
export async function generateAdPack(input: ProductInput): Promise<AdPack> {
  if (!process.env.OPENAI_API_KEY) return mockAdPack(input);
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', response_format:{type:'json_object'}, messages:[{role:'system',content:'Generate ecommerce direct-response ad packs as strict JSON with keys productSummary,hooks,tiktokScripts,metaAds,instagramCaptions,staticAdConcepts,ugcScripts,productPageAudit,faqs,seo,testingPlan. No guarantees.'},{role:'user',content:JSON.stringify(input)}], temperature:.85 });
  const text = completion.choices[0]?.message.content;
  if (!text) return mockAdPack(input);
  const pack: unknown = JSON.parse(text);
  if (!isAdPack(pack)) throw new Error('Model returned an incomplete ad pack');
  return { ...pack, claimCheck: await checkClaims(pack, input.productName) };
}
