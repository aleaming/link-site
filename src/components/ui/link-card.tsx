import * as React from "react"
import { motion } from "framer-motion"
import { ExternalLink, Bookmark, Share2, Eye, Star, Zap } from "lucide-react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { GlowButton } from "./glow-button"
import { TagGroup, TagChip } from "./tag-chip"
import { cn } from "@/lib/utils"

export interface LinkCardProps {
  id: string
  title: string
  description: string
  url: string
  domain?: string
  screenshot?: string
  icon?: string
  tags: string[]
  clickCount: number
  featured?: boolean
  verified?: boolean
  saved?: boolean
  onSave?: (id: string) => void
  onShare?: (url: string, title: string) => void
  onClick?: (id: string) => void
  className?: string
}

const LinkCard = React.forwardRef<HTMLDivElement, LinkCardProps>(
  ({
    id,
    title,
    description,
    url,
    domain,
    screenshot,
    icon,
    tags,
    clickCount,
    featured = false,
    verified = false,
    saved = false,
    onSave,
    onShare,
    onClick,
    className,
    ...props
  }, ref) => {
    const [imageLoaded, setImageLoaded] = React.useState(false)
    const [imageError, setImageError] = React.useState(false)

    const handleCardClick = () => {
      onClick?.(id)
      window.open(url, '_blank', 'noopener,noreferrer')
    }

    const handleSave = (e: React.MouseEvent) => {
      e.stopPropagation()
      onSave?.(id)
    }

    const handleShare = (e: React.MouseEvent) => {
      e.stopPropagation()
      onShare?.(url, title)
    }

    const formatClickCount = (count: number) => {
      if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
      if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
      return count.toString()
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          "group relative rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/70 dark:backdrop-blur-sm overflow-hidden cursor-pointer",
          "shadow-elevated transition-[transform,box-shadow,border-color] duration-300 ease-smooth",
          "hover:border-cyan-400/60 hover:shadow-glow-cyan-lg",
          "focus-within:border-cyan-400/60 focus-within:shadow-glow-cyan-lg",
          className
        )}
        onClick={handleCardClick}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        {...props}
      >
        {/* Gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-lime-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" 
             style={{ padding: '2px', borderRadius: '12px' }}>
          <div className="w-full h-full bg-white dark:bg-neutral-800 rounded-[10px]" />
        </div>

        {/* Featured badge */}
        {featured && (
          <div className="absolute top-3 right-3 z-10">
            <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-cyan-500 to-lime-500 text-white text-xs font-semibold rounded-full shadow-lg">
              <Zap size={10} />
              Featured
            </div>
          </div>
        )}

        {/* Verified badge */}
        {verified && (
          <div className="absolute top-3 left-3 z-10">
            <div className="flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full shadow-lg">
              <Star size={12} fill="currentColor" />
            </div>
          </div>
        )}

        {/* Image/Screenshot */}
        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-950">
          {screenshot && !imageError ? (
            <>
              <img
                src={screenshot}
                alt={`${title} screenshot`}
                className={cn(
                  "w-full h-full object-cover transition-all duration-500 group-hover:scale-110",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                loading="lazy"
              />
              {!imageLoaded && (
                <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-600 animate-pulse" />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              {icon ? (
                <img src={icon} alt={title} className="w-12 h-12 object-contain" />
              ) : (
                <ExternalLink size={24} className="text-neutral-400 dark:text-neutral-500" />
              )}
            </div>
          )}

          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <GlowButton
              size="sm"
              variant="ghost"
              onClick={handleSave}
              className={cn(
                "bg-white/20 backdrop-blur-sm border-white/30",
                saved && "text-yellow-400"
              )}
            >
              <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
            </GlowButton>
            
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <GlowButton
                  size="sm"
                  variant="ghost"
                  onClick={handleShare}
                  className="bg-white/20 backdrop-blur-sm border-white/30"
                >
                  <Share2 size={14} />
                </GlowButton>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="min-w-[160px] bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-lg p-1 z-50"
                  sideOffset={5}
                >
                  <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer">
                    Copy Link
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer">
                    Share on Twitter
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer">
                    Share on LinkedIn
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title and Domain */}
          <div>
            <h3 className="font-display font-semibold text-lg tracking-tight text-neutral-900 dark:text-white transition-colors duration-300 line-clamp-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-300">
              {title}
            </h3>
            {domain && (
              <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400 mt-1.5">
                {domain}
              </p>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed">
            {description}
          </p>

          {/* Tags */}
          {tags.length > 0 && (
            <TagGroup maxVisible={3}>
              {tags.map((tag) => (
                <TagChip key={tag} size="sm">
                  {tag}
                </TagChip>
              ))}
            </TagGroup>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-700">
            <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
              <Eye size={12} />
              <span>{formatClickCount(clickCount)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {verified && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Verified
                </span>
              )}
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </motion.div>
    )
  }
)
LinkCard.displayName = "LinkCard"

export { LinkCard }