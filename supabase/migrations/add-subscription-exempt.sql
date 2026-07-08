-- Adds subscription_exempt for testing/demo student accounts (no Razorpay required)

alter table public.profiles
  add column if not exists subscription_exempt boolean not null default false;

comment on column public.profiles.subscription_exempt is
  'When true, student can access all content without an active paid subscription.';
