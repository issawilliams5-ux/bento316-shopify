import { NextResponse } from 'next/server';
import { listSwipeItems, createSwipeItem } from '@/lib/swipe';
import type { SwipeItem } from '@/lib/types';

export async function GET() {
  const items = await listSwipeItems();
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  try {
    const item = (await request.json()) as SwipeItem;
    if (!item.adLink || !item.product) {
      return NextResponse.json({ error: 'Ad link and product are required' }, { status: 400 });
    }
    await createSwipeItem(item);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Save failed' }, { status: 500 });
  }
}
