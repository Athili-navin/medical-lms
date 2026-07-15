-- Run this in Supabase SQL Editor if MCQ save fails (old schema missing new columns).
-- Safe to re-run. Project: https://wjsbjpnhiankhbxbbpit.supabase.co

alter table public.mcq_questions add column if not exists question_type text not null default 'normal';
alter table public.mcq_questions add column if not exists statements jsonb not null default '[]';
alter table public.mcq_questions add column if not exists image_path text default '';
alter table public.mcq_questions add column if not exists option_images jsonb not null default '[]';

-- Reload API schema cache so the app sees new columns immediately
notify pgrst, 'reload schema';

-- Should list: question_type, statements, image_path, option_images
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'mcq_questions'
order by ordinal_position;
