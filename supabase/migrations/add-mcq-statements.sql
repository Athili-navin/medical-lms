-- Statement-wise MCQ support (numbered statements + combination options)
alter table public.mcq_questions
  add column if not exists statements jsonb not null default '[]';
