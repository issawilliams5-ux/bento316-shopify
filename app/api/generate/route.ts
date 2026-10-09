import { NextResponse } from 'next/server';
import { generateAdPack } from '@/lib/ai';
import { parseProductInput } from '@/lib/product-input';
export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Send the product details as JSON.' }, { status: 400 }); }
  const parsed = parseProductInput(body);
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  try { return NextResponse.json(await generateAdPack(parsed.input)); }
  catch (error) { console.error('Ad pack generation failed', error); return NextResponse.json({ error: 'Generation failed. Try again in a moment.' }, { status: 500 }); }
}
