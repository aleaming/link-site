/**
 * The link shape the UI components (LinkGrid, LinkCard, App) consume.
 * Note the camelCase `clickCount` and flat `category` name — this is the shape
 * the `/api/links` Netlify Function returns, so the rest of the app doesn't
 * need to know anything about the database.
 */
export interface AppLinkItem {
  id: string
  title: string
  description: string
  url: string
  domain: string
  icon?: string
  screenshot?: string
  tags: string[]
  clickCount: number
  featured: boolean
  verified: boolean
  category: string
}

// Bundled sample data used as a fallback when the API is unreachable (e.g. the
// DB isn't provisioned yet, or a transient network/function error). Keeping it
// here means the UI always renders something instead of an empty page.
export const sampleLinks: AppLinkItem[] = [
  {
    id: '1',
    title: 'Vercel',
    description: 'Deploy web projects with zero configuration and global CDN',
    url: 'https://vercel.com',
    domain: 'vercel.com',
    category: 'Deployment',
    tags: ['hosting', 'deployment', 'cdn', 'serverless'],
    featured: true,
    verified: true,
    clickCount: 15420,
    icon: 'https://vercel.com/favicon.ico'
  },
  {
    id: '2',
    title: 'Supabase',
    description: 'Open source Firebase alternative with PostgreSQL database',
    url: 'https://supabase.io',
    domain: 'supabase.io',
    category: 'Database',
    tags: ['database', 'postgresql', 'backend', 'auth'],
    featured: true,
    verified: true,
    clickCount: 12350,
    icon: 'https://supabase.com/favicon.ico'
  },
  {
    id: '3',
    title: 'Tailwind CSS',
    description: 'Utility-first CSS framework for rapid UI development',
    url: 'https://tailwindcss.com',
    domain: 'tailwindcss.com',
    category: 'Styling',
    tags: ['css', 'framework', 'utility', 'design'],
    featured: false,
    verified: true,
    clickCount: 8920,
    icon: 'https://tailwindcss.com/favicon.ico'
  }
]

/**
 * Returns approved links for display. Fetches from the `/api/links` Netlify
 * Function (which reads Neon); on any error, falls back to bundled sample data
 * so the UI still renders. Used as the React Query `queryFn` in App.tsx.
 */
export async function fetchLinks(): Promise<AppLinkItem[]> {
  try {
    const res = await fetch('/api/links')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as AppLinkItem[]
  } catch (err) {
    console.error('[api] failed to load links, using sample data:', err)
    return sampleLinks
  }
}

/**
 * Records a click on a link via the `/api/track/:id` Function. Fire-and-forget:
 * we never await or surface errors, so click tracking can't delay or block the
 * user navigating to the link.
 */
export function trackClick(id: string): void {
  fetch(`/api/track/${encodeURIComponent(id)}`, {
    method: 'POST',
    keepalive: true
  }).catch(() => {})
}

/**
 * A category as the sidebar consumes it. `icon` is the lucide icon *name* stored
 * in the DB (e.g. 'Code', 'Palette'); the sidebar maps it to a component.
 * `count` is the live number of approved links in that category.
 */
export interface AppCategory {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string | null
  featured: boolean
  count: number
}

// Fallback categories (counts unknown without the DB, so 0) used when the API
// is unreachable — keeps the sidebar populated instead of empty.
export const sampleCategories: AppCategory[] = [
  { id: 's1', name: 'Development', slug: 'development', icon: 'Code', color: '#3b82f6', featured: true, count: 0 },
  { id: 's2', name: 'Design', slug: 'design', icon: 'Palette', color: '#ec4899', featured: true, count: 0 },
  { id: 's3', name: 'AI & ML', slug: 'ai-ml', icon: 'Zap', color: '#10b981', featured: true, count: 0 },
  { id: 's4', name: 'Analytics', slug: 'analytics', icon: 'BarChart', color: '#f59e0b', featured: false, count: 0 },
  { id: 's5', name: 'Marketing', slug: 'marketing', icon: 'TrendingUp', color: '#ef4444', featured: false, count: 0 },
  { id: 's6', name: 'Productivity', slug: 'productivity', icon: 'CheckSquare', color: '#8b5cf6', featured: false, count: 0 },
  { id: 's7', name: 'Security', slug: 'security', icon: 'Shield', color: '#06b6d4', featured: false, count: 0 },
  { id: 's8', name: 'Database', slug: 'database', icon: 'Database', color: '#84cc16', featured: false, count: 0 },
  { id: 's9', name: 'API', slug: 'api', icon: 'Globe', color: '#f97316', featured: false, count: 0 },
  { id: 's10', name: 'Mobile', slug: 'mobile', icon: 'Smartphone', color: '#6366f1', featured: false, count: 0 }
]

/**
 * Returns categories with their live approved-link counts from `/api/categories`;
 * falls back to the bundled list on error. Used as a React Query `queryFn`.
 */
export async function fetchCategories(): Promise<AppCategory[]> {
  try {
    const res = await fetch('/api/categories')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as AppCategory[]
  } catch (err) {
    console.error('[api] failed to load categories, using sample data:', err)
    return sampleCategories
  }
}
