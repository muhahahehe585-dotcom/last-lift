-- Uses Supabase's auth.email() helper for admin-only feedback deletes.

drop policy if exists "delete feedback board" on public.feedback;

create policy "delete feedback board"
  on public.feedback for delete
  using (lower(auth.email()) = 'muhahahehe585@gmail.com');
