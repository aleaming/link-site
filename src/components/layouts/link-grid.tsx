import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FixedSizeGrid as Grid } from 'react-window'
import { 
  Grid3X3, 
  List, 
  LayoutGrid, 
  Search,
  Filter,
  SortAsc
} from 'lucide-react'
import { LinkCard } from '@/components/ui/link-card'
import { GlowButton } from '@/components/ui/glow-button'
import { TagChip } from '@/components/ui/tag-chip'
import { cn } from '@/lib/utils'

interface LinkItem {
  id: string
  title: string
  description: string
  url: string
  domain: string
  screenshot?: string
  icon?: string
  tags: string[]
  clickCount: number
  featured: boolean
  verified: boolean
  category: string
}

interface LinkGridProps {
  links: LinkItem[]
  loading?: boolean
  viewMode?: 'grid' | 'list' | 'masonry'
  density?: 'comfortable' | 'compact'
  onViewModeChange?: (mode: 'grid' | 'list' | 'masonry') => void
  onDensityChange?: (density: 'comfortable' | 'compact') => void
  onLinkClick?: (link: LinkItem) => void
  className?: string
}

const LoadingSkeleton = ({ count = 12 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <motion.div
        key={index}
        className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <div className="h-40 bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
        <div className="p-4 space-y-3">
          <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse" />
            <div className="h-6 w-20 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse" />
          </div>
        </div>
      </motion.div>
    ))}
  </div>
)

const EmptyState = () => (
  <motion.div
    className="text-center py-16"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="max-w-md mx-auto">
      <motion.div
        className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-cyan-500/20 to-lime-500/20 flex items-center justify-center"
        animate={{ 
          boxShadow: [
            "0 0 20px rgba(11, 249, 255, 0.3)",
            "0 0 40px rgba(11, 249, 255, 0.5)",
            "0 0 20px rgba(11, 249, 255, 0.3)"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Search size={32} className="text-cyan-500" />
      </motion.div>
      <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
        No resources found
      </h3>
      <p className="text-neutral-600 dark:text-neutral-400 mb-6">
        Try adjusting your search criteria or browse different categories to discover amazing tools.
      </p>
      <GlowButton variant="primary">
        <Filter size={16} />
        Clear Filters
      </GlowButton>
    </div>
  </motion.div>
)

export function LinkGrid({
  links,
  loading = false,
  viewMode = 'grid',
  density = 'comfortable',
  onViewModeChange,
  onDensityChange,
  onLinkClick,
  className
}: LinkGridProps) {
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'alphabetical'>('newest')
  
  // Sort links
  const sortedLinks = useMemo(() => {
    const sorted = [...links]
    switch (sortBy) {
      case 'popular':
        return sorted.sort((a, b) => b.clickCount - a.clickCount)
      case 'alphabetical':
        return sorted.sort((a, b) => a.title.localeCompare(b.title))
      case 'newest':
      default:
        return sorted.sort((a, b) => b.featured ? 1 : -1)
    }
  }, [links, sortBy])

  // Separate featured and regular links
  const featuredLinks = sortedLinks.filter(link => link.featured)
  const regularLinks = sortedLinks.filter(link => !link.featured)

  const getGridClasses = () => {
    const baseClasses = "grid gap-6 w-full"
    
    switch (viewMode) {
      case 'list':
        return `${baseClasses} grid-cols-1`
      case 'masonry':
        return `${baseClasses} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
      case 'grid':
      default:
        if (density === 'compact') {
          return `${baseClasses} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5`
        }
        return `${baseClasses} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
    }
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  if (links.length === 0) {
    return <EmptyState />
  }

  return (
    <div className={cn("space-y-8", className)}>
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {links.length.toLocaleString()} resources
          </span>
          {featuredLinks.length > 0 && (
            <TagChip size="sm" className="bg-lime-500/20 text-lime-600 dark:text-lime-400">
              {featuredLinks.length} featured
            </TagChip>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          >
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="alphabetical">A-Z</option>
          </select>

          {/* View Mode */}
          <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-lg p-1 bg-white dark:bg-neutral-800">
            <button
              onClick={() => onViewModeChange?.('grid')}
              className={cn(
                "p-1.5 rounded-md transition-all",
                viewMode === 'grid' 
                  ? "bg-cyan-500 text-white shadow-lg" 
                  : "text-neutral-600 dark:text-neutral-400 hover:text-cyan-500"
              )}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => onViewModeChange?.('list')}
              className={cn(
                "p-1.5 rounded-md transition-all",
                viewMode === 'list' 
                  ? "bg-cyan-500 text-white shadow-lg" 
                  : "text-neutral-600 dark:text-neutral-400 hover:text-cyan-500"
              )}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => onViewModeChange?.('masonry')}
              className={cn(
                "p-1.5 rounded-md transition-all",
                viewMode === 'masonry' 
                  ? "bg-cyan-500 text-white shadow-lg" 
                  : "text-neutral-600 dark:text-neutral-400 hover:text-cyan-500"
              )}
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          {/* Density */}
          <button
            onClick={() => onDensityChange?.(density === 'comfortable' ? 'compact' : 'comfortable')}
            className="px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-cyan-500 hover:border-cyan-500 transition-all"
          >
            {density === 'comfortable' ? 'Compact' : 'Comfortable'}
          </button>
        </div>
      </div>

      {/* Featured Section */}
      {featuredLinks.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-lime-500 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <SortAsc size={16} className="text-white" />
                </motion.div>
              </div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                Featured Resources
              </h2>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/50 to-transparent" />
          </div>

          <div className={cn(
            "grid gap-6",
            viewMode === 'list' 
              ? "grid-cols-1" 
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          )}>
            <AnimatePresence mode="popLayout">
              {featuredLinks.map((link, index) => (
                <motion.div
                  key={link.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.05,
                    layout: { duration: 0.3 }
                  }}
                  className={cn(
                    viewMode === 'list' && "col-span-full",
                    index === 0 && viewMode === 'grid' && "sm:col-span-2 sm:row-span-2"
                  )}
                >
                  <LinkCard
                    {...link}
                    onClick={() => onLinkClick?.(link)}
                    className={cn(
                      "h-full",
                      index === 0 && viewMode === 'grid' && "sm:h-auto"
                    )}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.section>
      )}

      {/* Regular Links */}
      {regularLinks.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {featuredLinks.length > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                All Resources
              </h2>
              <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
            </div>
          )}

          <div className={getGridClasses()}>
            <AnimatePresence mode="popLayout">
              {regularLinks.map((link, index) => (
                <motion.div
                  key={link.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.02,
                    layout: { duration: 0.3 }
                  }}
                >
                  <LinkCard
                    {...link}
                    onClick={() => onLinkClick?.(link)}
                    className="h-full"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.section>
      )}
    </div>
  )
}