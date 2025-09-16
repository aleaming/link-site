import React from 'react'
import { Search, Zap, Sun, Moon, Menu, Command } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/stores/app-store'

export function Header() {
  const { 
    darkMode, 
    setDarkMode, 
    sidebarOpen, 
    setSidebarOpen,
    setCommandPaletteOpen 
  } = useAppStore()

  return (
    <header 
      className="sticky top-0 z-40 glass-electric"
      style={{ borderBottom: '1px solid var(--border-primary)' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo + Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={20} />
            </Button>

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Zap 
                  size={32} 
                  style={{ color: 'var(--accent-primary)' }}
                  className="pulse-electric"
                />
              </div>
              <h1 
                className="text-2xl font-bold text-gradient-electric hidden sm:block"
                style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)' }}
              >
                SaaSy Resources
              </h1>
            </div>
          </div>

          {/* Center: Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all electric-glow-hover"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-secondary)'
              }}
            >
              <Search size={16} />
              <span className="flex-1 text-left">Search resources...</span>
              <kbd 
                className="flex items-center gap-1 px-2 py-1 text-xs rounded"
                style={{ 
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-tertiary)'
                }}
              >
                <Command size={10} />
                K
              </kbd>
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setCommandPaletteOpen(true)}
            >
              <Search size={20} />
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="electric-glow-hover"
            >
              {darkMode ? (
                <Sun size={20} style={{ color: 'var(--accent-secondary)' }} />
              ) : (
                <Moon size={20} style={{ color: 'var(--accent-primary)' }} />
              )}
            </Button>

            {/* Submit Link */}
            <Button variant="electric" className="hidden sm:inline-flex">
              <Zap size={16} />
              Submit Tool
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}