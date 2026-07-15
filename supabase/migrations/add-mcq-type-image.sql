-- MCQ question types: normal, statement, image
alter table public.mcq_questions
  add column if not exists question_type text not null default 'normal';

alter table public.mcq_questions
  add column if not exists image_path text default '';
