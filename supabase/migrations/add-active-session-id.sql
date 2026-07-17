-- Single active session per account (new login invalidates other devices)
alter table public.profiles
  add column if not exists active_session_id uuid;

notify pgrst, 'reload schema';
