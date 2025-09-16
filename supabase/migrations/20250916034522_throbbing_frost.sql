/*
  # Create link clicks table for analytics

  1. New Tables
    - `link_clicks`
      - `id` (uuid, primary key)
      - `link_id` (uuid, foreign key to links)
      - `user_id` (uuid, foreign key to auth.users, nullable)
      - `ip_address` (inet)
      - `user_agent` (text)
      - `referrer` (text)
      - `clicked_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `link_clicks` table
    - Allow inserts for click tracking
    - Restrict reads to admins and link owners

  3. Indexes
    - Optimized for analytics queries
    - Time-based partitioning ready
*/

-- Create link_clicks table
CREATE TABLE IF NOT EXISTS link_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address inet,
  user_agent text,
  referrer text,
  clicked_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;

-- Create indexes for analytics performance
CREATE INDEX IF NOT EXISTS idx_link_clicks_link_id ON link_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_user_id ON link_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_clicked_at ON link_clicks(clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_link_clicks_ip_address ON link_clicks(ip_address);

-- Composite indexes for common analytics queries
CREATE INDEX IF NOT EXISTS idx_link_clicks_link_date ON link_clicks(link_id, clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_link_clicks_user_date ON link_clicks(user_id, clicked_at DESC) WHERE user_id IS NOT NULL;

-- RLS Policies
CREATE POLICY "Anyone can insert click records"
  ON link_clicks
  FOR INSERT
  USING (true);

CREATE POLICY "Users can view their own clicks"
  ON link_clicks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Link owners can view clicks on their links"
  ON link_clicks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM links 
      WHERE links.id = link_clicks.link_id 
      AND links.submitted_by = auth.uid()
    )
  );

CREATE POLICY "Admins can view all clicks"
  ON link_clicks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to clean old click records (optional, for data retention)
CREATE OR REPLACE FUNCTION cleanup_old_clicks()
RETURNS void AS $$
BEGIN
  DELETE FROM link_clicks 
  WHERE clicked_at < now() - interval '1 year';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;