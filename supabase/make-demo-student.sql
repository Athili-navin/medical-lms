-- Demo / testing student account (no subscription required)
-- Run in Supabase SQL Editor AFTER creating the user (see steps below)

-- Step 1: Sign up at http://localhost:3000/signup with:
--   Email:    demo.student@enamelroads.com
--   Password: DemoStudent@123
--   Name:     Demo Student
--   (Confirm email if Supabase email confirmation is enabled)

-- Step 2: Run this SQL to grant full access without paying:

update public.profiles
set
  role = 'student',
  subscription_plan = 'none',
  subscription_expiry = null,
  subscription_exempt = true,
  name = 'Demo Student'
where email = 'demo.student@enamelroads.com';

-- Or exempt YOUR existing account instead (change the email):
-- update public.profiles
-- set subscription_exempt = true
-- where email = 'your-email@example.com';

-- Verify:
select id, email, role, subscription_plan, subscription_exempt
from public.profiles
where email = 'demo.student@enamelroads.com';
