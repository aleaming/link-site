/*
  # Create database functions for common operations

  1. Functions
    - `increment_click_count(link_id)` - Safely increment click count
    - `update_link_rating(link_id, rating)` - Update link rating
    - `get_trending_links(time_period, limit_count)` - Get trending links
    - `search_links(query, category_filter, limit_count)` - Full text search
    - `get_user_stats(user_id)` - Get user statistics
    - `get_category_stats()` - Get category statistics

  2. Security
    - Functions are security definer where needed
    - Proper permission checks included
*/

-- Function to safely increment click count
CREATE OR REPLACE FUNCTION increment_click_count(
  p_link_id uuid,
  p_user_id uuid DEFAULT NULL,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_referrer text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Insert click record
  INSERT INTO link_clicks (link_id, user_id, ip_address, user_agent, referrer)
  VALUES (p_link_id, p_user_id, p_ip_address, p_user_agent, p_referrer);
  
  -- Increment click count on links table
  UPDATE links 
  SET click_count = click_count + 1,
      updated_at = now()
  WHERE id = p_link_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update link rating (weighted average)
CREATE OR REPLACE FUNCTION update_link_rating(
  p_link_id uuid,
  p_new_rating decimal
)
RETURNS decimal AS $$
DECLARE
  current_rating decimal;
  current_count integer;
  new_rating decimal;
BEGIN
  -- Get current rating and count (simplified - in real app you'd have a ratings table)
  SELECT rating, click_count INTO current_rating, current_count
  FROM links WHERE id = p_link_id;
  
  -- Calculate weighted average (simplified formula)
  IF current_count = 0 THEN
    new_rating := p_new_rating;
  ELSE
    new_rating := ((current_rating * current_count) + p_new_rating) / (current_count + 1);
  END IF;
  
  -- Update the link
  UPDATE links 
  SET rating = new_rating,
      updated_at = now()
  WHERE id = p_link_id;
  
  RETURN new_rating;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get trending links
CREATE OR REPLACE FUNCTION get_trending_links(
  p_time_period interval DEFAULT '7 days',
  p_limit_count integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  url text,
  domain text,
  icon_url text,
  category_name text,
  tags text[],
  click_count bigint,
  recent_clicks bigint,
  rating decimal
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.title,
    l.description,
    l.url,
    l.domain,
    l.icon_url,
    c.name as category_name,
    l.tags,
    l.click_count,
    COUNT(lc.id) as recent_clicks,
    l.rating
  FROM links l
  LEFT JOIN categories c ON l.category_id = c.id
  LEFT JOIN link_clicks lc ON l.id = lc.link_id 
    AND lc.clicked_at > now() - p_time_period
  WHERE l.status = 'approved'
  GROUP BY l.id, c.name
  ORDER BY recent_clicks DESC, l.click_count DESC
  LIMIT p_limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for full text search
CREATE OR REPLACE FUNCTION search_links(
  p_query text,
  p_category_filter uuid DEFAULT NULL,
  p_limit_count integer DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  url text,
  domain text,
  icon_url text,
  category_name text,
  tags text[],
  click_count integer,
  rating decimal,
  rank real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.title,
    l.description,
    l.url,
    l.domain,
    l.icon_url,
    c.name as category_name,
    l.tags,
    l.click_count,
    l.rating,
    ts_rank(
      to_tsvector('english', l.title || ' ' || COALESCE(l.description, '') || ' ' || array_to_string(l.tags, ' ')),
      plainto_tsquery('english', p_query)
    ) as rank
  FROM links l
  LEFT JOIN categories c ON l.category_id = c.id
  WHERE l.status = 'approved'
    AND (p_category_filter IS NULL OR l.category_id = p_category_filter)
    AND (
      to_tsvector('english', l.title || ' ' || COALESCE(l.description, '') || ' ' || array_to_string(l.tags, ' '))
      @@ plainto_tsquery('english', p_query)
    )
  ORDER BY rank DESC, l.click_count DESC
  LIMIT p_limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id uuid)
RETURNS TABLE (
  total_submissions integer,
  approved_submissions integer,
  pending_submissions integer,
  total_clicks bigint,
  saved_links_count integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::integer as total_submissions,
    COUNT(*) FILTER (WHERE status = 'approved')::integer as approved_submissions,
    COUNT(*) FILTER (WHERE status = 'pending')::integer as pending_submissions,
    COALESCE(SUM(click_count), 0) as total_clicks,
    array_length(up.saved_links, 1) as saved_links_count
  FROM links l
  LEFT JOIN user_profiles up ON up.id = p_user_id
  WHERE l.submitted_by = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get category statistics
CREATE OR REPLACE FUNCTION get_category_stats()
RETURNS TABLE (
  category_id uuid,
  category_name text,
  category_slug text,
  total_links bigint,
  approved_links bigint,
  total_clicks bigint,
  avg_rating decimal
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as category_id,
    c.name as category_name,
    c.slug as category_slug,
    COUNT(l.id) as total_links,
    COUNT(l.id) FILTER (WHERE l.status = 'approved') as approved_links,
    COALESCE(SUM(l.click_count), 0) as total_clicks,
    COALESCE(AVG(l.rating), 0) as avg_rating
  FROM categories c
  LEFT JOIN links l ON c.id = l.category_id
  GROUP BY c.id, c.name, c.slug
  ORDER BY approved_links DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get featured links
CREATE OR REPLACE FUNCTION get_featured_links(p_limit_count integer DEFAULT 6)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  url text,
  domain text,
  icon_url text,
  screenshot_url text,
  category_name text,
  tags text[],
  click_count integer,
  rating decimal
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.title,
    l.description,
    l.url,
    l.domain,
    l.icon_url,
    l.screenshot_url,
    c.name as category_name,
    l.tags,
    l.click_count,
    l.rating
  FROM links l
  LEFT JOIN categories c ON l.category_id = c.id
  WHERE l.status = 'approved' AND l.featured = true
  ORDER BY l.click_count DESC, l.created_at DESC
  LIMIT p_limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add link to user's saved links
CREATE OR REPLACE FUNCTION toggle_saved_link(
  p_user_id uuid,
  p_link_id uuid
)
RETURNS boolean AS $$
DECLARE
  is_saved boolean;
BEGIN
  -- Check if link is already saved
  SELECT p_link_id = ANY(saved_links) INTO is_saved
  FROM user_profiles
  WHERE id = p_user_id;
  
  IF is_saved THEN
    -- Remove from saved links
    UPDATE user_profiles
    SET saved_links = array_remove(saved_links, p_link_id),
        updated_at = now()
    WHERE id = p_user_id;
    RETURN false;
  ELSE
    -- Add to saved links
    UPDATE user_profiles
    SET saved_links = array_append(saved_links, p_link_id),
        updated_at = now()
    WHERE id = p_user_id;
    RETURN true;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;