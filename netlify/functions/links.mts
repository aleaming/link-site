import { getConnectionString } from '@netlify/database'
import pg from 'pg'

// One pooled connection per function instance, reused across invocations.
// getConnectionString() resolves the local DB under `netlify dev` and the
// production DB when deployed — no manual env vars.
const pool = new pg.Pool({ connectionString: getConnectionString() })

// Row shape returned by the query below (snake_case, straight from Postgres).
interface LinkRow {
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
  category_name: string | null
}

/**
 * GET /api/links — public list of approved links for the homepage grid.
 *
 * Returns the camelCase `AppLinkItem` shape the React app consumes, so the
 * frontend only has to `fetch` and render.
 */
export default async (): Promise<Response> => {
  try {
    const { rows } = await pool.query<LinkRow>(`
      SELECT l.id, l.title, l.description, l.url, l.domain, l.icon_url,
             l.screenshot_url, l.tags, l.click_count, l.featured, l.verified,
             c.name AS category_name
      FROM links l
      LEFT JOIN categories c ON c.id = l.category_id
      WHERE l.status = 'approved'
      ORDER BY l.created_at DESC
    `)

    const links = rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description ?? '',
      url: r.url,
      domain: r.domain,
      icon: r.icon_url ?? undefined,
      screenshot: r.screenshot_url ?? undefined,
      tags: r.tags ?? [],
      clickCount: r.click_count ?? 0,
      featured: Boolean(r.featured),
      verified: Boolean(r.verified),
      category: r.category_name ?? 'Uncategorized',
    }))

    return Response.json(links, {
      headers: {
        // Cache at the edge for a minute; serve stale while revalidating.
        'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (err) {
    console.error('[api/links] failed:', err)
    return new Response('Failed to load links', { status: 500 })
  }
}

export const config = { path: '/api/links' }
