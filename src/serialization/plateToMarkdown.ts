import type { TElement, TText } from '@udecode/plate'
import {
  ELEMENT_CALLOUT,
  ELEMENT_BOX,
  ELEMENT_HERO,
  ELEMENT_COLUMNS,
  ELEMENT_COLUMN,
  ELEMENT_DIRECTIVE_RAW,
} from '../types'

// -- Helpers -----------------------------------------------------------------

function isText(node: unknown): node is TText {
  return typeof node === 'object' && node !== null && 'text' in node
}

function isElement(node: unknown): node is TElement {
  return typeof node === 'object' && node !== null && 'type' in node && 'children' in node
}

/** Serialize inline marks on a text node */
function serializeTextNode(node: TText): string {
  let text = node.text
  if (!text) return ''
  if ((node as any).bold) text = `**${text}**`
  if ((node as any).italic) text = `*${text}*`
  if ((node as any).strikethrough) text = `~~${text}~~`
  if ((node as any).code) text = `\`${text}\``
  return text
}

/** Serialize children (text nodes + inline elements) to inline markdown */
function serializeInline(children: (TElement | TText)[]): string {
  return children.map((child) => {
    if (isText(child)) return serializeTextNode(child)
    if (isElement(child)) {
      if (child.type === 'a') {
        const url = (child as any).url || ''
        const text = serializeInline(child.children as (TElement | TText)[])
        return `[${text}](${url})`
      }
      if (child.type === 'img') {
        const url = (child as any).url || ''
        const alt = (child as any).alt || ''
        return `![${alt}](${url})`
      }
      // Fallback: just serialize child text
      return serializeInline(child.children as (TElement | TText)[])
    }
    return ''
  }).join('')
}

// -- Node serializers --------------------------------------------------------

function serializeNode(node: TElement | TText): string {
  if (isText(node)) return serializeTextNode(node)
  if (!isElement(node)) return ''

  const el = node as TElement

  switch (el.type) {
    case 'p':
      return serializeInline(el.children as (TElement | TText)[])

    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6': {
      const level = parseInt(el.type.slice(1), 10)
      const hashes = '#'.repeat(level)
      return `${hashes} ${serializeInline(el.children as (TElement | TText)[])}`
    }

    case 'blockquote': {
      const inner = serializeChildren(el.children as TElement[])
      return inner.split('\n').map(line => `> ${line}`).join('\n')
    }

    case 'code_block': {
      const lang = (el as any).lang || ''
      const code = (el.children as TElement[])
        .map(line => serializeInline(line.children as (TElement | TText)[]))
        .join('\n')
      return `\`\`\`${lang}\n${code}\n\`\`\``
    }

    case 'hr':
      return '---'

    case 'ul':
    case 'ol': {
      return (el.children as TElement[]).map((li, i) => {
        const prefix = el.type === 'ol' ? `${i + 1}. ` : '- '
        const content = serializeChildren(li.children as TElement[])
        return `${prefix}${content}`
      }).join('\n')
    }

    case 'li':
      return serializeChildren(el.children as TElement[])

    case 'img': {
      const url = (el as any).url || ''
      const alt = (el as any).alt || ''
      return `![${alt}](${url})`
    }

    case 'table': {
      const rows = el.children as TElement[]
      if (rows.length === 0) return ''
      const headerRow = rows[0]
      const headerCells = (headerRow.children as TElement[]).map(cell =>
        serializeInline(((cell.children as TElement[])[0]?.children || []) as (TElement | TText)[])
      )
      const separator = headerCells.map(() => '-------').join(' | ')
      const header = headerCells.join(' | ')
      const bodyRows = rows.slice(1).map(row => {
        return (row.children as TElement[]).map(cell =>
          serializeInline(((cell.children as TElement[])[0]?.children || []) as (TElement | TText)[])
        ).join(' | ')
      })
      return [`| ${header} |`, `| ${separator} |`, ...bodyRows.map(r => `| ${r} |`)].join('\n')
    }

    // -- Custom directive elements -------------------------------------------

    case ELEMENT_CALLOUT: {
      const variant = (el as any).variant || 'info'
      const inner = serializeChildren(el.children as TElement[])
      return `:::${variant}\n${inner}\n:::`
    }

    case ELEMENT_BOX: {
      const inner = serializeChildren(el.children as TElement[])
      return `:::box\n${inner}\n:::`
    }

    case ELEMENT_HERO: {
      const inner = serializeChildren(el.children as TElement[])
      return `:::hero\n${inner}\n:::`
    }

    case ELEMENT_COLUMNS: {
      const count = (el as any).columnCount || 2
      const cols = (el.children as TElement[])
        .filter(c => c.type === ELEMENT_COLUMN)
        .map(col => serializeChildren(col.children as TElement[]))
      return `:::columns-${count}\n${cols.join('\n---\n')}\n:::`
    }

    case ELEMENT_DIRECTIVE_RAW: {
      return (el as any).rawMarkdown || ''
    }

    default:
      // Unknown element -- try to serialize children
      return serializeChildren(el.children as TElement[])
  }
}

/** Serialize an array of block elements, joining with double newlines */
function serializeChildren(nodes: TElement[]): string {
  return nodes.map(n => serializeNode(n)).join('\n\n')
}

/** Main entry point: Plate document value -> markdown string */
export function plateToMarkdown(value: TElement[]): string {
  if (!value || value.length === 0) return ''
  return serializeChildren(value).trim()
}
