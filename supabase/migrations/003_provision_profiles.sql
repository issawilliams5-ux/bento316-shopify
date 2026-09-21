-- usage_events.user_id (and products, ad_packs, swipe_file_items,
-- subscriptions) reference profiles(id), but nothing provisioned a profile
-- row, so every insert keyed on an authenticated user hit a foreign key
-- violation. Provision from auth.users, the source of those ids.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Users who registered before this trigger existed.
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;
