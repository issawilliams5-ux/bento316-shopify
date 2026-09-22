import { createClient, isAuthApiError, isAuthRetryableFetchError } from '@supabase/supabase-js';
import { isSupabaseConfigured } from './supabase';

export type AuthedUser = { id: string; email?: string };

export class AuthError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

function bearerToken(request: Request) {
  const header = request.headers.get('authorization');
  if (!header) return null;
  const [scheme, ...rest] = header.split(' ');
  if (scheme.toLowerCase() !== 'bearer') return null;
  const token = rest.join(' ').trim();
  return token || null;
}

/**
 * Resolves the caller from a Supabase access token in the Authorization
 * header. Fails closed: with Supabase unconfigured there is no way to tell
 * callers apart, so every request is rejected rather than let through.
 */
export async function requireUser(request: Request): Promise<AuthedUser> {
  if (!isSupabaseConfigured) throw new AuthError('Authentication is not configured', 503);

  const token = bearerToken(request);
  if (!token) throw new AuthError('Missing bearer token', 401);

  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data, error } = await client.auth.getUser(token);

  if (error) {
    // Only the auth server actually rejecting the token is the caller's
    // fault. A network failure or a 5xx means we could not check at all —
    // telling the caller their token is invalid would be a lie, and one
    // that sends them off to re-authenticate over an outage they cannot fix.
    if (!reachedAuthServer(error)) {
      console.error('Supabase auth check failed', error);
      throw new AuthError('Authentication is temporarily unavailable', 503);
    }
    throw new AuthError('Invalid or expired token', 401);
  }

  if (!data.user) throw new AuthError('Invalid or expired token', 401);

  return { id: data.user.id, email: data.user.email };
}

/** True when the auth server answered with a verdict on the token. */
function reachedAuthServer(error: unknown) {
  if (isAuthRetryableFetchError(error)) return false;   // never got a response
  if (isAuthApiError(error)) return (error.status ?? 0) < 500;
  return false;                                          // unknown shape: do not blame the caller
}
