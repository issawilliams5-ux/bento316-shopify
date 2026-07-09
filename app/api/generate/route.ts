import { NextResponse } from 'next/server';
import { generateAdPack } from '@/lib/ai';
export async function POST(request: Request) { try { const input = await request.json(); const adPack = await generateAdPack(input); return NextResponse.json(adPack); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Generation failed' }, { status: 500 }); } }
