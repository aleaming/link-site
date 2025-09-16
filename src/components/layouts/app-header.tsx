import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Zap, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  User, 
  Plus,
  Command
} from 'lucide-react'
import { GlowButton } from '@/components/ui/glow-button'
import { cn } from '@/lib/utils'

interface AppHeaderProps {
  onSearchOpen?: () => void
  onMobileMenuToggle?: () => void
  isMobileMenuOpen?: boolean
  className?: string
}

export function AppHeader({ 
  onSearchOpen, 
  onMobileMenuToggle, 
  isMobileMenuOpen = false,
  className 
}: AppHeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollTop / docHeight
      
      setScrolled(scrollTop > 20)
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const handleSearchClick = () => {
    if (window.innerWidth < 768) {
      setSearchExpanded(!searchExpanded)
    } else {
      onSearchOpen?.()
    }
  }

  return (
    <>
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 z-50 bg-gradient-to-r from-cyan-500 to-lime-500 origin-left"
        style={{ scaleX: scrollProgress }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: scrollProgress }}
        transition={{ duration: 0.1 }}
      />

      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          scrolled 
            ? "bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200/50 dark:border-neutral-700/50 shadow-lg" 
            : "bg-transparent",
          className
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Logo + Mobile Menu */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <GlowButton
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={onMobileMenuToggle}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X size={20} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu size={20} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlowButton>

              {/* Logo */}
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative">
                  <motion.div
                    animate={{ 
                      boxShadow: [
                        "0 0 20px rgba(11, 249, 255, 0.5)",
                        "0 0 30px rgba(11, 249, 255, 0.8)",
                        "0 0 20px rgba(11, 249, 255, 0.5)"
                      ]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="rounded-full"
                  >
                    <Zap 
                      size={32} 
                      className="text-cyan-500 drop-shadow-lg" 
                    />
                  </motion.div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-lime-500 bg-clip-text text-transparent">
                    SaaSy Resources
                  </h1>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 -mt-1">
                    Electric Tools Directory
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Center: Search */}
            <AnimatePresence>
              {!searchExpanded && (
                <motion.div 
                  className="hidden md:flex flex-1 max-w-md mx-8"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <button
                    onClick={handleSearchClick}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group bg-white/10 dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(11,249,255,0.3)] backdrop-blur-sm"
                  >
                    <Search size={16} className="text-neutral-400 group-hover:text-cyan-500 transition-colors" />
                    <span className="flex-1 text-left text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300">
                      Search resources...
                    </span>
                    <kbd className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-600">
                      <Command size={10} />
                      K
                    </kbd>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile Expanded Search */}
            <AnimatePresence>
              {searchExpanded && (
                <motion.div
                  className="absolute left-4 right-4 top-full mt-2 md:hidden"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-xl">
                    <Search size={16} className="text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search resources..."
                      className="flex-1 bg-transparent border-none outline-none text-neutral-900 dark:text-white placeholder:text-neutral-400"
                      autoFocus
                    />
                    <button
                      onClick={() => setSearchExpanded(false)}
                      className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Mobile Search Toggle */}
              <GlowButton
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={handleSearchClick}
              >
                <Search size={20} />
              </GlowButton>

              {/* Theme Toggle */}
              <GlowButton
                variant="ghost"
                size="icon"
                onClick={() => setDarkMode(!darkMode)}
                className="relative overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  {darkMode ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Sun size={20} className="text-lime-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Moon size={20} className="text-cyan-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlowButton>

              {/* User Menu */}
              <GlowButton
                variant="ghost"
                size="icon"
                className="hidden sm:flex"
              >
                <User size={20} />
              </GlowButton>

              {/* Submit Link CTA */}
              <GlowButton 
                variant="secondary"
                className="hidden sm:flex font-semibold"
              >
                <Plus size={16} />
                Submit Tool
              </GlowButton>
            </div>
          </div>
        </div>

        {/* Mobile expanded search backdrop */}
        <AnimatePresence>
          {searchExpanded && (
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchExpanded(false)}
              style={{ zIndex: -1 }}
            />
          )}
        </AnimatePresence>
      </motion.header>
    </>
  )
}