import OpenAI from 'openai';
import { checkClaims } from './claim-check';
import { mockAdPack } from './demo';
import type { AdPack, ProductInput } from './types';
export async function generateAdPack(input: ProductInput): Promise<AdPack> {
  if (!process.env.OPENAI_API_KEY) return mockAdPack(input);
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', response_format:{type:'json_object'}, messages:[{role:'system',content:'Generate ecommerce direct-response ad packs as strict JSON with keys productSummary,hooks,tiktokScripts,metaAds,instagramCaptions,staticAdConcepts,ugcScripts,productPageAudit,faqs,seo,testingPlan. No guarantees.'},{role:'user',content:JSON.stringify(input)}], temperature:.85 });
  const text = completion.choices[0]?.message.content;
  if (!text) return mockAdPack(input);
  const pack = JSON.parse(text) as AdPack;
  return { ...pack, claimCheck: await checkClaims(pack, input.productName) };
}
