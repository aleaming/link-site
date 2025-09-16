import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SearchFilters, ViewMode, User } from '../types'

interface AppState {
  // Theme
  darkMode: boolean
  setDarkMode: (darkMode: boolean) => void
  
  // Search & Filters
  searchFilters: SearchFilters
  setSearchFilters: (filters: Partial<SearchFilters>) => void
  clearFilters: () => void
  
  // View Mode
  viewMode: ViewMode
  setViewMode: (mode: Partial<ViewMode>) => void
  
  // User
  user: User | null
  setUser: (user: User | null) => void
  
  // UI State
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (open: boolean) => void
  
  // Saved Links
  savedLinks: Set<string>
  toggleSavedLink: (linkId: string) => void
  
  // Recently Viewed
  recentlyViewed: string[]
  addToRecentlyViewed: (linkId: string) => void
}

const defaultFilters: SearchFilters = {
  query: '',
  categories: [],
  tags: [],
  featured: false,
  verified: false,
  sortBy: 'newest'
}

const defaultViewMode: ViewMode = {
  type: 'grid',
  density: 'comfortable'
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      darkMode: true,
      setDarkMode: (darkMode) => {
        set({ darkMode })
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
      },
      
      // Search & Filters
      searchFilters: defaultFilters,
      setSearchFilters: (filters) =>
        set((state) => ({
          searchFilters: { ...state.searchFilters, ...filters }
        })),
      clearFilters: () => set({ searchFilters: defaultFilters }),
      
      // View Mode
      viewMode: defaultViewMode,
      setViewMode: (mode) =>
        set((state) => ({
          viewMode: { ...state.viewMode, ...mode }
        })),
      
      // User
      user: null,
      setUser: (user) => set({ user }),
      
      // UI State
      sidebarOpen: false,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      commandPaletteOpen: false,
      setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
      
      // Saved Links
      savedLinks: new Set(),
      toggleSavedLink: (linkId) =>
        set((state) => {
          const newSavedLinks = new Set(state.savedLinks)
          if (newSavedLinks.has(linkId)) {
            newSavedLinks.delete(linkId)
          } else {
            newSavedLinks.add(linkId)
          }
          return { savedLinks: newSavedLinks }
        }),
      
      // Recently Viewed
      recentlyViewed: [],
      addToRecentlyViewed: (linkId) =>
        set((state) => {
          const filtered = state.recentlyViewed.filter(id => id !== linkId)
          return {
            recentlyViewed: [linkId, ...filtered].slice(0, 10)
          }
        })
    }),
    {
      name: 'saasy-app-store',
      partialize: (state) => ({
        darkMode: state.darkMode,
        viewMode: state.viewMode,
        savedLinks: Array.from(state.savedLinks),
        recentlyViewed: state.recentlyViewed
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert savedLinks array back to Set
          state.savedLinks = new Set(state.savedLinks as unknown as string[])
          // Apply theme
          document.documentElement.setAttribute('data-theme', state.darkMode ? 'dark' : 'light')
        }
      }
    }
  )
)