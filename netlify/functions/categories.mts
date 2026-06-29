import { getConnectionString } from '@netlify/database'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: getConnectionString() })

interface CategoryRow {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string | null
  featured: boolean | null
  count: string // COUNT() comes back as a string from pg
}

/**
 * GET /api/categories — all categories with their approved-link counts, for the
 * sidebar. Counts are computed live so they always match what's in the database.
 */
export default async (): Promise<Response> => {
  try {
    const { rows } = await pool.query<CategoryRow>(`
      SELECT c.id, c.name, c.slug, c.icon, c.color, c.featured,
             COUNT(l.id) FILTER (WHERE l.status = 'approved') AS count
      FROM categories c
      LEFT JOIN links l ON l.category_id = c.id
      GROUP BY c.id
      ORDER BY c.order_index ASC
    `)

    const categories = rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      icon: r.icon ?? null,
      color: r.color ?? null,
      featured: Boolean(r.featured),
      count: Number(r.count) || 0,
    }))

    return Response.json(categories, {
      headers: {
        'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (err) {
    console.error('[api/categories] failed:', err)
    return new Response('Failed to load categories', { status: 500 })
  }
}

export const config = { path: '/api/categories' }
