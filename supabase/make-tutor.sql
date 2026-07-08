-- Run AFTER you have signed up at /signup (separate from schema.sql)
-- Replace the email with your real account email

UPDATE profiles
SET role = 'tutor'
WHERE email = 'your-email@example.com';

-- Verify:
-- SELECT id, email, role FROM profiles WHERE email = 'your-email@example.com';
