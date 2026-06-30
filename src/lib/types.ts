// Shared domain types for the UI. (The former Supabase-generated `Database`
// type was removed when the backend moved to Netlify DB + Functions; the API
// now returns the `AppLinkItem` shape defined in lib/data.ts.)

export type LinkStatus = 'pending' | 'approved' | 'rejected'
export type UserRole = 'user' | 'moderator' | 'admin'

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
