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
