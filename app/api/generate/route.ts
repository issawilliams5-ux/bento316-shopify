import { NextResponse } from 'next/server';
import { generateAdPack } from '@/lib/ai';
import { getWinningSwipeItems } from '@/lib/swipe';
export async function POST(request: Request) { try { const input = await request.json(); const winningSwipeItems = await getWinningSwipeItems(); const adPack = await generateAdPack(input, winningSwipeItems); return NextResponse.json(adPack); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Generation failed' }, { status: 500 }); } }
