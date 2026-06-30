-- Baseline schema for the link directory (built-in Netlify Database / Postgres).
-- Applied automatically on deploy, and locally via `netlify database migrations apply`.

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION extract_domain(url text)
RETURNS text AS $$
BEGIN
  RETURN regexp_replace(
    regexp_replace(url, '^https?://(www\.)?', '', 'i'),
    '/.*$', ''
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text UNIQUE NOT NULL,
  slug        text UNIQUE NOT NULL,
  description text,
  icon        text,
  color       text DEFAULT '#6366f1',
  featured    boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_featured ON categories(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(order_index);

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

-- ---------------------------------------------------------------------------
-- links
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE link_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS links (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text NOT NULL,
  description    text,
  url            text UNIQUE NOT NULL,
  domain         text GENERATED ALWAYS AS (extract_domain(url)) STORED,
  icon_url       text,
  screenshot_url text,
  category_id    uuid REFERENCES categories(id) ON DELETE SET NULL,
  tags           text[] DEFAULT '{}',
  featured       boolean DEFAULT false,
  verified       boolean DEFAULT false,
  status         link_status DEFAULT 'pending',
  click_count    integer DEFAULT 0,
  rating         decimal(3,2) DEFAULT 0.00,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now(),

  CONSTRAINT valid_url CHECK (url ~* '^https?://'),
  CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5),
  CONSTRAINT valid_click_count CHECK (click_count >= 0)
);

CREATE INDEX IF NOT EXISTS idx_links_status ON links(status);
CREATE INDEX IF NOT EXISTS idx_links_category_id ON links(category_id);
CREATE INDEX IF NOT EXISTS idx_links_featured ON links(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_links_verified ON links(verified) WHERE verified = true;
CREATE INDEX IF NOT EXISTS idx_links_domain ON links(domain);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON links(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_links_click_count ON links(click_count DESC);
CREATE INDEX IF NOT EXISTS idx_links_tags ON links USING GIN(tags);

DROP TRIGGER IF EXISTS update_links_updated_at ON links;
CREATE TRIGGER update_links_updated_at
  BEFORE UPDATE ON links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed a few approved links so the site has content immediately.
INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
SELECT 'Vercel', 'Deploy web projects with zero configuration and global CDN',
       'https://vercel.com', c.id,
       ARRAY['hosting', 'deployment', 'cdn', 'serverless'], true, true, 'approved'
FROM categories c WHERE c.slug = 'development'
ON CONFLICT (url) DO NOTHING;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
SELECT 'Supabase', 'Open source Firebase alternative with PostgreSQL database',
       'https://supabase.io', c.id,
       ARRAY['database', 'postgresql', 'backend', 'auth'], true, true, 'approved'
FROM categories c WHERE c.slug = 'database'
ON CONFLICT (url) DO NOTHING;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
SELECT 'Tailwind CSS', 'Utility-first CSS framework for rapid UI development',
       'https://tailwindcss.com', c.id,
       ARRAY['css', 'framework', 'utility', 'design'], false, true, 'approved'
FROM categories c WHERE c.slug = 'design'
ON CONFLICT (url) DO NOTHING;

-- ---------------------------------------------------------------------------
-- link_clicks (analytics)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS link_clicks (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id    uuid NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  ip_address inet,
  user_agent text,
  referrer   text,
  clicked_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_link_clicks_link_id ON link_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_clicked_at ON link_clicks(clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_link_clicks_link_date ON link_clicks(link_id, clicked_at DESC);
