import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, 
  ChevronRight, 
  Hash, 
  Star, 
  Zap,
  Database,
  Palette,
  Code,
  Smartphone,
  BarChart,
  Shield,
  X
} from 'lucide-react'
import { GlowButton } from '@/components/ui/glow-button'
import { TagChip } from '@/components/ui/tag-chip'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  icon: React.ReactNode
  count: number
  featured?: boolean
  subcategories?: Category[]
}

interface CategorySidebarProps {
  isOpen?: boolean
  onClose?: () => void
  activeCategory?: string
  onCategorySelect?: (categoryId: string) => void
  className?: string
}

const mockCategories: Category[] = [
  {
    id: 'all',
    name: 'All Categories',
    icon: <Hash size={16} />,
    count: 1247,
    featured: true
  },
  {
    id: 'development',
    name: 'Development',
    icon: <Code size={16} />,
    count: 324,
    subcategories: [
      { id: 'frontend', name: 'Frontend', icon: <Smartphone size={14} />, count: 156 },
      { id: 'backend', name: 'Backend', icon: <Database size={14} />, count: 98 },
      { id: 'mobile', name: 'Mobile', icon: <Smartphone size={14} />, count: 70 }
    ]
  },
  {
    id: 'design',
    name: 'Design',
    icon: <Palette size={16} />,
    count: 189,
    featured: true,
    subcategories: [
      { id: 'ui-ux', name: 'UI/UX', icon: <Palette size={14} />, count: 112 },
      { id: 'graphics', name: 'Graphics', icon: <Palette size={14} />, count: 77 }
    ]
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: <BarChart size={16} />,
    count: 156
  },
  {
    id: 'security',
    name: 'Security',
    icon: <Shield size={16} />,
    count: 89
  },
  {
    id: 'ai-ml',
    name: 'AI & ML',
    icon: <Zap size={16} />,
    count: 234,
    featured: true
  }
]

export function CategorySidebar({ 
  isOpen = false, 
  onClose, 
  activeCategory = 'all',
  onCategorySelect,
  className 
}: CategorySidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['development']))
  const [filterStats] = useState({
    total: 1247,
    filtered: 324,
    featured: 89
  })

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleCategoryClick = (categoryId: string) => {
    onCategorySelect?.(categoryId)
    if (window.innerWidth < 1024) {
      onClose?.()
    }
  }

  const CategoryItem = ({ 
    category, 
    level = 0, 
    isActive = false 
  }: { 
    category: Category
    level?: number
    isActive?: boolean 
  }) => {
    const hasSubcategories = category.subcategories && category.subcategories.length > 0
    const isExpanded = expandedCategories.has(category.id)

    return (
      <div className="space-y-1">
        <motion.button
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group",
            level > 0 && "ml-4 pl-6",
            isActive 
              ? "bg-gradient-to-r from-cyan-500/20 to-lime-500/20 border border-cyan-500/50 text-cyan-400 shadow-[0_0_20px_rgba(11,249,255,0.3)]" 
              : "hover:bg-neutral-100 dark:hover:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300 hover:text-cyan-500 dark:hover:text-cyan-400"
          )}
          onClick={() => handleCategoryClick(category.id)}
          whileHover={{ x: level === 0 ? 4 : 2 }}
          whileTap={{ scale: 0.98 }}
        >
          {hasSubcategories && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleCategory(category.id)
              }}
              className="p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
            >
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight size={12} />
              </motion.div>
            </button>
          )}
          
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg transition-all",
            isActive 
              ? "bg-cyan-500 text-white shadow-lg" 
              : "bg-neutral-100 dark:bg-neutral-800 group-hover:bg-cyan-500/20"
          )}>
            {category.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn(
                "font-medium truncate",
                level > 0 && "text-sm"
              )}>
                {category.name}
              </span>
              {category.featured && (
                <Star size={12} className="text-lime-500 fill-current" />
              )}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              {category.count.toLocaleString()} resources
            </div>
          </div>
          
          <TagChip size="sm" className="text-xs">
            {category.count}
          </TagChip>
        </motion.button>

        {/* Subcategories */}
        <AnimatePresence>
          {hasSubcategories && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-1 pt-1">
                {category.subcategories!.map((subcategory) => (
                  <CategoryItem
                    key={subcategory.id}
                    category={subcategory}
                    level={level + 1}
                    isActive={activeCategory === subcategory.id}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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
        {mockCategories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            isActive={activeCategory === category.id}
          />
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
              {filterStats.total.toLocaleString()}
            </TagChip>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Currently Showing</span>
            <TagChip size="sm" variant="active">
              {filterStats.filtered.toLocaleString()}
            </TagChip>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Featured</span>
            <TagChip size="sm" className="bg-lime-500/20 text-lime-600 dark:text-lime-400">
              {filterStats.featured}
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
          "hidden lg:block w-80 h-screen sticky top-16 overflow-hidden",
          className
        )}
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
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
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}