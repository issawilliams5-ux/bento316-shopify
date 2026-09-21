import { createClient } from '@supabase/supabase-js';
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
  if (error || !data.user) throw new AuthError('Invalid or expired token', 401);

  return { id: data.user.id, email: data.user.email };
}
