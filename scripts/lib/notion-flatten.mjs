function extractPlainText(richTextArray) {
  if (!Array.isArray(richTextArray) || richTextArray.length === 0) return null
  const joined = richTextArray.map((t) => t.plain_text ?? '').join('').trim()
  return joined || null
}

/**
 * Flattens a raw Notion page object (from a data source query response)
 * into a plain object keyed by each property's own Notion name. Reads
 * generically by property `type`, so it works across databases with
 * different schemas — title/rich_text/url/select/multi_select are the
 * only property types this pipeline's databases use.
 */
export function flattenNotionPage(page) {
  const props = page.properties ?? {}
  const flat = {
    createdTime: page.created_time ?? null,
    notionPageUrl: page.url ?? null,
    notionPageId: page.id ?? null
  }

  for (const [name, value] of Object.entries(props)) {
    switch (value.type) {
      case 'title':
        flat[name] = extractPlainText(value.title)
        break
      case 'rich_text':
        flat[name] = extractPlainText(value.rich_text)
        break
      case 'url':
        flat[name] = value.url ?? null
        break
      case 'select':
        flat[name] = value.select?.name ?? null
        break
      case 'multi_select':
        flat[name] = (value.multi_select ?? []).map((o) => o.name)
        break
      default:
        break
    }
  }

  return flat
}
