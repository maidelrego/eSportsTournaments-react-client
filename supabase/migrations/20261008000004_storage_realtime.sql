-- Avatars bucket (replaces Cloudinary) and Realtime for notifications (replaces the Socket.IO gateway).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  311000,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Public bucket: anyone can read through the public URL. Writes only inside "<auth.uid()>/".
create policy avatars_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy avatars_select_own on storage.objects
  for select to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy avatars_update_own on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy avatars_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Realtime: clients subscribe to INSERTs on notifications filtered by receiver_id (RLS still applies).
alter publication supabase_realtime add table public.notifications;

-- Realtime Presence for "friends online": private channel "general", signed-in users only.
create policy general_presence_select on realtime.messages
  for select to authenticated
  using (realtime.messages.extension = 'presence' and (select realtime.topic()) = 'general');

create policy general_presence_insert on realtime.messages
  for insert to authenticated
  with check (realtime.messages.extension = 'presence' and (select realtime.topic()) = 'general');
