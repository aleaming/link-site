import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import './design-system.css';
import { AppHeader } from './components/layouts/app-header'
import { CategorySidebar } from './components/layouts/category-sidebar'
import { LinkGrid } from './components/layouts/link-grid'
import { HeroSection } from './components/layouts/hero-section'
import { LinkCard } from './components/ui/link-card'
import { SearchCommand } from './components/ui/search-command'
import { TagChip, TagGroup } from './components/ui/tag-chip'
import { GlowButton } from './components/ui/glow-button'
import { Search, Zap, Sun, Moon, Plus } from 'lucide-react'

interface LinkItem {
  id: string
  title: string
  description: string
  url: string
  domain: string
  screenshot?: string
  icon?: string
  tags: string[]
  clickCount: number
  featured: boolean
  verified: boolean
  category: string
}

// Mock data - replace with actual API calls
const mockLinks: LinkItem[] = [
  {
    id: '1',
    title: "Vercel",
    description: "Deploy web projects with zero configuration and global CDN",
    url: "https://vercel.com",
    domain: "vercel.com",
    category: "Deployment",
    tags: ["hosting", "deployment", "cdn", "serverless"],
    featured: true,
    verified: true,
    clickCount: 15420,
    icon: "https://vercel.com/favicon.ico"
  },
  {
    id: '2',
    title: "Supabase",
    description: "Open source Firebase alternative with PostgreSQL database",
    url: "https://supabase.io",
    domain: "supabase.io",
    category: "Database",
    tags: ["database", "postgresql", "backend", "auth"],
    featured: true,
    verified: true,
    clickCount: 12350,
    icon: "https://supabase.com/favicon.ico"
  },
  {
    id: '3',
    title: "Tailwind CSS",
    description: "Utility-first CSS framework for rapid UI development",
    url: "https://tailwindcss.com",
    domain: "tailwindcss.com",
    category: "Styling",
    tags: ["css", "framework", "utility", "design"],
    featured: false,
    verified: true,
    clickCount: 8920,
    icon: "https://tailwindcss.com/favicon.ico"
  },
  {
    id: '4',
    title: "Stripe",
    description: "Complete payments platform for internet businesses",
    url: "https://stripe.com",
    domain: "stripe.com",
    category: "Payments",
    tags: ["payments", "billing", "subscriptions", "api"],
    featured: true,
    verified: true,
    clickCount: 11200,
    icon: "https://stripe.com/favicon.ico"
  },
  {
    id: '5',
    title: "OpenAI API",
    description: "Access to GPT models and AI capabilities via API",
    url: "https://openai.com/api",
    domain: "openai.com",
    category: "AI/ML",
    tags: ["ai", "gpt", "machine-learning", "api"],
    featured: false,
    verified: true,
    clickCount: 18750,
    icon: "https://openai.com/favicon.ico"
  },
  {
    id: '6',
    title: "Figma",
    description: "Collaborative interface design tool for teams",
    url: "https://figma.com",
    domain: "figma.com",
    category: "Design",
    tags: ["design", "ui", "collaboration", "prototyping"],
    featured: false,
    verified: true,
    clickCount: 7340,
    icon: "https://figma.com/favicon.ico"
  }
]

function App() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'masonry'>('grid')
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')
  const [savedLinks, setSavedLinks] = useState<Set<string>>(new Set())
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const { data: links = [] } = useQuery({
    queryKey: ['links'],
    queryFn: () => Promise.resolve(mockLinks),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  // Filter links by selected tags
  const filteredLinks = React.useMemo(() => {
    if (selectedTags.length === 0) return links
    return links.filter(link => 
      selectedTags.some(tag => link.tags.includes(tag))
    )
  }, [links, selectedTags])

  // Get all unique tags
  const allTags = React.useMemo(() => {
    const tagSet = new Set<string>()
    links.forEach(link => link.tags.forEach(tag => tagSet.add(tag)))
    return Array.from(tagSet)
  }, [links])

  const handleSave = (id: string) => {
    setSavedLinks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleShare = async (url: string, title: string) => {
    try {
      await navigator.share({ title, url })
    } catch {
      await navigator.clipboard.writeText(url)
    }
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const searchResults = filteredLinks.map(link => ({
    id: link.id,
    title: link.title,
    description: link.description,
    category: link.category,
    url: link.url,
    icon: link.icon
  }))

  const handleSearch = (query: string) => {
    // Implement search logic here
    console.log('Searching for:', query)
  }

  const handleSearchSelect = (result: any) => {
    window.open(result.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div 
      className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-all duration-300"
      style={{
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-primary)'
      }}
    >
      {/* Header */}
      <AppHeader
        onSearchOpen={() => setSearchOpen(true)}
        onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        isMobileMenuOpen={sidebarOpen}
      />

      {/* Layout */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <CategorySidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeCategory={activeCategory}
          onCategorySelect={setActiveCategory}
        />

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Hero Section */}
          <HeroSection
            onSearchOpen={() => setSearchOpen(true)}
            onTagClick={(tag) => handleTagToggle(tag)}
          />

          {/* Content */}
          <div className="max-w-7xl mx-auto px-4 py-12">
            {/* Tag Filters */}
            {selectedTags.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Active Filters
                  </h3>
                  <button
                    onClick={() => setSelectedTags([])}
                    className="text-sm text-cyan-500 hover:text-cyan-400 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
                <TagGroup>
                  {selectedTags.map(tag => (
                    <TagChip
                      key={tag}
                      variant="active"
                      removable
                      onRemove={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </TagChip>
                  ))}
                </TagGroup>
              </section>
            )}

            {/* Links Grid */}
            <LinkGrid
              links={filteredLinks}
              viewMode={viewMode}
              density={density}
              onViewModeChange={setViewMode}
              onDensityChange={setDensity}
              onLinkClick={(link) => {
                console.log('Link clicked:', link.title)
              }}
            />
          </div>
        </main>
      </div>

      {/* Search Command */}
      <SearchCommand
        open={searchOpen}
        onOpenChange={setSearchOpen}
        results={searchResults}
        recentSearches={["React components", "API tools", "Design systems"]}
        suggestions={["AI tools", "Database", "Authentication", "Deployment"]}
        onSearch={handleSearch}
        onSelect={handleSearchSelect}
        onRecentSelect={(query) => console.log('Recent:', query)}
      />
    </div>
  )
}

export default App