import { getConnectionString } from '@netlify/database'
import pg from 'pg'
import type { Context } from '@netlify/functions'

const pool = new pg.Pool({ connectionString: getConnectionString() })

/**
 * POST /api/track/:id — record a click on a link.
 *
 * Inserts a row into `link_clicks` and bumps `links.click_count`. Click
 * tracking is best-effort: any failure is logged but still returns 204 so a
 * tracking hiccup never blocks the user navigating to the link.
 */
export default async (req: Request, context: Context): Promise<Response> => {
  const id = context.params.id

  try {
    const userAgent = req.headers.get('user-agent')
    const referrer = req.headers.get('referer')

    await pool.query(
      'INSERT INTO link_clicks (link_id, user_agent, referrer) VALUES ($1, $2, $3)',
      [id, userAgent, referrer]
    )
    await pool.query('UPDATE links SET click_count = click_count + 1 WHERE id = $1', [id])
  } catch (err) {
    console.error('[api/track] failed:', err)
  }

  return new Response(null, { status: 204 })
}

export const config = { path: '/api/track/:id' }
