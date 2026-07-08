-- Run in Supabase SQL Editor
-- Clears all course content (brand new) + updates subscription defaults

-- Remove all course-related content (order matters for FKs)
delete from public.personal_notes;
delete from public.chapter_progress;
delete from public.mcq_questions;
delete from public.glossary_terms;
delete from public.chapter_pdfs;
delete from public.videos;
delete from public.chapters;
delete from public.lessons;
delete from public.courses;

-- Reset student subscriptions (no free tier — must subscribe)
update public.profiles
set subscription_plan = 'none',
    subscription_expiry = null
where role = 'student';

-- Default for new signups
alter table public.profiles alter column subscription_plan set default 'none';

-- Optional: clear announcements for fresh start
delete from public.announcements;
