import { NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api-errors';
import { requireUser } from '@/lib/auth';
import { InputError } from '@/lib/pack';
import { regenerateSection } from '@/lib/pack-store';
import { GENERATE_EVENT_TYPE, enforceRateLimit } from '@/lib/rate-limit';
import { getSupabaseUserClient } from '@/lib/supabase';

export const maxDuration = 120;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** POST { sectionId } -> { items }: regenerates one section of a saved pack. Counts against the generation limit. */
export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const body = await request.json().catch(() => { throw new InputError('Invalid JSON body'); });
    const sectionId = (body as { sectionId?: unknown })?.sectionId;
    if (typeof sectionId !== 'string' || !UUID.test(sectionId)) throw new InputError('sectionId must be a UUID');

    const items = await regenerateSection(getSupabaseUserClient(user.token)!, sectionId, () => enforceRateLimit(user.id, GENERATE_EVENT_TYPE));
    return NextResponse.json({ items });
  } catch (error) {
    return errorResponse(error, 'Regeneration failed');
  }
}
