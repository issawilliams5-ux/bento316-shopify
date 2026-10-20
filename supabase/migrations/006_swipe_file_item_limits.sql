-- Swipe file rows are written straight from the browser (RLS "own rows"), so the
-- database is the trust boundary: only http(s) links, bounded text.
-- NOT VALID: existing rows are not re-checked; new and updated rows are.
alter table swipe_file_items
  add constraint swipe_ad_link_http check (ad_link ~* '^https?://' and char_length(ad_link) <= 2048) not valid,
  add constraint swipe_platform_len check (char_length(platform) <= 100) not valid,
  add constraint swipe_product_len check (char_length(product) <= 200) not valid,
  add constraint swipe_hook_len check (char_length(hook) <= 1000) not valid,
  add constraint swipe_angle_len check (char_length(angle) <= 1000) not valid,
  add constraint swipe_notes_len check (char_length(notes) <= 2000) not valid;
