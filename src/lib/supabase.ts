import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper functions for common database operations
export const db = {
  // Links
  async getLinks(filters?: {
    category?: string
    featured?: boolean
    status?: 'pending' | 'approved' | 'rejected'
    limit?: number
  }) {
    let query = supabase
      .from('links')
      .select(`
        *,
        categories (
          id,
          name,
          slug,
          color
        )
      `)
      .eq('status', filters?.status || 'approved')
      .order('created_at', { ascending: false })

    if (filters?.category) {
      query = query.eq('category_id', filters.category)
    }

    if (filters?.featured !== undefined) {
      query = query.eq('featured', filters.featured)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    return query
  },

  async getLinkById(id: string) {
    return supabase
      .from('links')
      .select(`
        *,
        categories (
          id,
          name,
          slug,
          color
        )
      `)
      .eq('id', id)
      .single()
  },

  async createLink(link: Database['public']['Tables']['links']['Insert']) {
    return supabase
      .from('links')
      .insert(link)
      .select()
      .single()
  },

  async updateLink(id: string, updates: Database['public']['Tables']['links']['Update']) {
    return supabase
      .from('links')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  },

  // Categories
  async getCategories() {
    return supabase
      .from('categories')
      .select('*')
      .order('order_index', { ascending: true })
  },

  async getCategoryBySlug(slug: string) {
    return supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()
  },

  // User Profiles
  async getUserProfile(userId: string) {
    return supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
  },

  async updateUserProfile(userId: string, updates: Database['public']['Tables']['user_profiles']['Update']) {
    return supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
  },

  // Search
  async searchLinks(query: string, categoryId?: string, limit = 20) {
    return supabase.rpc('search_links', {
      p_query: query,
      p_category_filter: categoryId || null,
      p_limit_count: limit
    })
  },

  // Analytics
  async getTrendingLinks(timePeriod = '7 days', limit = 10) {
    return supabase.rpc('get_trending_links', {
      p_time_period: timePeriod,
      p_limit_count: limit
    })
  },

  async getFeaturedLinks(limit = 6) {
    return supabase.rpc('get_featured_links', {
      p_limit_count: limit
    })
  },

  async getUserStats(userId: string) {
    return supabase.rpc('get_user_stats', {
      p_user_id: userId
    })
  },

  async getCategoryStats() {
    return supabase.rpc('get_category_stats')
  },

  // Click tracking
  async trackClick(linkId: string, userId?: string) {
    return supabase.rpc('increment_click_count', {
      p_link_id: linkId,
      p_user_id: userId || null,
      p_ip_address: null, // Would be set by edge function
      p_user_agent: navigator.userAgent,
      p_referrer: document.referrer || null
    })
  },

  // Saved links
  async toggleSavedLink(userId: string, linkId: string) {
    return supabase.rpc('toggle_saved_link', {
      p_user_id: userId,
      p_link_id: linkId
    })
  },

  // Real-time subscriptions
  subscribeToLinks(callback: (payload: any) => void) {
    return supabase
      .channel('links_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'links' }, 
        callback
      )
      .subscribe()
  },

  subscribeToCategories(callback: (payload: any) => void) {
    return supabase
      .channel('categories_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'categories' }, 
        callback
      )
      .subscribe()
  }
}

// Auth helpers
export const auth = {
  async signUp(email: string, password: string, metadata?: any) {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
  },

  async signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({
      email,
      password
    })
  },

  async signOut() {
    return supabase.auth.signOut()
  },

  async getUser() {
    return supabase.auth.getUser()
  },

  async getSession() {
    return supabase.auth.getSession()
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}