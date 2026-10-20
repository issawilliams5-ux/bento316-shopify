import { NextResponse } from 'next/server';
import { generateAdPack } from '@/lib/ai';
import { errorResponse } from '@/lib/api-errors';
import { requireUser } from '@/lib/auth';
import { InputError, parseProductInput } from '@/lib/pack';
import { savePack } from '@/lib/pack-store';
import { GENERATE_EVENT_TYPE, enforceRateLimit } from '@/lib/rate-limit';
import { getSupabaseUserClient } from '@/lib/supabase';

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const body = await request.json().catch(() => { throw new InputError('Invalid JSON body'); });
    const input = parseProductInput(body);

    await enforceRateLimit(user.id, GENERATE_EVENT_TYPE);

    const pack = await generateAdPack(input);
    const id = await savePack(getSupabaseUserClient(user.token)!, user.id, input, pack);
    return NextResponse.json({ id });
  } catch (error) {
    return errorResponse(error, 'Generation failed');
  }
}
