#!/usr/bin/env node
/**
 * sync-approved-from-notion.mjs — reads rows marked Decision=Approved
 * from the "Directory Submissions" Notion database and writes them to
 * data/links-inbox.json in the shape scripts/upsert-links.mjs expects.
 *
 * This script does NOT call upsert-links.mjs itself — run the existing
 * routine afterward:
 *   npm run links:add:dry
 *   npm run links:add
 *
 * Requires NOTION_API_TOKEN and NOTION_SUBMISSIONS_DATA_SOURCE_ID in the
 * environment (see .env.example).
 */
import { writeFileSync } from 'node:fs'
import { queryDataSourceAll } from './lib/notion-client.mjs'
import { flattenNotionPage } from './lib/notion-flatten.mjs'

export const APPROVED_FILTER = { property: 'Decision', select: { equals: 'Approved' } }

export function toLinksInboxItem(flatRow) {
  return {
    title: flatRow['Title'],
    url: flatRow['URL'],
    description: flatRow['Description'],
    category: flatRow['Category'],
    tags: flatRow['Tags'] ?? [],
    status: 'approved'
  }
}

export async function fetchApprovedItems({ dataSourceId, token, queryFn = queryDataSourceAll }) {
  const pages = await queryFn(dataSourceId, { token, filter: APPROVED_FILTER })
  return pages.map(flattenNotionPage).map(toLinksInboxItem)
}

async function main() {
  const token = process.env.NOTION_API_TOKEN
  const dataSourceId = process.env.NOTION_SUBMISSIONS_DATA_SOURCE_ID
  if (!token) {
    console.error('\n✖ Missing NOTION_API_TOKEN. See .env.example.\n')
    process.exit(1)
  }
  if (!dataSourceId) {
    console.error('\n✖ Missing NOTION_SUBMISSIONS_DATA_SOURCE_ID. See .env.example.\n')
    process.exit(1)
  }

  const items = await fetchApprovedItems({ dataSourceId, token })
  writeFileSync('data/links-inbox.json', JSON.stringify(items, null, 2))
  console.log(`Wrote ${items.length} approved item(s) to data/links-inbox.json`)
  console.log('\nNext: npm run links:add:dry   (then npm run links:add if it looks right)')
}

const isMain = import.meta.url === `file://${process.argv[1]}`
if (isMain) {
  main().catch((e) => {
    console.error(e?.stack || String(e))
    process.exit(1)
  })
}
