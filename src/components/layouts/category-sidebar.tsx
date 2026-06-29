import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Hash,
  Star,
  Zap,
  Database,
  Palette,
  Code,
  Smartphone,
  BarChart,
  Shield,
  TrendingUp,
  CheckSquare,
  Globe,
  X,
  type LucideIcon
} from 'lucide-react'
import { GlowButton } from '@/components/ui/glow-button'
import { TagChip } from '@/components/ui/tag-chip'
import { cn } from '@/lib/utils'
import type { AppCategory } from '@/lib/data'

// Maps the icon *name* stored in the DB (categories.icon) to a lucide component.
const ICON_MAP: Record<string, LucideIcon> = {
  Hash, Code, Palette, Zap, BarChart, TrendingUp,
  CheckSquare, Shield, Database, Globe, Smartphone
}

interface CategorySidebarProps {
  isOpen?: boolean
  onClose?: () => void
  activeCategory?: string
  onCategorySelect?: (slug: string) => void
  categories?: AppCategory[]
  stats?: { total: number; showing: number; featured: number }
  className?: string
}

export function CategorySidebar({
  isOpen = false,
  onClose,
  activeCategory = 'all',
  onCategorySelect,
  categories = [],
  stats = { total: 0, showing: 0, featured: 0 },
  className
}: CategorySidebarProps) {
  const handleCategoryClick = (slug: string) => {
    onCategorySelect?.(slug)
    if (window.innerWidth < 1024) {
      onClose?.()
    }
  }

  // "All" pseudo-category first, then the real categories from the DB.
  const items: AppCategory[] = [
    { id: 'all', name: 'All Categories', slug: 'all', icon: 'Hash', color: null, featured: true, count: stats.total },
    ...categories
  ]

  const CategoryItem = ({ category }: { category: AppCategory }) => {
    const isActive = activeCategory === category.slug
    const Icon = ICON_MAP[category.icon ?? 'Hash'] ?? Hash

    return (
      <motion.button
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group',
          isActive
            ? 'bg-gradient-to-r from-cyan-500/20 to-lime-500/20 border border-cyan-500/50 text-cyan-400 shadow-[0_0_20px_rgba(11,249,255,0.3)]'
            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300 hover:text-cyan-500 dark:hover:text-cyan-400'
        )}
        onClick={() => handleCategoryClick(category.slug)}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className={cn(
          'flex items-center justify-center w-8 h-8 rounded-lg transition-all',
          isActive
            ? 'bg-cyan-500 text-white shadow-lg'
            : 'bg-neutral-100 dark:bg-neutral-800 group-hover:bg-cyan-500/20'
        )}>
          <Icon size={16} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{category.name}</span>
            {category.featured && (
              <Star size={12} className="text-lime-500 fill-current" />
            )}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            {category.count.toLocaleString()} {category.count === 1 ? 'resource' : 'resources'}
          </div>
        </div>

        <TagChip size="sm" className="text-xs">
          {category.count}
        </TagChip>
      </motion.button>
    )
  }

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h2 className="font-bold text-lg text-neutral-900 dark:text-white">
            Categories
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Browse by category
          </p>
        </div>
        <GlowButton
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onClose}
        >
          <X size={20} />
        </GlowButton>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {items.map((category) => (
          <CategoryItem key={category.slug} category={category} />
        ))}
      </div>

      {/* Filter Stats */}
      <motion.div
        className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="font-semibold text-sm text-neutral-700 dark:text-neutral-300 mb-3">
          Filter Statistics
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Resources</span>
            <TagChip size="sm" variant="default">
              {stats.total.toLocaleString()}
            </TagChip>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Currently Showing</span>
            <TagChip size="sm" variant="active">
              {stats.showing.toLocaleString()}
            </TagChip>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Featured</span>
            <TagChip size="sm" className="bg-lime-500/20 text-lime-600 dark:text-lime-400">
              {stats.featured}
            </TagChip>
          </div>
        </div>
      </motion.div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        className={cn(
          'hidden lg:block w-80 h-screen sticky top-16 overflow-hidden',
          className
        )}
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            {/* Drawer */}
            <motion.aside
              className="fixed left-0 top-0 z-50 w-80 h-screen lg:hidden"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
