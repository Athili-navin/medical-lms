-- =============================================================================
-- ENAMEL ROADS — RUN THIS ENTIRE FILE IN SUPABASE SQL EDITOR (Ctrl+A → Run)
-- Do NOT run only the bottom section. Start from line 1.
-- Safe to re-run.
-- =============================================================================

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  avatar text default '',
  role text not null check (role in ('student', 'tutor')) default 'student',
  subscription_plan text default 'none',
  subscription_expiry timestamptz,
  subscription_exempt boolean not null default false,
  joined_at timestamptz default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  thumbnail text default '',
  category text not null check (category in ('dental', 'general')) default 'dental',
  instructor_id uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text default '',
  order_index int not null default 1,
  created_at timestamptz default now()
);

create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  title text not null,
  content text default '',
  order_index int not null default 1,
  duration int default 15,
  created_at timestamptz default now()
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade unique,
  title text not null,
  url text not null,
  thumbnail text default '',
  duration int default 0,
  created_at timestamptz default now()
);

create table if not exists public.mcq_questions (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  question text not null,
  question_type text not null default 'normal',
  statements jsonb not null default '[]',
  image_path text default '',
  option_images jsonb not null default '[]',
  options jsonb not null default '[]',
  correct_index int not null default 0,
  explanation text default '',
  order_index int default 1,
  created_at timestamptz default now()
);

create table if not exists public.glossary_terms (
  id uuid primary key default gen_random_uuid(),
  term text not null,
  definition text not null,
  image_url text default '',
  chapter_id uuid references public.chapters(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  type text not null check (type in ('live', 'update', 'exam', 'general')) default 'general',
  tutor_id uuid references public.profiles(id),
  created_at timestamptz default now()
);

create table if not exists public.personal_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  content text default '',
  updated_at timestamptz default now(),
  unique (user_id, chapter_id)
);

create table if not exists public.chapter_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  completed_at timestamptz default now(),
  unique (user_id, chapter_id)
);

create table if not exists public.chapter_pdfs (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade unique,
  title text not null default 'Chapter PDF',
  url text not null,
  file_name text default '',
  created_at timestamptz default now()
);

-- Add columns if tables existed from an older schema
alter table public.glossary_terms add column if not exists image_url text default '';
alter table public.profiles add column if not exists subscription_exempt boolean not null default false;
alter table public.mcq_questions add column if not exists question_type text not null default 'normal';
alter table public.mcq_questions add column if not exists statements jsonb not null default '[]';
alter table public.mcq_questions add column if not exists image_path text default '';
alter table public.mcq_questions add column if not exists option_images jsonb not null default '[]';

-- Signup trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(nullif(new.raw_user_meta_data->>'role', 'tutor'), 'student')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.chapters enable row level security;
alter table public.videos enable row level security;
alter table public.mcq_questions enable row level security;
alter table public.glossary_terms enable row level security;
alter table public.announcements enable row level security;
alter table public.personal_notes enable row level security;
alter table public.chapter_progress enable row level security;
alter table public.chapter_pdfs enable row level security;

drop policy if exists "Anyone can read courses" on public.courses;
drop policy if exists "Anyone can read lessons" on public.lessons;
drop policy if exists "Anyone can read chapters" on public.chapters;
drop policy if exists "Anyone can read videos" on public.videos;
drop policy if exists "Anyone can read mcq" on public.mcq_questions;
drop policy if exists "Anyone can read glossary" on public.glossary_terms;
drop policy if exists "Anyone can read announcements" on public.announcements;
drop policy if exists "Anyone can read chapter pdfs meta" on public.chapter_pdfs;

create policy "Anyone can read courses" on public.courses for select using (true);
create policy "Anyone can read lessons" on public.lessons for select using (true);
create policy "Anyone can read chapters" on public.chapters for select using (true);
create policy "Anyone can read videos" on public.videos for select using (true);
create policy "Anyone can read mcq" on public.mcq_questions for select using (true);
create policy "Anyone can read glossary" on public.glossary_terms for select using (true);
create policy "Anyone can read announcements" on public.announcements for select using (true);
create policy "Anyone can read chapter pdfs meta" on public.chapter_pdfs for select using (true);

drop policy if exists "Tutors manage courses" on public.courses;
drop policy if exists "Tutors manage lessons" on public.lessons;
drop policy if exists "Tutors manage chapters" on public.chapters;
drop policy if exists "Tutors manage videos" on public.videos;
drop policy if exists "Tutors manage mcq" on public.mcq_questions;
drop policy if exists "Tutors manage glossary" on public.glossary_terms;
drop policy if exists "Tutors manage announcements" on public.announcements;
drop policy if exists "Tutors manage chapter pdfs" on public.chapter_pdfs;

