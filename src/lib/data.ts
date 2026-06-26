import { db, hasSupabaseConfig } from './supabase'

/**
 * The link shape the UI components (LinkGrid, LinkCard, App) consume.
 * Note the camelCase `clickCount` and flat `category` name — this differs
 * from the database row shape (`click_count`, `category_id`) on purpose,
 * so the rest of the app doesn't need to know about Supabase.
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

// Bundled sample data used until Supabase env vars are configured. Keeping it
// here (rather than inline in App.tsx) means the app has a single source of
// truth for links whether or not the backend is connected.
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

// Row returned by db.getLinks() — links joined with their category.
type LinkRowWithCategory = {
  id: string
  title: string
  description: string | null
  url: string
  domain: string
  icon_url: string | null
  screenshot_url: string | null
  tags: string[] | null
  click_count: number | null
  featured: boolean | null
  verified: boolean | null
  categories: { name: string | null } | { name: string | null }[] | null
}

function categoryName(categories: LinkRowWithCategory['categories']): string {
  if (!categories) return 'Uncategorized'
  const cat = Array.isArray(categories) ? categories[0] : categories
  return cat?.name ?? 'Uncategorized'
}

function toAppLink(row: LinkRowWithCategory): AppLinkItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    url: row.url,
    domain: row.domain,
    icon: row.icon_url ?? undefined,
    screenshot: row.screenshot_url ?? undefined,
    tags: row.tags ?? [],
    clickCount: row.click_count ?? 0,
    featured: Boolean(row.featured),
    verified: Boolean(row.verified),
    category: categoryName(row.categories)
  }
}

/**
 * Returns approved links for display. Reads from Supabase when configured,
 * otherwise returns bundled sample data so the UI still renders. Used as the
 * React Query `queryFn` in App.tsx.
 */
export async function fetchLinks(): Promise<AppLinkItem[]> {
  if (!hasSupabaseConfig) return sampleLinks

  const { data, error } = await db.getLinks({ status: 'approved' })
  if (error) {
    console.error('[supabase] failed to load links, using sample data:', error.message)
    return sampleLinks
  }

  return (data as LinkRowWithCategory[]).map(toAppLink)
}
