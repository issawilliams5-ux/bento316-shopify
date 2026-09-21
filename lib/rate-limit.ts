import { getSupabaseAdminClient } from './supabase';

// Sliding window over usage_events, which already exists for this purpose.
// Per-user and stored in Postgres rather than in memory, because serverless
// instances do not share memory — an in-process counter would reset on every
// cold start and count separately per instance.

export const IMAGE_EVENT_TYPE = 'image_generation';

const limit = () => Number(process.env.IMAGE_RATE_LIMIT) || 10;
const windowMinutes = () => Number(process.env.IMAGE_RATE_WINDOW_MINUTES) || 60;

export class RateLimitError extends Error {
  readonly status = 429;
  constructor(readonly retryAfterSeconds: number) {
    super(`Rate limit exceeded: ${limit()} images per ${windowMinutes()} minutes`);
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
  const supabase = getSupabaseAdminClient();
  // No service role key means no shared counter. Fail closed: an unlimited
  // image endpoint is worse than an unavailable one.
  if (!supabase) throw new RateLimitError(windowMinutes() * 60);

  const windowStart = new Date(Date.now() - windowMinutes() * 60_000).toISOString();

  const { data, error } = await supabase
    .from('usage_events')
    .select('created_at')
    .eq('user_id', userId)
    .eq('event_type', IMAGE_EVENT_TYPE)
    .gte('created_at', windowStart)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Rate limit lookup failed: ${error.message}`);

  if (data.length >= limit()) {
    // The window frees up when its oldest request ages out.
    const oldest = new Date(data[0].created_at).getTime();
    const retryAfter = Math.max(1, Math.ceil((oldest + windowMinutes() * 60_000 - Date.now()) / 1000));
    throw new RateLimitError(retryAfter);
  }

  const { error: insertError } = await supabase
    .from('usage_events')
    .insert({ user_id: userId, event_type: IMAGE_EVENT_TYPE });

  if (insertError) throw new Error(`Rate limit write failed: ${insertError.message}`);
}
