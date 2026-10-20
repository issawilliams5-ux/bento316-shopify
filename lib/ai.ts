import OpenAI from 'openai';
import { checkClaims } from './claim-check';
import { mockAdPack } from './demo';
import { normalizePack } from './pack';
import type { AdPack, ProductInput } from './types';
export async function generateAdPack(input: ProductInput): Promise<AdPack> {
  if (!process.env.OPENAI_API_KEY) return mockAdPack(input);
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', response_format:{type:'json_object'}, messages:[{role:'system',content:'Generate ecommerce direct-response ad packs as strict JSON with keys productSummary (string), hooks (50 strings), tiktokScripts (10), metaAds (10), instagramCaptions (10), staticAdConcepts (10), ugcScripts (5), productPageAudit (strings), faqs (strings), seo ({title, metaDescription}), testingPlan (7 strings, one per day). No guarantees.'},{role:'user',content:JSON.stringify(input)}], temperature:.85 });
  const text = completion.choices[0]?.message.content;
  if (!text) return mockAdPack(input);
  const pack = normalizePack(JSON.parse(text));
  return { ...pack, claimCheck: await checkClaims(pack, input.productName) };
}
