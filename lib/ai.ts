import OpenAI from 'openai';
import { mockAdPack } from './demo';
import type { AdPack, ProductInput, SwipeItem } from './types';

function inspirationBlock(winners: SwipeItem[]): string {
  if (!winners.length) return '';
  const lines = winners.map((w) => `- (${w.platform || 'unknown platform'}) hook: "${w.hook}" | angle: ${w.angle} | notes: ${w.notes}`).join('\n');
  return `\n\nThe user has marked these of their own past ads as Winners in their swipe file. Match their proven hook/angle style where it fits this product - do not copy them verbatim:\n${lines}`;
}

export async function generateAdPack(input: ProductInput, winningSwipeItems: SwipeItem[] = []): Promise<AdPack> {
  if (!process.env.OPENAI_API_KEY) return mockAdPack(input);
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', response_format:{type:'json_object'}, messages:[{role:'system',content:'Generate ecommerce direct-response ad packs as strict JSON with keys productSummary,hooks,tiktokScripts,metaAds,instagramCaptions,staticAdConcepts,ugcScripts,productPageAudit,faqs,seo,testingPlan. No guarantees.' + inspirationBlock(winningSwipeItems)},{role:'user',content:JSON.stringify(input)}], temperature:.85 });
  const text = completion.choices[0]?.message.content;
  return text ? JSON.parse(text) as AdPack : mockAdPack(input);
}
