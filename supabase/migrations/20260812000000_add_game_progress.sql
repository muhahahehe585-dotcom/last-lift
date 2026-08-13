-- Stores Last Lift progress for each signed-in user.
-- Apply with: npm run db:push

create table if not exists public.game_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  coins integer not null default 0 check (coins >= 0),
  double_jump_unlocked boolean not null default false,
  infinity_gauntlet_unlocked boolean not null default false,
  endings text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.game_progress enable row level security;

create policy "read own game progress"
  on public.game_progress for select
  using (auth.uid() = user_id);

create policy "insert own game progress"
  on public.game_progress for insert
  with check (auth.uid() = user_id);

create policy "update own game progress"
  on public.game_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
