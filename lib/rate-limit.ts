import { getSupabaseAdminClient } from './supabase';

// Sliding window over usage_events, which already exists for this purpose.
// Per-user and stored in Postgres rather than in memory, because serverless
// instances do not share memory — an in-process counter would reset on every
// cold start and count separately per instance.

export const IMAGE_EVENT_TYPE = 'image_generation';
export const LEGAL_EVENT_TYPE = 'legal_review';
export const GENERATE_EVENT_TYPE = 'ad_pack_generation';

const limits = {
  [IMAGE_EVENT_TYPE]: { env: 'IMAGE_RATE_LIMIT', fallback: 10, noun: 'images' },
  [LEGAL_EVENT_TYPE]: { env: 'LEGAL_RATE_LIMIT', fallback: 20, noun: 'legal reviews' },
  [GENERATE_EVENT_TYPE]: { env: 'GENERATE_RATE_LIMIT', fallback: 10, noun: 'ad pack generations' }
} as const;
type EventType = keyof typeof limits;

const limitFor = (type: EventType) => Number(process.env[limits[type].env]) || limits[type].fallback;
const windowMinutes = () => Number(process.env.IMAGE_RATE_WINDOW_MINUTES) || 60;

export class RateLimitError extends Error {
  readonly status = 429;
  constructor(readonly retryAfterSeconds: number, type: EventType = IMAGE_EVENT_TYPE) {
    super(`Rate limit exceeded: ${limitFor(type)} ${limits[type].noun} per ${windowMinutes()} minutes`);
  }
}

/**
 * Throws RateLimitError when the user is over quota, otherwise records this
 * request against the window. Recorded before generation, so a request that
 * fails upstream still counts — retries cannot be used to bypass the limit.
 *
 * The count and the insert are two statements, so simultaneous requests can
 * both pass a boundary check and admit up to (concurrency - 1) extra images.
 * The bound is small and self-correcting within the window; tighten it with a
 * Postgres function doing both in one statement if that ever matters.
 */
export async function enforceImageRateLimit(userId: string): Promise<void> {
  return enforceRateLimit(userId, IMAGE_EVENT_TYPE);
}

export async function enforceRateLimit(userId: string, eventType: EventType): Promise<void> {
  const supabase = getSupabaseAdminClient();
  // No service role key means no shared counter. Fail closed: an unlimited
  // image endpoint is worse than an unavailable one.
  if (!supabase) throw new RateLimitError(windowMinutes() * 60, eventType);

  const windowStart = new Date(Date.now() - windowMinutes() * 60_000).toISOString();

  const { data, error } = await supabase
    .from('usage_events')
    .select('created_at')
    .eq('user_id', userId)
    .eq('event_type', eventType)
    .gte('created_at', windowStart)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Rate limit lookup failed: ${error.message}`);

  if (data.length >= limitFor(eventType)) {
    // The window frees up when its oldest request ages out.
    const oldest = new Date(data[0].created_at).getTime();
    const retryAfter = Math.max(1, Math.ceil((oldest + windowMinutes() * 60_000 - Date.now()) / 1000));
    throw new RateLimitError(retryAfter, eventType);
  }

  const { error: insertError } = await supabase
    .from('usage_events')
    .insert({ user_id: userId, event_type: eventType });

  if (insertError) throw new Error(`Rate limit write failed: ${insertError.message}`);
}
