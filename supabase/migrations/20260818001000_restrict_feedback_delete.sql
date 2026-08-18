-- Updates feedback deletes after the first feedback migration was already applied.

drop policy if exists "delete feedback board" on public.feedback;

create policy "delete feedback board"
  on public.feedback for delete
  using (lower(auth.jwt() ->> 'email') = 'muhahahehe585@gmail.com');
