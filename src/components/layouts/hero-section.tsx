import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Zap, 
  TrendingUp, 
  Users, 
  Database,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { GlowButton } from '@/components/ui/glow-button'
import { TagChip, TagGroup } from '@/components/ui/tag-chip'
import { cn } from '@/lib/utils'

interface HeroSectionProps {
  onSearchOpen?: () => void
  onTagClick?: (tag: string) => void
  className?: string
}

const stats = [
  { label: 'Resources', value: 1247, icon: Database },
  { label: 'Categories', value: 24, icon: TrendingUp },
  { label: 'Users', value: 12500, icon: Users }
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

export function HeroSection({ onSearchOpen, onTagClick, className }: HeroSectionProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [animatedStats, setAnimatedStats] = useState(stats.map(() => 0))

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
  }, [])

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

        {/* Floating Geometric Shapes */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-cyan-500 to-lime-500 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <h1 className="text-5xl md:text-7xl font-black mb-6">
            <span className="block text-neutral-900 dark:text-white mb-2">
              Discover Electric
            </span>
            <span className="block bg-gradient-to-r from-cyan-500 to-lime-500 bg-clip-text text-transparent relative">
              {displayText}
              <motion.span
                className="inline-block w-1 h-16 md:h-20 bg-cyan-500 ml-2"
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
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-lime-500/20 border border-cyan-500/30 mb-4">
                  <Icon size={24} className="text-cyan-500" />
                </div>
                <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">
                  {formatStatValue(animatedStats[index])}
                  <span className="text-cyan-500">+</span>
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
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