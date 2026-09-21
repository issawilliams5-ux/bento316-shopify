import { createClient } from '@supabase/supabase-js';
export const isSupabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export function getSupabaseBrowserClient() { if (!isSupabaseConfigured) return null; return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!); }
export const isSupabaseAdminConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
/** Server-only client. The service role key bypasses RLS — never import this from a component. */
export function getSupabaseAdminClient() { if (!isSupabaseAdminConfigured) return null; return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } }); }
