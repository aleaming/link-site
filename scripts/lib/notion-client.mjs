const NOTION_API_BASE = 'https://api.notion.com/v1'
const NOTION_VERSION = '2025-09-03'

export class NotionApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'NotionApiError'
    this.status = status
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Queries one page of a Notion data source, retrying on 429 using the
 * server's Retry-After header (falling back to exponential backoff).
 */
export async function queryDataSourcePage(dataSourceId, opts = {}) {
  const { token, filter, startCursor, fetchImpl = fetch, maxRetries = 3 } = opts
  if (!token) throw new Error('Missing Notion API token (pass opts.token)')

  const body = { page_size: 100 }
  if (filter) body.filter = filter
  if (startCursor) body.start_cursor = startCursor

  for (let attempt = 0; ; attempt++) {
    const res = await fetchImpl(`${NOTION_API_BASE}/data_sources/${dataSourceId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (res.status === 429 && attempt < maxRetries) {
      const retryAfter = Number(res.headers.get('retry-after')) || 2 ** attempt * 5
      await sleep(retryAfter * 1000)
      continue
    }

    if (!res.ok) {
      const text = await res.text()
      throw new NotionApiError(`Notion API error ${res.status}: ${text}`, res.status)
    }

    return res.json()
  }
}

/**
 * Queries every page of a Notion data source, following has_more/
 * next_cursor until exhausted. Returns the full flat array of raw
 * Notion page objects (not yet flattened to our own shape).
 */
export async function queryDataSourceAll(dataSourceId, opts = {}) {
  const results = []
  let cursor
  for (;;) {
    const page = await queryDataSourcePage(dataSourceId, { ...opts, startCursor: cursor })
    results.push(...page.results)
    if (!page.has_more) return results
    cursor = page.next_cursor
  }
}
