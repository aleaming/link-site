/*
  # Create categories table

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique, not null)
      - `slug` (text, unique, not null)
      - `description` (text)
      - `icon` (text)
      - `color` (text)
      - `featured` (boolean, default false)
      - `order_index` (integer)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `categories` table
    - Add policy for public read access
    - Add policy for admin write access

  3. Indexes
    - Index on slug for fast lookups
    - Index on featured for filtering
    - Index on order_index for sorting
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  color text DEFAULT '#6366f1',
  featured boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_featured ON categories(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(order_index);

-- RLS Policies
CREATE POLICY "Categories are viewable by everyone"
  ON categories
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete categories"
  ON categories
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default categories
INSERT INTO categories (name, slug, description, icon, color, featured, order_index) VALUES
  ('Development', 'development', 'Tools and resources for developers', 'Code', '#3b82f6', true, 1),
  ('Design', 'design', 'Design tools and creative resources', 'Palette', '#ec4899', true, 2),
  ('AI & ML', 'ai-ml', 'Artificial Intelligence and Machine Learning tools', 'Zap', '#10b981', true, 3),
  ('Analytics', 'analytics', 'Data analytics and tracking tools', 'BarChart', '#f59e0b', false, 4),
  ('Marketing', 'marketing', 'Marketing and growth tools', 'TrendingUp', '#ef4444', false, 5),
  ('Productivity', 'productivity', 'Productivity and workflow tools', 'CheckSquare', '#8b5cf6', false, 6),
  ('Security', 'security', 'Security and privacy tools', 'Shield', '#06b6d4', false, 7),
  ('Database', 'database', 'Database and storage solutions', 'Database', '#84cc16', false, 8),
  ('API', 'api', 'APIs and integration tools', 'Globe', '#f97316', false, 9),
  ('Mobile', 'mobile', 'Mobile development tools', 'Smartphone', '#6366f1', false, 10)
ON CONFLICT (slug) DO NOTHING;