import { createClient } from '@supabase/supabase-js';

export const isSupabaseServerConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export function getSupabaseServerClient() {
  if (!isSupabaseServerConfigured) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}
