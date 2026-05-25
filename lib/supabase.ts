import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/*
  Supabase SQL — run this in your project's SQL editor:

  CREATE TABLE leads (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name        text NOT NULL,
    phone       text,
    email       text,
    business_type text,
    service     text,
    budget      text,
    urgency     text,
    notes       text,
    lead_score  integer DEFAULT 0,
    status      text DEFAULT 'new',
    suggested_sms   text,
    suggested_email text,
    created_at  timestamptz DEFAULT now()
  );

  ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

  -- Allow server-side service role full access
  CREATE POLICY "service_role_all" ON leads
    FOR ALL USING (auth.role() = 'service_role');

  -- Allow anon to insert (lead capture)
  CREATE POLICY "anon_insert" ON leads
    FOR INSERT TO anon WITH CHECK (true);
*/
