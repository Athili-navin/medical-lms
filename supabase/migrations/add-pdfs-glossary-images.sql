-- Run in Supabase SQL Editor (safe to re-run)

alter table public.glossary_terms
  add column if not exists image_url text default '';

create table if not exists public.chapter_pdfs (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade unique,
  title text not null default 'Chapter PDF',
  url text not null,
  file_name text default '',
  created_at timestamptz default now()
);

alter table public.chapter_pdfs enable row level security;

drop policy if exists "Anyone can read chapter pdfs meta" on public.chapter_pdfs;
drop policy if exists "Tutors manage chapter pdfs" on public.chapter_pdfs;

create policy "Anyone can read chapter pdfs meta" on public.chapter_pdfs for select using (true);
create policy "Tutors manage chapter pdfs" on public.chapter_pdfs for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'tutor')
);

insert into storage.buckets (id, name, public)
values ('chapter-pdfs', 'chapter-pdfs', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('glossary-images', 'glossary-images', false)
on conflict (id) do nothing;

drop policy if exists "Authenticated read chapter pdfs" on storage.objects;
drop policy if exists "Tutors upload chapter pdfs" on storage.objects;
drop policy if exists "Tutors update chapter pdfs" on storage.objects;
drop policy if exists "Tutors delete chapter pdfs" on storage.objects;
drop policy if exists "Authenticated read glossary images" on storage.objects;
drop policy if exists "Tutors upload glossary images" on storage.objects;
drop policy if exists "Tutors update glossary images" on storage.objects;
drop policy if exists "Tutors delete glossary images" on storage.objects;

create policy "Authenticated read chapter pdfs"
on storage.objects for select
using (bucket_id = 'chapter-pdfs' and auth.role() = 'authenticated');

create policy "Tutors upload chapter pdfs"
on storage.objects for insert
with check (
  bucket_id = 'chapter-pdfs'
  and exists (select 1 from public.profiles where id = auth.uid() and role = 'tutor')
);

create policy "Tutors update chapter pdfs"
on storage.objects for update
using (
  bucket_id = 'chapter-pdfs'
  and exists (select 1 from public.profiles where id = auth.uid() and role = 'tutor')
);

create policy "Tutors delete chapter pdfs"
on storage.objects for delete
using (
  bucket_id = 'chapter-pdfs'
  and exists (select 1 from public.profiles where id = auth.uid() and role = 'tutor')
);

create policy "Authenticated read glossary images"
on storage.objects for select
using (bucket_id = 'glossary-images' and auth.role() = 'authenticated');

create policy "Tutors upload glossary images"
on storage.objects for insert
with check (
  bucket_id = 'glossary-images'
  and exists (select 1 from public.profiles where id = auth.uid() and role = 'tutor')
);

create policy "Tutors update glossary images"
on storage.objects for update
using (
  bucket_id = 'glossary-images'
  and exists (select 1 from public.profiles where id = auth.uid() and role = 'tutor')
);

create policy "Tutors delete glossary images"
on storage.objects for delete
using (
  bucket_id = 'glossary-images'
  and exists (select 1 from public.profiles where id = auth.uid() and role = 'tutor')
);
