import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LinkCard } from './link-card'
import { LinkSkeleton } from './link-skeleton'
import { useAppStore } from '@/lib/stores/app-store'
import type { LinkItem } from '@/lib/types'

interface LinkGridProps {
  links: LinkItem[]
  loading?: boolean
  onLinkClick?: (link: LinkItem) => void
}

export function LinkGrid({ links, loading = false, onLinkClick }: LinkGridProps) {
  const { viewMode } = useAppStore()

  const getGridClasses = () => {
    const baseClasses = "grid gap-6 w-full"
    
    switch (viewMode.type) {
      case 'list':
        return `${baseClasses} grid-cols-1`
      case 'compact':
        return `${baseClasses} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5`
      case 'grid':
      default:
        return `${baseClasses} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
    }
  }

  if (loading) {
    return (
      <div className={getGridClasses()}>
        {Array.from({ length: 12 }).map((_, index) => (
          <LinkSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (links.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="max-w-md mx-auto">
          <div 
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <svg
              className="w-8 h-8"
              style={{ color: 'var(--text-tertiary)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            No resources found
          </h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Try adjusting your search criteria or browse different categories.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      className={getGridClasses()}
    >
      <AnimatePresence mode="popLayout">
        {links.map((link, index) => (
          <LinkCard
            key={link.id}
            link={link}
            index={index}
            onLinkClick={onLinkClick}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  )
}