#!/usr/bin/env node
/**
 * upsert-links.mjs — batch add/update links in the Netlify Database `links` table.
 *
 * This is the "writer" half of the link-update routine (see
 * docs/link-update-routine.md). You (or Claude, on your behalf) prepare a JSON
 * array of links, then this script normalizes and upserts them — so re-running
 * with the same URL updates the existing row instead of creating a duplicate.
 *
 * Connection: uses `getConnectionString()` from @netlify/database, which resolves
 * the local dev database when run under the Netlify dev environment. Run it as:
 *
 *   netlify dev:exec npm run links:add          # write to the local dev DB
 *   netlify dev:exec npm run links:add:dry      # validate only
 *
 * (A bare `npm run links:add` works too if a Netlify dev DB / context is active.)
 *
 * Usage:
 *   node scripts/upsert-links.mjs [path-to-json]      # default: data/links-inbox.json
 *   node scripts/upsert-links.mjs --stdin             # read JSON from stdin
 *   node scripts/upsert-links.mjs --dry-run [path]    # validate only, no writes
 *
 * Input item shape (only `title` and `url` are required):
 *   {
 *     "title": "Vercel",
 *     "url": "https://vercel.com",
 *     "description": "Deploy web projects with zero config",
 *     "category": "development",        // category slug OR name (see list below)
 *     "tags": ["hosting", "cdn"],       // array, or comma-separated string
 *     "featured": false,
 *     "verified": true,
 *     "status": "approved",             // pending | approved | rejected (default: approved)
 *     "icon_url": "https://vercel.com/favicon.ico",
 *     "screenshot_url": null
 *   }
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { getConnectionString } from '@netlify/database'
import pg from 'pg'

const VALID_STATUS = new Set(['pending', 'approved', 'rejected'])

function fail(msg) {
  console.error(`\n✖ ${msg}\n`)
  process.exit(1)
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean)
  if (typeof tags === 'string') return tags.split(',').map((t) => t.trim()).filter(Boolean)
  return []
}

async function readStdin() {
  const chunks = []
  for await (const chunk of process.stdin) chunks.push(chunk)
  return Buffer.concat(chunks).toString('utf8')
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const useStdin = args.includes('--stdin')
  const fileArg = args.find((a) => !a.startsWith('--'))

  // Resolve the DB connection via Netlify. May be unavailable for a pure
  // --dry-run outside a Netlify dev context, which is fine.
  let conn = null
  try {
    conn = getConnectionString()
  } catch {
    /* no connection available */
  }
  if (!dryRun && !conn) {
    fail(
      'No database connection available.\n' +
        '  Run this through the Netlify dev environment so the local database is up:\n' +
        '    netlify dev:exec npm run links:add\n' +
        '  Tip: use --dry-run to validate your JSON without a connection.'
    )
  }

  // --- Load + parse input ------------------------------------------------
  let raw
  if (useStdin) {
    raw = await readStdin()
  } else {
    const path = resolve(process.cwd(), fileArg || 'data/links-inbox.json')
    if (!existsSync(path)) {
      fail(`Input file not found: ${path}\n  Pass a path, use --stdin, or create data/links-inbox.json.`)
    }
    raw = readFileSync(path, 'utf8')
  }

  let items
  try {
    items = JSON.parse(raw)
  } catch (e) {
    fail(`Input is not valid JSON: ${e.message}`)
  }
  if (!Array.isArray(items)) fail('Input JSON must be an array of link objects.')
  if (items.length === 0) fail('Input contains no links.')

  // --- Validate + normalize ----------------------------------------------
  const errors = []
  const cleaned = items.map((item, i) => {
    const at = `links[${i}]`
    if (!item || typeof item !== 'object') {
      errors.push(`${at}: not an object`)
      return null
    }
    if (!item.title || typeof item.title !== 'string') errors.push(`${at}: missing "title"`)
    if (!item.url || typeof item.url !== 'string') errors.push(`${at}: missing "url"`)
    else if (!/^https?:\/\//i.test(item.url)) errors.push(`${at}: url must start with http:// or https://`)

    const status = item.status ?? 'approved'
    if (!VALID_STATUS.has(status)) errors.push(`${at}: invalid status "${status}"`)

    return {
      title: item.title?.trim(),
      url: item.url?.trim(),
      description: item.description?.trim() || null,
      categoryKey: (item.category ?? '').toString().trim().toLowerCase() || null,
      tags: normalizeTags(item.tags),
      featured: Boolean(item.featured),
      verified: Boolean(item.verified),
      status,
      icon_url: item.icon_url?.trim() || null,
      screenshot_url: item.screenshot_url?.trim() || null
    }
  })

  if (errors.length) fail(`Found ${errors.length} problem(s):\n  - ${errors.join('\n  - ')}`)

  if (dryRun && !conn) {
    console.log(`✓ Dry run: ${cleaned.length} link(s) are valid. (No connection, so no category check or write.)`)
    return
  }

  const pool = new pg.Pool({ connectionString: conn })

  try {
    // --- Resolve categories (slug OR name → id) --------------------------
    const { rows: categories } = await pool.query('SELECT id, name, slug FROM categories')
    const catByKey = new Map()
    for (const c of categories) {
      catByKey.set(c.slug.toLowerCase(), c.id)
      catByKey.set(c.name.toLowerCase(), c.id)
    }

    const rows = cleaned.map((c) => {
      let category_id = null
      if (c.categoryKey) {
        category_id = catByKey.get(c.categoryKey) ?? null
        if (!category_id) {
          console.warn(`⚠ Unknown category "${c.categoryKey}" for "${c.title}" — leaving uncategorized.`)
        }
      }
      return {
        title: c.title,
        url: c.url,
        description: c.description,
        category_id,
        tags: c.tags,
        featured: c.featured,
        verified: c.verified,
        status: c.status,
        icon_url: c.icon_url,
        screenshot_url: c.screenshot_url
        // NOTE: `domain` is a generated column in Postgres — do not send it.
      }
    })

    console.log('\nAvailable category slugs:', categories.map((c) => c.slug).join(', '))

    if (dryRun) {
      console.log(`\n✓ Dry run complete: ${rows.length} link(s) ready to upsert. No data written.`)
      for (const r of rows) console.log(`  • ${r.title} → ${r.url} [${r.status}]`)
      return
    }

    // --- Upsert (conflict on unique url => update existing) ---------------
    const upserted = []
    for (const r of rows) {
      const { rows: out } = await pool.query(
        `INSERT INTO links
           (title, url, description, category_id, tags, featured, verified, status, icon_url, screenshot_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (url) DO UPDATE SET
           title          = EXCLUDED.title,
           description    = EXCLUDED.description,
           category_id    = EXCLUDED.category_id,
           tags           = EXCLUDED.tags,
           featured       = EXCLUDED.featured,
           verified       = EXCLUDED.verified,
           status         = EXCLUDED.status,
           icon_url       = EXCLUDED.icon_url,
           screenshot_url = EXCLUDED.screenshot_url
         RETURNING title, url, status`,
        [
          r.title,
          r.url,
          r.description,
          r.category_id,
          r.tags,
          r.featured,
          r.verified,
          r.status,
          r.icon_url,
          r.screenshot_url
        ]
      )
      upserted.push(out[0])
    }

    console.log(`\n✓ Upserted ${upserted.length} link(s):`)
    for (const r of upserted) console.log(`  • ${r.title} → ${r.url} [${r.status}]`)
    console.log('\nDone. Approved links will appear on the site after its next data refresh.\n')
  } catch (e) {
    fail(`Upsert failed: ${e.message}`)
  } finally {
    await pool.end()
  }
}

main().catch((e) => fail(e?.stack || String(e)))
