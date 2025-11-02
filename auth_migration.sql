-- ============================================
-- CUSTOM AUTH MIGRATION
-- Run this if you already have existing tables
-- ============================================

-- Add password_hash column to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Make password_hash NOT NULL after adding data
-- ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;

-- ============================================
-- CREATE TEST USERS FOR CUSTOM AUTH
-- ============================================

-- Admin user
INSERT INTO users (email, password_hash, display_name, role_id)
VALUES ('admin@test.com', 'admin123', 'Admin User', 
  (SELECT id FROM roles WHERE name = 'admin'))
ON CONFLICT (email) DO NOTHING;

-- Regular user
INSERT INTO users (email, password_hash, display_name, role_id)
VALUES ('user@test.com', 'user123', 'Test User', 
  (SELECT id FROM roles WHERE name = 'user'))
ON CONFLICT (email) DO NOTHING;

-- Department Head
INSERT INTO users (email, password_hash, display_name, role_id, department_id)
VALUES ('dept@test.com', 'dept123', 'Department Head', 
  (SELECT id FROM roles WHERE name = 'department_head'),
  (SELECT id FROM departments WHERE name = 'Computer Science'))
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- VERIFY MIGRATION
-- ============================================

-- Check if password_hash column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'password_hash';

-- Check test users
SELECT email, display_name, r.name as role, d.name as department
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN departments d ON u.department_id = d.id
WHERE email IN ('admin@test.com', 'user@test.com', 'dept@test.com');
