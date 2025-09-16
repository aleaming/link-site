// Database types generated from Supabase schema
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          color: string
          featured: boolean
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          color?: string
          featured?: boolean
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          color?: string
          featured?: boolean
          order_index?: number
          created_at?: string
        }
      }
      links: {
        Row: {
          id: string
          title: string
          description: string | null
          url: string
          domain: string
          icon_url: string | null
          screenshot_url: string | null
          category_id: string | null
          tags: string[]
          featured: boolean
          verified: boolean
          status: 'pending' | 'approved' | 'rejected'
          click_count: number
          rating: number
          submitted_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          url: string
          icon_url?: string | null
          screenshot_url?: string | null
          category_id?: string | null
          tags?: string[]
          featured?: boolean
          verified?: boolean
          status?: 'pending' | 'approved' | 'rejected'
          click_count?: number
          rating?: number
          submitted_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          url?: string
          icon_url?: string | null
          screenshot_url?: string | null
          category_id?: string | null
          tags?: string[]
          featured?: boolean
          verified?: boolean
          status?: 'pending' | 'approved' | 'rejected'
          click_count?: number
          rating?: number
          submitted_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'user' | 'moderator' | 'admin'
          saved_links: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'moderator' | 'admin'
          saved_links?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'moderator' | 'admin'
          saved_links?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      link_clicks: {
        Row: {
          id: string
          link_id: string
          user_id: string | null
          ip_address: string | null
          user_agent: string | null
          referrer: string | null
          clicked_at: string
        }
        Insert: {
          id?: string
          link_id: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          clicked_at?: string
        }
        Update: {
          id?: string
          link_id?: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          clicked_at?: string
        }
      }
    }
    Functions: {
      increment_click_count: {
        Args: {
          p_link_id: string
          p_user_id?: string
          p_ip_address?: string
          p_user_agent?: string
          p_referrer?: string
        }
        Returns: void
      }
      update_link_rating: {
        Args: {
          p_link_id: string
          p_new_rating: number
        }
        Returns: number
      }
      get_trending_links: {
        Args: {
          p_time_period?: string
          p_limit_count?: number
        }
        Returns: Array<{
          id: string
          title: string
          description: string
          url: string
          domain: string
          icon_url: string
          category_name: string
          tags: string[]
          click_count: number
          recent_clicks: number
          rating: number
        }>
      }
      search_links: {
        Args: {
          p_query: string
          p_category_filter?: string
          p_limit_count?: number
        }
        Returns: Array<{
          id: string
          title: string
          description: string
          url: string
          domain: string
          icon_url: string
          category_name: string
          tags: string[]
          click_count: number
          rating: number
          rank: number
        }>
      }
      get_user_stats: {
        Args: {
          p_user_id: string
        }
        Returns: Array<{
          total_submissions: number
          approved_submissions: number
          pending_submissions: number
          total_clicks: number
          saved_links_count: number
        }>
      }
      get_category_stats: {
        Args: {}
        Returns: Array<{
          category_id: string
          category_name: string
          category_slug: string
          total_links: number
          approved_links: number
          total_clicks: number
          avg_rating: number
        }>
      }
      get_featured_links: {
        Args: {
          p_limit_count?: number
        }
        Returns: Array<{
          id: string
          title: string
          description: string
          url: string
          domain: string
          icon_url: string
          screenshot_url: string
          category_name: string
          tags: string[]
          click_count: number
          rating: number
        }>
      }
      toggle_saved_link: {
        Args: {
          p_user_id: string
          p_link_id: string
        }
        Returns: boolean
      }
    }
  }
}

// Convenience types
export type DbCategory = Database['public']['Tables']['categories']['Row']
export type DbLink = Database['public']['Tables']['links']['Row']
export type DbUserProfile = Database['public']['Tables']['user_profiles']['Row']
export type DbLinkClick = Database['public']['Tables']['link_clicks']['Row']

export type LinkStatus = 'pending' | 'approved' | 'rejected'
export type UserRole = 'user' | 'moderator' | 'admin'

// Updated existing interfaces to match database schema
export interface LinkItem {
  id: string
  title: string
  description: string
  url: string
  domain: string
  icon?: string
  screenshot?: string
  category_id: string | null
  category?: Category
  tags: string[]
  featured: boolean
  verified: boolean
  status: LinkStatus
  rating: number
  click_count: number
  submitted_by: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  featured: boolean
  order_index: number
  created_at: string
  link_count?: number // Computed field
}

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: UserRole
  saved_links: string[]
  created_at: string
  updated_at: string
}

// Keep existing interfaces for compatibility
export interface SearchFilters {
  query: string
  categories: string[]
  tags: string[]
  featured: boolean
  verified: boolean
  sortBy: 'newest' | 'popular' | 'rating' | 'alphabetical'
}

export interface ViewMode {
  type: 'grid' | 'list' | 'compact'
  density: 'comfortable' | 'compact'
}

export interface LinkClick {
  id: string
  link_id: string
  user_id?: string
  clicked_at: string
}

export interface Analytics {
  totalLinks: number
  totalClicks: number
  topCategories: Array<{ category: string; count: number }>
  recentActivity: Array<{
    type: 'click' | 'submission' | 'save'
    linkId: string
    timestamp: Date
  }>
}