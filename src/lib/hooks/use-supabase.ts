import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, db, auth } from '../supabase'
import type { Database, DbLink, DbCategory, DbUserProfile } from '../types'

// Auth hooks
export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    loading,
    signIn: auth.signIn,
    signUp: auth.signUp,
    signOut: auth.signOut
  }
}

// User profile hooks
export function useUserProfile(userId?: string) {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => userId ? db.getUserProfile(userId) : null,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ userId, updates }: { 
      userId: string
      updates: Database['public']['Tables']['user_profiles']['Update'] 
    }) => db.updateUserProfile(userId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', data.data?.id] })
    }
  })
}

// Links hooks
export function useLinks(filters?: {
  category?: string
  featured?: boolean
  status?: 'pending' | 'approved' | 'rejected'
  limit?: number
}) {
  return useQuery({
    queryKey: ['links', filters],
    queryFn: () => db.getLinks(filters),
    staleTime: 2 * 60 * 1000 // 2 minutes
  })
}

export function useLink(id: string) {
  return useQuery({
    queryKey: ['link', id],
    queryFn: () => db.getLinkById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000
  })
}

export function useCreateLink() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (link: Database['public']['Tables']['links']['Insert']) => 
      db.createLink(link),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] })
    }
  })
}

export function useUpdateLink() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { 
      id: string
      updates: Database['public']['Tables']['links']['Update'] 
    }) => db.updateLink(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['links'] })
      queryClient.invalidateQueries({ queryKey: ['link', data.data?.id] })
    }
  })
}

// Categories hooks
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => db.getCategories(),
    staleTime: 10 * 60 * 1000 // 10 minutes
  })
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: () => db.getCategoryBySlug(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000
  })
}

// Search hooks
export function useSearchLinks(query: string, categoryId?: string) {
  return useQuery({
    queryKey: ['search-links', query, categoryId],
    queryFn: () => db.searchLinks(query, categoryId),
    enabled: query.length > 2,
    staleTime: 1 * 60 * 1000 // 1 minute
  })
}

// Analytics hooks
export function useTrendingLinks(timePeriod = '7 days', limit = 10) {
  return useQuery({
    queryKey: ['trending-links', timePeriod, limit],
    queryFn: () => db.getTrendingLinks(timePeriod, limit),
    staleTime: 5 * 60 * 1000
  })
}

export function useFeaturedLinks(limit = 6) {
  return useQuery({
    queryKey: ['featured-links', limit],
    queryFn: () => db.getFeaturedLinks(limit),
    staleTime: 5 * 60 * 1000
  })
}

export function useUserStats(userId: string) {
  return useQuery({
    queryKey: ['user-stats', userId],
    queryFn: () => db.getUserStats(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000
  })
}

export function useCategoryStats() {
  return useQuery({
    queryKey: ['category-stats'],
    queryFn: () => db.getCategoryStats(),
    staleTime: 10 * 60 * 1000
  })
}

// Click tracking
export function useTrackClick() {
  return useMutation({
    mutationFn: ({ linkId, userId }: { linkId: string, userId?: string }) => 
      db.trackClick(linkId, userId)
  })
}

// Saved links
export function useToggleSavedLink() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ userId, linkId }: { userId: string, linkId: string }) => 
      db.toggleSavedLink(userId, linkId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', variables.userId] })
    }
  })
}

// Real-time subscriptions
export function useRealtimeLinks() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const subscription = db.subscribeToLinks((payload) => {
      queryClient.invalidateQueries({ queryKey: ['links'] })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [queryClient])
}

export function useRealtimeCategories() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const subscription = db.subscribeToCategories((payload) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [queryClient])
}