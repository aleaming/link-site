/*
  # Create links table

  1. New Tables
    - `links`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text)
      - `url` (text, unique, not null)
      - `domain` (text, generated from url)
      - `icon_url` (text)
      - `screenshot_url` (text)
      - `category_id` (uuid, foreign key to categories)
      - `tags` (text array)
      - `featured` (boolean, default false)
      - `verified` (boolean, default false)
      - `status` (text, enum: 'pending', 'approved', 'rejected')
      - `click_count` (integer, default 0)
      - `rating` (decimal, default 0)
      - `submitted_by` (uuid, foreign key to auth.users)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `links` table
    - Public can read approved links
    - Users can create and edit their own submissions
    - Admins have full access

  3. Functions
    - Function to extract domain from URL
    - Trigger to auto-update domain and updated_at
*/

-- Create link status enum type
DO $$ BEGIN
  CREATE TYPE link_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Function to extract domain from URL
CREATE OR REPLACE FUNCTION extract_domain(url text)
RETURNS text AS $$
BEGIN
  RETURN regexp_replace(
    regexp_replace(url, '^https?://(www\.)?', '', 'i'),
    '/.*$', ''
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create links table
CREATE TABLE IF NOT EXISTS links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  url text UNIQUE NOT NULL,
  domain text GENERATED ALWAYS AS (extract_domain(url)) STORED,
  icon_url text,
  screenshot_url text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  featured boolean DEFAULT false,
  verified boolean DEFAULT false,
  status link_status DEFAULT 'pending',
  click_count integer DEFAULT 0,
  rating decimal(3,2) DEFAULT 0.00,
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_url CHECK (url ~* '^https?://'),
  CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5),
  CONSTRAINT valid_click_count CHECK (click_count >= 0)
);

-- Enable RLS
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_links_status ON links(status);
CREATE INDEX IF NOT EXISTS idx_links_category_id ON links(category_id);
CREATE INDEX IF NOT EXISTS idx_links_featured ON links(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_links_verified ON links(verified) WHERE verified = true;
CREATE INDEX IF NOT EXISTS idx_links_submitted_by ON links(submitted_by);
CREATE INDEX IF NOT EXISTS idx_links_domain ON links(domain);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON links(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_links_click_count ON links(click_count DESC);
CREATE INDEX IF NOT EXISTS idx_links_rating ON links(rating DESC);
CREATE INDEX IF NOT EXISTS idx_links_tags ON links USING GIN(tags);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_links_search ON links USING GIN(
  to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || array_to_string(tags, ' '))
);

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS update_links_updated_at ON links;
CREATE TRIGGER update_links_updated_at
  BEFORE UPDATE ON links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
CREATE POLICY "Anyone can view approved links"
  ON links
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Authenticated users can view all links"
  ON links
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own links"
  ON links
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Users can update their own pending links"
  ON links
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = submitted_by AND 
    status = 'pending'
  )
  WITH CHECK (
    auth.uid() = submitted_by AND 
    status = 'pending'
  );

CREATE POLICY "Moderators can update any link"
  ON links
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('moderator', 'admin')
    )
  );

CREATE POLICY "Admins have full access to links"
  ON links
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert sample links
INSERT INTO links (
  title, description, url, category_id, tags, featured, verified, status, submitted_by
) 
SELECT 
  'Vercel',
  'Deploy web projects with zero configuration and global CDN',
  'https://vercel.com',
  c.id,
  ARRAY['hosting', 'deployment', 'cdn', 'serverless'],
  true,
  true,
  'approved',
  (SELECT id FROM auth.users LIMIT 1)
FROM categories c WHERE c.slug = 'development'
ON CONFLICT (url) DO NOTHING;

INSERT INTO links (
  title, description, url, category_id, tags, featured, verified, status, submitted_by
) 
SELECT 
  'Supabase',
  'Open source Firebase alternative with PostgreSQL database',
  'https://supabase.io',
  c.id,
  ARRAY['database', 'postgresql', 'backend', 'auth'],
  true,
  true,
  'approved',
  (SELECT id FROM auth.users LIMIT 1)
FROM categories c WHERE c.slug = 'database'
ON CONFLICT (url) DO NOTHING;

INSERT INTO links (
  title, description, url, category_id, tags, featured, verified, status, submitted_by
) 
SELECT 
  'Tailwind CSS',
  'Utility-first CSS framework for rapid UI development',
  'https://tailwindcss.com',
  c.id,
  ARRAY['css', 'framework', 'utility', 'design'],
  false,
  true,
  'approved',
  (SELECT id FROM auth.users LIMIT 1)
FROM categories c WHERE c.slug = 'design'
ON CONFLICT (url) DO NOTHING;