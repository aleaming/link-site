import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Zap, 
  TrendingUp, 
  Users, 
  Database,
  ArrowRight,
  Sparkles,
  MousePointerClick
} from 'lucide-react'
import { GlowButton } from '@/components/ui/glow-button'
import { TagChip, TagGroup } from '@/components/ui/tag-chip'
import { cn } from '@/lib/utils'

interface HeroStat {
  label: string
  value: number
}

interface HeroSectionProps {
  onSearchOpen?: () => void
  onTagClick?: (tag: string) => void
  stats?: HeroStat[]
  className?: string
}

// Icons are paired to stats by position; labels/values come from real data.
const STAT_ICONS = [Database, TrendingUp, MousePointerClick]
const DEFAULT_STATS: HeroStat[] = [
  { label: 'Resources', value: 0 },
  { label: 'Categories', value: 0 },
  { label: 'Total Clicks', value: 0 }
]

const popularTags = [
  'AI Tools', 'Design', 'Development', 'Analytics', 'Marketing', 
  'Productivity', 'Security', 'Mobile', 'API', 'SaaS'
]

const typewriterTexts = [
  'SaaS Tools',
  'AI Resources', 
  'Dev Tools',
  'Design Assets',
  'API Services'
]

export function HeroSection({ onSearchOpen, onTagClick, stats: statsProp, className }: HeroSectionProps) {
  // Pair real (label, value) stats with their icons by position.
  const stats = (statsProp && statsProp.length ? statsProp : DEFAULT_STATS).map((s, i) => ({
    ...s,
    icon: STAT_ICONS[i % STAT_ICONS.length]
  }))

  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [animatedStats, setAnimatedStats] = useState<number[]>(stats.map(() => 0))

  // Typewriter effect
  useEffect(() => {
    const currentFullText = typewriterTexts[currentTextIndex]
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentFullText.length) {
          setDisplayText(currentFullText.slice(0, displayText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1))
        } else {
          setIsDeleting(false)
          setCurrentTextIndex((prev) => (prev + 1) % typewriterTexts.length)
        }
      }
    }, isDeleting ? 50 : 100)

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, currentTextIndex])

  // Animate stats on mount
  useEffect(() => {
    const animateStats = () => {
      stats.forEach((stat, index) => {
        let current = 0
        const increment = stat.value / 50
        const timer = setInterval(() => {
          current += increment
          if (current >= stat.value) {
            current = stat.value
            clearInterval(timer)
          }
          setAnimatedStats(prev => {
            const newStats = [...prev]
            newStats[index] = Math.floor(current)
            return newStats
          })
        }, 30)
      })
    }

    const timer = setTimeout(animateStats, 500)
    return () => clearTimeout(timer)
  }, [stats.map(s => s.value).join(',')])

  const formatStatValue = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toString()
  }

  return (
    <section className={cn("relative overflow-hidden", className)}>
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient Background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-lime-500/10"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(11, 249, 255, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(211, 255, 26, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 80%, rgba(11, 249, 255, 0.1) 0%, transparent 50%)"
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

      </div>

      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <h1 className="font-display font-bold tracking-tight leading-[1.05] mb-6 text-[clamp(2.75rem,7vw,5.5rem)]">
            <span className="block text-neutral-900 dark:text-white">
              Discover Electric
            </span>
            <span className="block relative bg-gradient-to-r from-cyan-400 via-cyan-300 to-lime-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-pan drop-shadow-[0_0_28px_rgba(11,249,255,0.25)]">
              {displayText}
              <motion.span
                className="inline-block w-[3px] h-[0.85em] align-middle ml-2 rounded-full bg-cyan-400"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </span>
          </h1>
          
          <motion.p
            className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Curated collection of the hottest SaaS tools, APIs, and resources for modern 
            <span className="text-cyan-500 font-semibold"> entrepreneurs</span> and 
            <span className="text-lime-500 font-semibold"> indie hackers</span>.
          </motion.p>
        </motion.div>

        {/* Search CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-12"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <GlowButton
              variant="primary"
              size="lg"
              onClick={onSearchOpen}
              className="w-full sm:w-auto text-lg px-8 py-4"
            >
              <Search size={20} />
              Explore Resources
            </GlowButton>
            
            <GlowButton
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto text-lg px-8 py-4"
            >
              <Sparkles size={20} />
              Submit Tool
            </GlowButton>
          </div>

          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-4">
            Press <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-xs">⌘K</kbd> to search
          </p>
        </motion.div>

        {/* Popular Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-16"
        >
          <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
            Popular Categories
          </h3>
          <TagGroup className="justify-center">
            {popularTags.map((tag, index) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
              >
                <TagChip
                  onClick={() => onTagClick?.(tag)}
                  className="cursor-pointer hover:scale-105 transition-transform"
                >
                  {tag}
                </TagChip>
              </motion.div>
            ))}
          </TagGroup>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                className="group relative rounded-2xl border border-neutral-200/70 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm px-6 py-7 text-center transition-all duration-300 ease-smooth hover:-translate-y-1 hover:border-cyan-400/50 hover:shadow-glow-cyan"
                whileTap={{ scale: 0.98 }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-lime-500/20 border border-cyan-500/30 mb-4 transition-transform duration-300 group-hover:scale-110">
                  <Icon size={22} className="text-cyan-400" />
                </div>
                <div className="font-display text-4xl font-bold text-neutral-900 dark:text-white mb-1 tabular-nums">
                  {formatStatValue(animatedStats[index])}
                  <span className="text-cyan-400">+</span>
                </div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 border-2 border-neutral-300 dark:border-neutral-600 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-3 bg-gradient-to-b from-cyan-500 to-lime-500 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}