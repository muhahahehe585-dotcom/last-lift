-- Adds one-use armor inventory to saved progress.
-- Apply with: npm run db:push

alter table public.game_progress
  add column if not exists armor_count integer not null default 0 check (armor_count >= 0);
