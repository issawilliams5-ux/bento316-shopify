-- handle_new_user is a trigger function, but living in public makes it
-- callable over PostgREST as /rest/v1/rpc/handle_new_user by anon and
-- authenticated. It is security definer, so it must not be reachable that
-- way: only the trigger on auth.users should ever invoke it.
--
-- Caught by Supabase's own database linter after 003 was applied
-- (lints 0028 and 0029).
revoke execute on function public.handle_new_user() from public, anon, authenticated;
