#!/usr/bin/env node
/**
 * pull-notion-links.mjs — pulls raw rows from configured Notion hubs and
 * writes one flattened JSON dump per hub to data/notion-raw/<hub>.json.
 *
 * Usage:
 *   node scripts/pull-notion-links.mjs                       # pull all configured hubs
 *   node scripts/pull-notion-links.mjs --hub reddit-links    # pull one hub
 *   node scripts/pull-notion-links.mjs --since 2026-07-01T00:00:00.000Z
 *
 * Requires NOTION_API_TOKEN in the environment (see .env.example and
 * docs/link-update-routine.md for one-time setup).
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { queryDataSourceAll } from './lib/notion-client.mjs'
import { flattenNotionPage } from './lib/notion-flatten.mjs'

export const HUBS = [
  { name: 'reddit-links', dataSourceId: '2e3ec682-ad09-805e-8774-000b59905e0a' },
  { name: 'claude-skills-and-agents', dataSourceId: '2daec682-ad09-8070-8c0f-000b2c623f4e' }
]

function parseArgs(argv) {
  const hub = argv.find((a, i) => argv[i - 1] === '--hub')
  const since = argv.find((a, i) => argv[i - 1] === '--since')
  return { hub, since }
}

export async function pullHub(hub, { token, since, queryFn = queryDataSourceAll } = {}) {
  const filter = since
    ? { timestamp: 'created_time', created_time: { after: since } }
    : undefined
  const pages = await queryFn(hub.dataSourceId, { token, filter })
  return pages.map(flattenNotionPage)
}

async function main() {
  const { hub: hubFilter, since } = parseArgs(process.argv.slice(2))
  const token = process.env.NOTION_API_TOKEN
  if (!token) {
    console.error('\n✖ Missing NOTION_API_TOKEN. See .env.example.\n')
    process.exit(1)
  }

  const hubs = hubFilter ? HUBS.filter((h) => h.name === hubFilter) : HUBS
  if (hubs.length === 0) {
    console.error(`\n✖ Unknown hub "${hubFilter}". Known hubs: ${HUBS.map((h) => h.name).join(', ')}\n`)
    process.exit(1)
  }

  mkdirSync('data/notion-raw', { recursive: true })

  for (const hub of hubs) {
    console.log(`Pulling "${hub.name}"...`)
    const rows = await pullHub(hub, { token, since })
    const path = `data/notion-raw/${hub.name}.json`
    writeFileSync(path, JSON.stringify(rows, null, 2))
    console.log(`  wrote ${rows.length} row(s) to ${path}`)
  }
}

const isMain = import.meta.url === `file://${process.argv[1]}`
if (isMain) {
  main().catch((e) => {
    console.error(e?.stack || String(e))
    process.exit(1)
  })
}
