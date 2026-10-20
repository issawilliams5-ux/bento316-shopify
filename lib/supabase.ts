import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
export const isSupabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
let browserClient: ReturnType<typeof createClient> | null = null;
// One instance per page: several clients would race each other refreshing the same stored session.
export function getSupabaseBrowserClient(): SupabaseClient | null { if (!isSupabaseConfigured) return null; return browserClient ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!); }
/** Server-side client acting as the caller: row level security applies exactly as in their browser. */
export function getSupabaseUserClient(token: string) { if (!isSupabaseConfigured) return null; return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false }, global: { headers: { Authorization: `Bearer ${token}` } } }); }
export const isSupabaseAdminConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
/** Server-only client. The service role key bypasses RLS — never import this from a component. */
export function getSupabaseAdminClient() { if (!isSupabaseAdminConfigured) return null; return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } }); }
/** The signed-in user's access token, for calling the app's authenticated API routes. Null when signed out or in demo mode. */
export async function getAccessToken() { const supabase = getSupabaseBrowserClient(); if (!supabase) return null; const { data } = await supabase.auth.getSession(); return data.session?.access_token ?? null; }
