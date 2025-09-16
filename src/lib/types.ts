export interface LinkItem {
  id: string
  title: string
  description: string
  url: string
  icon?: string
  screenshot?: string
  category: string
  tags: string[]
  featured: boolean
  verified: boolean
  rating: number
  clickCount: number
  submittedBy: string
  submittedAt: Date
  updatedAt: Date
  status: 'active' | 'pending' | 'rejected'
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  linkCount: number
  featured: boolean
  order: number
}

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'user' | 'admin' | 'moderator'
  savedLinks: string[]
  submittedLinks: string[]
  createdAt: Date
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