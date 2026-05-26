-- =============================================
-- HAYZENTECH PORTFOLIO - SUPABASE SCHEMA
-- =============================================
-- Run this in Supabase SQL Editor
-- Go to: https://app.supabase.com > Your Project > SQL Editor
-- =============================================

-- 1. PROFILES TABLE (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  role TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SERVICE TIERS
CREATE TABLE IF NOT EXISTS service_tiers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  features JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default service tiers
INSERT INTO service_tiers (name, description, price, features) VALUES
('Basic', 'Perfect for a simple landing page or portfolio', 5000, '["Single Page Website", "Responsive Design", "Basic Animations", "1 Revision", "3 Days Delivery"]'),
('Standard', 'Great for small businesses and startups', 15000, '["Up to 5 Pages", "Responsive Design", "Advanced Animations", "3 Revisions", "CMS Integration", "SEO Optimized", "7 Days Delivery"]'),
('Premium', 'Full-featured web application with everything included', 30000, '["Up to 10 Pages", "Full-Stack Web App", "Custom Animations", "Unlimited Revisions", "Database & Auth", "Payment Integration", "Admin Dashboard", "Priority Support", "14 Days Delivery"]')
ON CONFLICT DO NOTHING;

-- 3. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id) NOT NULL,
  tier_id INTEGER REFERENCES service_tiers(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_progress', 'completed', 'cancelled')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'failed')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  amount_paid DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) NOT NULL,
  client_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'review', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TASKS (todo items)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  assigned_to UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MESSAGES (chat)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. FILE UPLOADS
CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  uploader_id UUID REFERENCES profiles(id) NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PROJECT UPDATES (client updates)
CREATE TABLE IF NOT EXISTS project_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  client_id UUID REFERENCES profiles(id) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;

-- PROFILES: Users can read their own profile, admin can read all
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- SERVICE TIERS: Public read access
CREATE POLICY "Anyone can view service tiers"
  ON service_tiers FOR SELECT
  USING (true);

-- ORDERS: Clients see own orders, admin sees all
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Admin can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Admin can update orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- PROJECTS: Clients see own projects, admin sees all
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Admin can view all projects"
  ON projects FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can update projects"
  ON projects FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- TASKS: Users can see tasks for their projects
CREATE POLICY "Users can view own project tasks"
  ON tasks FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM projects WHERE id = tasks.project_id AND client_id = auth.uid())
  );

CREATE POLICY "Admin can view all tasks"
  ON tasks FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can create tasks on own projects"
  ON tasks FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE id = tasks.project_id AND client_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM projects WHERE id = tasks.project_id AND client_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can delete tasks"
  ON tasks FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- MESSAGES: Users can see messages for their projects
CREATE POLICY "Users can view own project messages"
  ON messages FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM projects WHERE id = messages.project_id AND client_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE id = messages.project_id AND (client_id = auth.uid() OR TRUE))
    AND
    sender_id = auth.uid()
  );

-- FILE UPLOADS
CREATE POLICY "Users can view own project files"
  ON file_uploads FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM projects WHERE id = file_uploads.project_id AND client_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can upload files to own projects"
  ON file_uploads FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE id = file_uploads.project_id AND client_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- PROJECT UPDATES
CREATE POLICY "Users can view own project updates"
  ON project_updates FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_updates.project_id AND client_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can create updates"
  ON project_updates FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE id = project_updates.project_id AND client_id = auth.uid())
  );

-- =============================================
-- STORAGE BUCKET (for file uploads)
-- =============================================
-- Run this in Supabase SQL Editor or create via Dashboard:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('project-files', 'project-files', true);
-- 
-- Or create via Supabase Dashboard:
-- Storage > New Bucket > "project-files" > Public

-- =============================================
-- INDEXES (for performance)
-- =============================================
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_messages_project_id ON messages(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_project_id ON file_uploads(project_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_project_id ON project_updates(project_id);

-- =============================================
-- CREATE ADMIN USER
-- =============================================
-- First create a user in Authentication > Users > Add User
-- Then run the following to set them as admin:
-- UPDATE profiles SET role = 'admin' WHERE id = 'USER_UUID_HERE';
