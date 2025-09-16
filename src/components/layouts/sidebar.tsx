import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Hash, Star, Bookmark, Clock, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/stores/app-store'
import { cn, formatNumber } from '@/lib/utils'
import type { Category } from '@/lib/types'

interface SidebarProps {
  categories: Category[]
}

export function Sidebar({ categories }: SidebarProps) {
  const { 
    sidebarOpen, 
    setSidebarOpen, 
    searchFilters, 
    setSearchFilters,
    savedLinks,
    recentlyViewed
  } = useAppStore()

  const handleCategoryClick = (categoryName: string) => {
    const isSelected = searchFilters.categories.includes(categoryName)
    const newCategories = isSelected
      ? searchFilters.categories.filter(c => c !== categoryName)
      : [...searchFilters.categories, categoryName]
    
    setSearchFilters({ categories: newCategories })
  }

  const quickFilters = [
    {
      id: 'featured',
      label: 'Featured',
      icon: Star,
      active: searchFilters.featured,
      onClick: () => setSearchFilters({ featured: !searchFilters.featured })
    },
    {
      id: 'saved',
      label: `Saved (${savedLinks.size})`,
      icon: Bookmark,
      active: false,
      onClick: () => {/* Navigate to saved */}
    },
    {
      id: 'recent',
      label: `Recent (${recentlyViewed.length})`,
      icon: Clock,
      active: false,
      onClick: () => {/* Navigate to recent */}
    },
    {
      id: 'trending',
      label: 'Trending',
      icon: TrendingUp,
      active: false,
      onClick: () => setSearchFilters({ sortBy: 'popular' })
    }
  ]

  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
          Browse
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={20} />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Quick Filters */}
        <div>
          <h3 
            className="text-sm font-medium mb-3"
            style={{ color: 'var(--text-secondary)' }}
          >
            Quick Filters
          </h3>
          <div className="space-y-1">
            {quickFilters.map((filter) => {
              const Icon = filter.icon
              return (
                <button
                  key={filter.id}
                  onClick={filter.onClick}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all",
                    filter.active 
                      ? "electric-glow-hover" 
                      : "hover:bg-accent"
                  )}
                  style={filter.active ? {
                    backgroundColor: 'var(--bg-elevated)',
                    color: 'var(--accent-primary)'
                  } : {
                    color: 'var(--text-secondary)'
                  }}
                >
                  <Icon size={16} />
                  <span className="text-sm">{filter.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 
            className="text-sm font-medium mb-3"
            style={{ color: 'var(--text-secondary)' }}
          >
            Categories
          </h3>
          <div className="space-y-1">
            {categories.map((category) => {
              const isSelected = searchFilters.categories.includes(category.name)
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.name)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all",
                    isSelected 
                      ? "electric-glow-hover" 
                      : "hover:bg-accent"
                  )}
                  style={isSelected ? {
                    backgroundColor: 'var(--bg-elevated)',
                    color: 'var(--accent-primary)'
                  } : {
                    color: 'var(--text-secondary)'
                  }}
                >
                  <Hash size={16} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {category.name}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {formatNumber(category.linkCount)} resources
                    </div>
                  </div>
                  {category.featured && (
                    <Star size={12} style={{ color: 'var(--accent-secondary)' }} />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className="hidden lg:block w-64 h-screen sticky top-16 border-r"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)'
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 w-70 h-screen lg:hidden"
              style={{ 
                backgroundColor: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border-primary)'
              }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}