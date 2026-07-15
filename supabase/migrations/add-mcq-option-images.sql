-- Optional image per MCQ answer option (parallel to options array)
alter table public.mcq_questions
  add column if not exists option_images jsonb not null default '[]';
