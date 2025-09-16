import React from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Star, Bookmark, Share2, Eye, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/stores/app-store'
import { cn, formatNumber } from '@/lib/utils'
import type { LinkItem } from '@/lib/types'

interface LinkCardProps {
  link: LinkItem
  index?: number
  onLinkClick?: (link: LinkItem) => void
}

export function LinkCard({ link, index = 0, onLinkClick }: LinkCardProps) {
  const { savedLinks, toggleSavedLink, addToRecentlyViewed } = useAppStore()
  const isSaved = savedLinks.has(link.id)

  const handleLinkClick = () => {
    addToRecentlyViewed(link.id)
    onLinkClick?.(link)
    // Track click analytics here
    window.open(link.url, '_blank', 'noopener,noreferrer')
  }

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleSavedLink(link.id)
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.share({
        title: link.title,
        text: link.description,
        url: link.url
      })
    } catch {
      // Fallback to clipboard
      await navigator.clipboard.writeText(link.url)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className="link-card group cursor-pointer"
      onClick={handleLinkClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Featured Badge */}
      {link.featured && (
        <div className="absolute top-4 right-4 z-10">
          <div 
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--text-inverse)'
            }}
          >
            <Zap size={12} />
            Featured
          </div>
        </div>
      )}

      {/* Verified Badge */}
      {link.verified && (
        <div className="absolute top-4 left-4 z-10">
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: 'var(--success-500)',
              color: 'white'
            }}
          >
            <Star size={12} fill="currentColor" />
          </div>
        </div>
      )}

      {/* Screenshot/Icon */}
      <div className="relative mb-4 overflow-hidden rounded-lg">
        {link.screenshot ? (
          <img
            src={link.screenshot}
            alt={`${link.title} screenshot`}
            className="w-full h-32 object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div 
            className="w-full h-32 flex items-center justify-center"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            {link.icon ? (
              <img src={link.icon} alt={link.title} className="w-12 h-12" />
            ) : (
              <ExternalLink size={24} style={{ color: 'var(--text-tertiary)' }} />
            )}
          </div>
        )}
        
        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleSave}
            className={cn(
              "h-8 w-8 p-0",
              isSaved && "text-yellow-500"
            )}
          >
            <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleShare}
            className="h-8 w-8 p-0"
          >
            <Share2 size={14} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div>
          <h3 
            className="font-bold text-lg mb-2 group-hover:text-gradient-electric transition-all line-clamp-2"
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-bold)'
            }}
          >
            {link.title}
          </h3>
          <p 
            className="text-sm line-clamp-2"
            style={{
              color: 'var(--text-secondary)',
              lineHeight: 'var(--leading-relaxed)'
            }}
          >
            {link.description}
          </p>
        </div>

        {/* Tags */}
        {link.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {link.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 rounded-full text-xs"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-tertiary)',
                  fontSize: 'var(--text-xs)'
                }}
              >
                {tag}
              </span>
            ))}
            {link.tags.length > 3 && (
              <span
                className="px-2 py-1 rounded-full text-xs"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-tertiary)'
                }}
              >
                +{link.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            <div className="flex items-center gap-1">
              <Eye size={12} />
              {formatNumber(link.clickCount)}
            </div>
            <div className="flex items-center gap-1">
              <Star size={12} />
              {link.rating.toFixed(1)}
            </div>
          </div>
          
          <span 
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--text-inverse)',
              opacity: 0.8
            }}
          >
            {link.category}
          </span>
        </div>
      </div>
    </motion.div>
  )
}