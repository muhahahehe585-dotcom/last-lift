-- Stores player feedback and bug reports. Apply with: npm run db:push

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  message text not null check (char_length(trim(message)) between 3 and 1200),
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

create policy "read feedback board"
  on public.feedback for select
  using (auth.uid() is not null);

create policy "insert own feedback"
  on public.feedback for insert
  with check (auth.uid() = user_id);
