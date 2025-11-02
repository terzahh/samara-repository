-- Add password_hash column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Note: You need to migrate existing users or create new accounts
-- Existing Supabase Auth users won't work with custom auth

-- Example: Create a test user
-- INSERT INTO users (email, password_hash, display_name, role_id)
-- VALUES ('admin@test.com', 'password123', 'Admin User', (SELECT id FROM roles WHERE name = 'admin'));

-- IMPORTANT: Implement proper password hashing with bcrypt before production!
