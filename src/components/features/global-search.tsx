import React, { useState, useEffect } from 'react'
import { Command } from 'cmdk'
import { Search, Hash, Bookmark, Clock, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/stores/app-store'
import { cn } from '@/lib/utils'
import type { LinkItem, Category } from '@/lib/types'

interface GlobalSearchProps {
  links: LinkItem[]
  categories: Category[]
  onLinkSelect?: (link: LinkItem) => void
  onCategorySelect?: (category: Category) => void
}

export function GlobalSearch({ 
  links, 
  categories, 
  onLinkSelect, 
  onCategorySelect 
}: GlobalSearchProps) {
  const { 
    commandPaletteOpen, 
    setCommandPaletteOpen, 
    recentlyViewed,
    savedLinks,
    setSearchFilters
  } = useAppStore()
  
  const [search, setSearch] = useState('')

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandPaletteOpen(!commandPaletteOpen)
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [commandPaletteOpen, setCommandPaletteOpen])

  const recentLinks = links.filter(link => recentlyViewed.includes(link.id))
  const savedLinksArray = links.filter(link => savedLinks.has(link.id))
  const featuredLinks = links.filter(link => link.featured)

  const handleLinkSelect = (link: LinkItem) => {
    setCommandPaletteOpen(false)
    setSearch('')
    onLinkSelect?.(link)
  }

  const handleCategorySelect = (category: Category) => {
    setCommandPaletteOpen(false)
    setSearch('')
    setSearchFilters({ categories: [category.name] })
    onCategorySelect?.(category)
  }

  const handleQuickSearch = (query: string) => {
    setCommandPaletteOpen(false)
    setSearch('')
    setSearchFilters({ query })
  }

  if (!commandPaletteOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
        onClick={() => setCommandPaletteOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="glass-electric w-full max-w-2xl mx-4 rounded-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <Command className="w-full">
            <div className="flex items-center px-4 py-3 border-b" style={{ borderColor: 'var(--border-primary)' }}>
              <Search size={18} style={{ color: 'var(--text-tertiary)' }} />
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder="Search resources, categories, or type a command..."
                className="flex-1 ml-3 bg-transparent border-none outline-none text-base"
                style={{ color: 'var(--text-primary)' }}
              />
              <kbd 
                className="px-2 py-1 text-xs rounded"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-tertiary)'
                }}
              >
                ESC
              </kbd>
            </div>

            <Command.List className="max-h-96 overflow-y-auto p-2">
              <Command.Empty className="py-8 text-center">
                <p style={{ color: 'var(--text-secondary)' }}>
                  No results found for "{search}"
                </p>
              </Command.Empty>

              {/* Quick Actions */}
              {search && (
                <Command.Group heading="Quick Actions">
                  <Command.Item
                    onSelect={() => handleQuickSearch(search)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-accent"
                  >
                    <Search size={16} style={{ color: 'var(--accent-primary)' }} />
                    <span>Search for "{search}"</span>
                  </Command.Item>
                </Command.Group>
              )}

              {/* Categories */}
              <Command.Group heading="Categories">
                {categories.map((category) => (
                  <Command.Item
                    key={category.id}
                    onSelect={() => handleCategorySelect(category)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-accent"
                  >
                    <Hash size={16} style={{ color: 'var(--accent-secondary)' }} />
                    <div className="flex-1">
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {category.linkCount} resources
                      </div>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>

              {/* Featured Links */}
              {featuredLinks.length > 0 && (
                <Command.Group heading="Featured">
                  {featuredLinks.slice(0, 5).map((link) => (
                    <Command.Item
                      key={link.id}
                      onSelect={() => handleLinkSelect(link)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-accent"
                    >
                      <Zap size={16} style={{ color: 'var(--accent-primary)' }} />
                      <div className="flex-1">
                        <div className="font-medium">{link.title}</div>
                        <div className="text-sm line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
                          {link.description}
                        </div>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {/* Recent */}
              {recentLinks.length > 0 && (
                <Command.Group heading="Recent">
                  {recentLinks.slice(0, 5).map((link) => (
                    <Command.Item
                      key={link.id}
                      onSelect={() => handleLinkSelect(link)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-accent"
                    >
                      <Clock size={16} style={{ color: 'var(--text-tertiary)' }} />
                      <div className="flex-1">
                        <div className="font-medium">{link.title}</div>
                        <div className="text-sm line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
                          {link.description}
                        </div>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {/* Saved */}
              {savedLinksArray.length > 0 && (
                <Command.Group heading="Saved">
                  {savedLinksArray.slice(0, 5).map((link) => (
                    <Command.Item
                      key={link.id}
                      onSelect={() => handleLinkSelect(link)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-accent"
                    >
                      <Bookmark size={16} style={{ color: 'var(--warning-500)' }} />
                      <div className="flex-1">
                        <div className="font-medium">{link.title}</div>
                        <div className="text-sm line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
                          {link.description}
                        </div>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {/* All Links */}
              <Command.Group heading="All Resources">
                {links.slice(0, 10).map((link) => (
                  <Command.Item
                    key={link.id}
                    onSelect={() => handleLinkSelect(link)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-accent"
                  >
                    {link.icon ? (
                      <img src={link.icon} alt="" className="w-4 h-4" />
                    ) : (
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: 'var(--accent-primary)' }}
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{link.title}</div>
                      <div className="text-sm line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
                        {link.description}
                      </div>
                    </div>
                    <span 
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ 
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-tertiary)'
                      }}
                    >
                      {link.category}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}