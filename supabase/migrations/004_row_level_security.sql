-- 001 created every table with RLS off, so the anon key — which ships in the
-- browser bundle — could read and write all rows in all tables. Enable RLS
-- everywhere and scope each table to the authenticated owner.
--
-- The service role bypasses RLS entirely, so server-side code holding
-- SUPABASE_SERVICE_ROLE_KEY (lib/rate-limit.ts, Stripe webhooks) is unaffected
-- by these policies and needs none of its own.

alter table profiles enable row level security;
alter table products enable row level security;
alter table ad_packs enable row level security;
alter table generated_sections enable row level security;
alter table swipe_file_items enable row level security;
alter table usage_events enable row level security;
alter table subscriptions enable row level security;

-- profiles: a user reads and edits only their own row. Inserts are left to the
-- on_auth_user_created trigger in 003, which runs as security definer.
create policy profiles_select_own on profiles
  for select to authenticated using (id = (select auth.uid()));
create policy profiles_update_own on profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- products, ad_packs, swipe_file_items: full ownership by user_id. The with
-- check clause on insert and update stops a user writing rows owned by
-- someone else.
create policy products_all_own on products
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy ad_packs_all_own on ad_packs
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy swipe_file_items_all_own on swipe_file_items
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- generated_sections has no user_id; ownership comes from its ad_pack.
create policy generated_sections_all_own on generated_sections
  for all to authenticated
  using (
    exists (
      select 1 from ad_packs
      where ad_packs.id = generated_sections.ad_pack_id
        and ad_packs.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from ad_packs
      where ad_packs.id = generated_sections.ad_pack_id
        and ad_packs.user_id = (select auth.uid())
    )
  );

-- usage_events and subscriptions are server-written records a user may read
-- but must not forge: quota rows and billing state. No insert, update or
-- delete policy, so only the service role writes them.
create policy usage_events_select_own on usage_events
  for select to authenticated using (user_id = (select auth.uid()));

create policy subscriptions_select_own on subscriptions
  for select to authenticated using (user_id = (select auth.uid()));
