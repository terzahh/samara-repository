-- Samara Repository Database Schema
-- Custom Authentication System

-- ============================================
-- ROLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('admin', 'System administrator with full access'),
  ('department_head', 'Department head with department management access'),
  ('user', 'Regular user with basic access')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- DEPARTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample departments
INSERT INTO departments (name) VALUES
  ('Computer Science'),
  ('Electrical Engineering'),
  ('Civil Engineering'),
  ('Mechanical Engineering'),
  ('Chemical Engineering'),
  ('Business Administration'),
  ('Economics'),
  ('Law'),
  ('Medicine'),
  ('Agriculture')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- USERS TABLE (Custom Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_department_id ON users(department_id);

-- ============================================
-- RESEARCH TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  abstract TEXT,
  keywords TEXT,
  type TEXT NOT NULL CHECK (type IN ('thesis', 'dissertation', 'research_paper', 'conference_paper', 'project_report')),
  year INTEGER,
  file_path TEXT,
  file_url TEXT,
  access_level TEXT DEFAULT 'public' CHECK (access_level IN ('public', 'restricted')),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_research_department_id ON research(department_id);
CREATE INDEX IF NOT EXISTS idx_research_uploaded_by ON research(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_research_type ON research(type);
CREATE INDEX IF NOT EXISTS idx_research_year ON research(year);
CREATE INDEX IF NOT EXISTS idx_research_access_level ON research(access_level);

-- ============================================
-- COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_id UUID REFERENCES research(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_comments_research_id ON comments(research_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- ============================================
-- SYSTEM SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO system_settings (key, value, description) VALUES
  ('site_name', 'Samara University Repository', 'Name of the repository'),
  ('max_file_size', '50', 'Maximum file size in MB'),
  ('allow_public_registration', 'true', 'Allow public user registration')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- CREATE TEST USERS
-- ============================================
INSERT INTO users (email, password_hash, display_name, role_id) VALUES
  ('admin@test.com', 'admin123', 'Admin User', (SELECT id FROM roles WHERE name = 'admin')),
  ('user@test.com', 'user123', 'Test User', (SELECT id FROM roles WHERE name = 'user'))
ON CONFLICT (email) DO NOTHING;

-- Department Head (requires department)
INSERT INTO users (email, password_hash, display_name, role_id, department_id) VALUES
  ('dept@test.com', 'dept123', 'Department Head', 
   (SELECT id FROM roles WHERE name = 'department_head'),
   (SELECT id FROM departments WHERE name = 'Computer Science'))
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_research_updated_at ON research;
CREATE TRIGGER update_research_updated_at
  BEFORE UPDATE ON research
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
