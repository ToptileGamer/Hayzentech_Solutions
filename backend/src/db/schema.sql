-- HayzenTech Solutions Database Schema
-- Run this SQL against your PostgreSQL database to initialize

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================
-- PROFILES (users)
-- ===========================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  avatar_url TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  google_id VARCHAR(255) UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ===========================
-- SERVICE PACKAGES (tiers)
-- ===========================
CREATE TABLE IF NOT EXISTS service_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  description TEXT,
  features JSONB DEFAULT '[]',
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================
-- ORDERS
-- ===========================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id UUID REFERENCES service_packages(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_progress', 'completed', 'cancelled')),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  amount_paid NUMERIC(10, 2) DEFAULT 0,
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_client ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ===========================
-- PROJECTS
-- ===========================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'review', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- ===========================
-- TODOS
-- ===========================
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_todos_project ON todos(project_id);
CREATE INDEX IF NOT EXISTS idx_todos_client ON todos(client_id);

-- ===========================
-- MESSAGES (chat)
-- ===========================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_project ON messages(project_id);

-- ===========================
-- INSERT DEFAULT PACKAGES
-- ===========================
INSERT INTO service_packages (name, slug, price, description, features, is_popular, sort_order) VALUES
  ('Basic', 'basic', 9999, 'Perfect for a simple, modern web presence', '["Single Page Website","Responsive Design","Basic Animations","1 Revision","3 Days Delivery"]', false, 1),
  ('Standard', 'standard', 24999, 'Best for businesses needing a professional website', '["Up to 5 Pages","Responsive Design","Advanced Animations","3 Revisions","CMS Integration","SEO Optimized","7 Days Delivery"]', true, 2),
  ('Premium', 'premium', 49999, 'Full-featured web application with everything included', '["Up to 10 Pages","Full-Stack Web App","Custom Animations","Unlimited Revisions","Database & Auth","Payment Integration","Admin Dashboard","Priority Support","14 Days Delivery"]', false, 3)
ON CONFLICT (slug) DO NOTHING;

-- ===========================
-- INSERT DEFAULT ADMIN
-- Password: admin123 (bcrypt hash)
-- ===========================
-- Default admin user - password is set by running: npm run db:init
-- Default password: admin123
INSERT INTO profiles (email, full_name, phone, role)
VALUES (
  'admin@hayzentech.com',
  'Admin User',
  '+919945891320',
  'admin'
) ON CONFLICT (email) DO NOTHING;
