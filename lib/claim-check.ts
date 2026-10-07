import type { AdPack, ClaimCheck } from './types';

const TYPESAFE_URL = 'https://api.typesafe.ai/v1/systemone';
// Each line is its own request (its own state); this caps how many run at once.
const BATCH = 25;
// A starting threshold, not a measured one: tune it on real packs.
export const FLAG_AT = 0.5;

const question = {
  type: 'noul',
  instructions: 'Does `line`, a line of ecommerce ad copy for `product`, promise a guaranteed result, or make a health, medical, income or before/after claim the seller would need proof for?',
  criteria: {
    true: 'It guarantees an outcome ("guaranteed", "100% works", "never fails") or makes a health, medical, weight-loss, income or dramatic before/after claim.',
    false: 'Ordinary persuasive copy: benefits, features, feelings or social proof without a guarantee or a claim that needs proof.'
  }
} as const;

const sectionKeys = ['hooks', 'tiktokScripts', 'metaAds', 'instagramCaptions', 'staticAdConcepts', 'ugcScripts', 'faqs'] as const;

// Flags risky lines in a generated pack with TypeSafe Noul judgments. Never edits the copy.
// Returns status 'skipped' without a key and 'unavailable' on any failure, so a failed check is never reported as clean.
export async function checkClaims(pack: AdPack, product: string): Promise<ClaimCheck> {
  const apiKey = process.env.TYPESAFE_API_KEY?.trim();
  if (!apiKey) return { status: 'skipped', flags: [] };
  const lines = sectionKeys.flatMap((section) => (Array.isArray(pack[section]) ? pack[section] : []).map((text, index) => ({ section, index, text })))
    .filter((line) => typeof line.text === 'string' && line.text.trim());
  try {
    const flags: ClaimCheck['flags'] = [];
    for (let start = 0; start < lines.length; start += BATCH) {
      const batch = lines.slice(start, start + BATCH);
      const answers = await Promise.all(batch.map(async (line) => {
        const response = await fetch(TYPESAFE_URL, {
          method: 'POST',
          redirect: 'error',
          signal: AbortSignal.timeout(10_000),
          headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
          body: JSON.stringify({ model: process.env.TYPESAFE_DEFAULT_MODEL || 'jev-latest', state: { product, line: line.text }, questions: { risky: question } })
        });
        if (!response.ok) throw new Error(`TypeSafe returned ${response.status}`);
        const probability = Number((await response.json())?.answers?.risky?.noul);
        if (!Number.isFinite(probability)) throw new Error('TypeSafe returned no judgment');
        return probability;
      }));
      batch.forEach((line, i) => { if (answers[i] >= FLAG_AT) flags.push({ ...line, probability: answers[i] }); });
    }
    return { status: 'checked', flags };
  } catch (error) {
    console.error('Claim check failed', error);
    return { status: 'unavailable', flags: [] };
  }
}
