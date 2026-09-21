-- Supports the sliding-window rate limit in lib/rate-limit.ts, which reads
-- usage_events by (user_id, event_type) over a recent created_at range.
create index if not exists usage_events_user_type_created_at_idx
  on usage_events (user_id, event_type, created_at desc);
