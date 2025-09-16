import { useMemo } from 'react'
import Fuse from 'fuse.js'
import type { LinkItem, SearchFilters } from '../types'

const fuseOptions = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'description', weight: 0.3 },
    { name: 'tags', weight: 0.2 },
    { name: 'category', weight: 0.1 }
  ],
  threshold: 0.3,
  includeScore: true,
  minMatchCharLength: 2
}

export function useSearch(links: LinkItem[], filters: SearchFilters) {
  const fuse = useMemo(() => new Fuse(links, fuseOptions), [links])
  
  const filteredLinks = useMemo(() => {
    let results = links
    
    // Text search
    if (filters.query.trim()) {
      const searchResults = fuse.search(filters.query)
      results = searchResults.map(result => result.item)
    }
    
    // Category filter
    if (filters.categories.length > 0) {
      results = results.filter(link => 
        filters.categories.includes(link.category)
      )
    }
    
    // Tags filter
    if (filters.tags.length > 0) {
      results = results.filter(link =>
        filters.tags.some(tag => link.tags.includes(tag))
      )
    }
    
    // Featured filter
    if (filters.featured) {
      results = results.filter(link => link.featured)
    }
    
    // Verified filter
    if (filters.verified) {
      results = results.filter(link => link.verified)
    }
    
    // Sort results
    switch (filters.sortBy) {
      case 'popular':
        results.sort((a, b) => b.clickCount - a.clickCount)
        break
      case 'rating':
        results.sort((a, b) => b.rating - a.rating)
        break
      case 'alphabetical':
        results.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'newest':
      default:
        results.sort((a, b) => 
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        )
        break
    }
    
    return results
  }, [links, filters, fuse])
  
  return filteredLinks
}