create policy "Tutors manage courses" on public.courses for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'tutor')
);
create policy "Tutors manage lessons" on public.lessons for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'tutor')
);
create policy "Tutors manage chapters" on public.chapters for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'tutor')
);
create policy "Tutors manage videos" on public.videos for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'tutor')
);
create policy "Tutors manage mcq" on public.mcq_questions for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'tutor')
);
create policy "Tutors manage glossary" on public.glossary_terms for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'tutor')
);
create policy "Tutors manage announcements" on public.announcements for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'tutor')
);
create policy "Tutors manage chapter pdfs" on public.chapter_pdfs for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'tutor')
);

drop policy if exists "Users read own profile" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
drop policy if exists "Users manage own notes" on public.personal_notes;
drop policy if exists "Users manage own progress" on public.chapter_progress;

create policy "Users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users manage own notes" on public.personal_notes for all using (auth.uid() = user_id);
create policy "Users manage own progress" on public.chapter_progress for all using (auth.uid() = user_id);

-- Storage buckets
insert into storage.buckets (id, name, public) values ('lecture-videos', 'lecture-videos', false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('chapter-pdfs', 'chapter-pdfs', false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('glossary-images', 'glossary-images', false) on conflict (id) do nothing;

drop policy if exists "Authenticated users read videos" on storage.objects;
drop policy if exists "Tutors upload videos" on storage.objects;
drop policy if exists "Tutors update videos" on storage.objects;
drop policy if exists "Tutors delete videos" on storage.objects;
drop policy if exists "Authenticated read chapter pdfs" on storage.objects;
drop policy if exists "Tutors upload chapter pdfs" on storage.objects;
drop policy if exists "Tutors update chapter pdfs" on storage.objects;
drop policy if exists "Tutors delete chapter pdfs" on storage.objects;
drop policy if exists "Authenticated read glossary images" on storage.objects;
drop policy if exists "Tutors upload glossary images" on storage.objects;
drop policy if exists "Tutors update glossary images" on storage.objects;
drop policy if exists "Tutors delete glossary images" on storage.objects;

create policy "Authenticated users read videos" on storage.objects for select
  using (bucket_id = 'lecture-videos' and auth.role() = 'authenticated');
create policy "Tutors upload videos" on storage.objects for insert with check (
  bucket_id = 'lecture-videos' and exists (select 1 from public.profiles where id = auth.uid() and role = 'tutor'));
create policy "Tutors update videos" on storage.objects for update using (
  bucket_id = 'lecture-videos' and exists (select 1 from public.profiles where id = auth.uid() and role = 'tutor'));
create policy "Tutors delete videos" on storage.objects for delete using (
  bucket_id = 'lecture-videos' and exists (select 1 from public.profiles where id = auth.uid() and role = 'tutor'));

create policy "Authenticated read chapter pdfs" on storage.objects for select
  using (bucket_id = 'chapter-pdfs' and auth.role() = 'authenticated');
create policy "Tutors upload chapter pdfs" on storage.objects for insert with check (
  bucket_id = 'chapter-pdfs' and exists (select 1 from public.profiles where id = auth.uid() and role = 'tutor'));
create policy "Tutors update chapter pdfs" on storage.objects for update using (
  bucket_id = 'chapter-pdfs' and exists (select 1 from public.profiles where id = auth.uid() and role = 'tutor'));
create policy "Tutors delete chapter pdfs" on storage.objects for delete using (
  bucket_id = 'chapter-pdfs' and exists (select 1 from public.profiles where id = auth.uid() and role = 'tutor'));

create policy "Authenticated read glossary images" on storage.objects for select
  using (bucket_id = 'glossary-images' and auth.role() = 'authenticated');
create policy "Tutors upload glossary images" on storage.objects for insert with check (
  bucket_id = 'glossary-images' and exists (select 1 from public.profiles where id = auth.uid() and role = 'tutor'));
create policy "Tutors update glossary images" on storage.objects for update using (
  bucket_id = 'glossary-images' and exists (select 1 from public.profiles where id = auth.uid() and role = 'tutor'));
create policy "Tutors delete glossary images" on storage.objects for delete using (
  bucket_id = 'glossary-images' and exists (select 1 from public.profiles where id = auth.uid() and role = 'tutor'));
