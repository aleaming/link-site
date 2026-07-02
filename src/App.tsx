import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import './design-system.css';
import { AppHeader } from './components/layouts/app-header'
import { CategorySidebar } from './components/layouts/category-sidebar'
import { LinkGrid } from './components/layouts/link-grid'
import { HeroSection } from './components/layouts/hero-section'
import { SearchCommand } from './components/ui/search-command'
import { TagChip, TagGroup } from './components/ui/tag-chip'
import { fetchLinks, fetchCategories, trackClick } from './lib/data'

function App() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'masonry'>('grid')
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const { data: links = [] } = useQuery({
    queryKey: ['links'],
    queryFn: fetchLinks,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000
  })

  // The category name for the active sidebar slug ('all' => no category filter).
  const activeCategoryName = React.useMemo(() => {
    if (activeCategory === 'all') return null
    return categories.find(c => c.slug === activeCategory)?.name ?? null
  }, [activeCategory, categories])

  // Filter links by the active category and any selected tags.
  const filteredLinks = React.useMemo(() => {
    return links.filter(link => {
      const categoryOk = !activeCategoryName || link.category === activeCategoryName
      const tagsOk = selectedTags.length === 0 || selectedTags.some(tag => link.tags.includes(tag))
      return categoryOk && tagsOk
    })
  }, [links, activeCategoryName, selectedTags])

  // Real stats for the hero, derived from the live data.
  const heroStats = React.useMemo(() => ([
    { label: 'Resources', value: links.length },
    { label: 'Categories', value: categories.length },
    { label: 'Total Clicks', value: links.reduce((sum, l) => sum + (l.clickCount || 0), 0) }
  ]), [links, categories])

  // Stats for the sidebar footer.
  const sidebarStats = React.useMemo(() => ({
    total: links.length,
    showing: filteredLinks.length,
    featured: links.filter(l => l.featured).length
  }), [links, filteredLinks])

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

  const handleSearchSelect = (result: { url: string }) => {
    window.open(result.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ color: 'var(--text-primary)' }}
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
          categories={categories}
          stats={sidebarStats}
        />

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Hero Section */}
          <HeroSection
            onSearchOpen={() => setSearchOpen(true)}
            onTagClick={(tag) => handleTagToggle(tag)}
            stats={heroStats}
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
                trackClick(link.id)
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