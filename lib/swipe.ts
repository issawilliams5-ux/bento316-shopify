import { getSupabaseServerClient } from './supabaseServer';
import { demoSwipe } from './demo';
import type { SwipeItem } from './types';

const TABLE = 'swipe_file_items';
const COLUMNS = 'ad_link,platform,product,hook,angle,notes,status';

type SwipeRow = { ad_link: string; platform: string | null; product: string | null; hook: string | null; angle: string | null; notes: string | null; status: SwipeItem['status'] };

function fromRow(row: SwipeRow): SwipeItem {
  return { adLink: row.ad_link, platform: row.platform ?? '', product: row.product ?? '', hook: row.hook ?? '', angle: row.angle ?? '', notes: row.notes ?? '', status: row.status };
}

export async function listSwipeItems(): Promise<SwipeItem[]> {
  const client = getSupabaseServerClient();
  if (!client) return demoSwipe;
  const { data, error } = await client.from(TABLE).select(COLUMNS).order('created_at', { ascending: false });
  if (error || !data) return demoSwipe;
  return (data as SwipeRow[]).map(fromRow);
}

export async function createSwipeItem(item: SwipeItem): Promise<void> {
  const client = getSupabaseServerClient();
  if (!client) return; // demo mode: nothing configured to persist to
  const { error } = await client.from(TABLE).insert({ ad_link: item.adLink, platform: item.platform, product: item.product, hook: item.hook, angle: item.angle, notes: item.notes, status: item.status });
  if (error) throw new Error(error.message);
}

/**
 * Simple filter, not similarity search: the swipe file is a small, manually
 * curated per-account list, not a corpus that needs embeddings/ANN search.
 * Matches lib/ai.ts's few-shot inspiration block against the most recently
 * marked Winners, regardless of category (swipe_file_items has none).
 */
export async function getWinningSwipeItems(limit = 3): Promise<SwipeItem[]> {
  const client = getSupabaseServerClient();
  if (!client) return demoSwipe.filter((item) => item.status === 'Winner').slice(0, limit);
  const { data, error } = await client.from(TABLE).select(COLUMNS).eq('status', 'Winner').order('created_at', { ascending: false }).limit(limit);
  if (error || !data) return [];
  return (data as SwipeRow[]).map(fromRow);
}
