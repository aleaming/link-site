#!/usr/bin/env node
/**
 * upsert-links.mjs — batch add/update links in the Supabase `links` table.
 *
 * This is the "writer" half of the link-update routine (see
 * docs/link-update-routine.md). You (or Claude, on your behalf) prepare a JSON
 * array of links, then this script normalizes and upserts them — so re-running
 * with the same URL updates the existing row instead of creating a duplicate.
 *
 * Usage:
 *   node scripts/upsert-links.mjs [path-to-json]      # default: data/links-inbox.json
 *   node scripts/upsert-links.mjs --stdin             # read JSON from stdin
 *   node scripts/upsert-links.mjs --dry-run [path]    # validate only, no writes
 *
 * Required environment variables (a .env file in the repo root is loaded if present):
 *   SUPABASE_URL                 e.g. https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY    service_role key (server-side only — never commit it)
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
import { createClient } from '@supabase/supabase-js'

const VALID_STATUS = new Set(['pending', 'approved', 'rejected'])

function loadDotEnv() {
  const envPath = resolve(process.cwd(), '.env')
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/)
    if (!m || line.trim().startsWith('#')) continue
    const key = m[1]
    let val = m[2].trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = val
  }
}

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
  loadDotEnv()

  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const useStdin = args.includes('--stdin')
  const fileArg = args.find((a) => !a.startsWith('--'))

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!dryRun && (!url || !serviceKey)) {
    fail(
      'Missing SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY.\n' +
        '  Add them to a .env file in the repo root (see .env.example), then re-run.\n' +
        '  Tip: use --dry-run to validate your JSON without credentials.'
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

  if (dryRun && (!url || !serviceKey)) {
    console.log(`✓ Dry run: ${cleaned.length} link(s) are valid. (No credentials set, so no category check or write.)`)
    return
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

  // --- Resolve categories (slug OR name → id) ----------------------------
  const { data: categories, error: catErr } = await supabase
    .from('categories')
    .select('id, name, slug')
  if (catErr) fail(`Could not load categories: ${catErr.message}`)

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

  // --- Upsert (conflict on unique url => update existing) -----------------
  const { data, error } = await supabase
    .from('links')
    .upsert(rows, { onConflict: 'url' })
    .select('title, url, status')
  if (error) fail(`Upsert failed: ${error.message}`)

  console.log(`\n✓ Upserted ${data.length} link(s):`)
  for (const r of data) console.log(`  • ${r.title} → ${r.url} [${r.status}]`)
  console.log('\nDone. Approved links will appear on the site after its next data refresh.\n')
}

main().catch((e) => fail(e?.stack || String(e)))
