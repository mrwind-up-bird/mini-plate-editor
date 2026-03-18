/**
 * Directive parser -- parses markdown with :::directive fenced blocks
 * into structured Block objects.
 */

export const DIRECTIVE_RE = /^:::(hero|info|warning|tip|danger|columns-2|columns-3|box)\s*$/
export const CLOSE_RE = /^:::\s*$/
export const CALLOUT_TYPES = new Set(['info', 'warning', 'tip', 'danger'])

// Matches any :::something line (used for fallback / unknown directives)
const ANY_DIRECTIVE_RE = /^:::([a-zA-Z][a-zA-Z0-9_-]*(?:-[a-zA-Z0-9_-]+)*)\s*$/

export interface Block {
  type: 'markdown' | 'hero' | 'callout' | 'columns' | 'box'
  content: string
  variant?: string
  columnCount?: 2 | 3
}

export function parseBlocks(raw: string): Block[] {
  const lines = raw.split('\n')
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const match = line.match(DIRECTIVE_RE)
    const anyMatch = !match ? line.match(ANY_DIRECTIVE_RE) : null

    if (match) {
      const directive = match[1]
      i++

      // Collect inner lines respecting nested ::: depth
      const innerLines: string[] = []
      let depth = 1
      while (i < lines.length && depth > 0) {
        if (lines[i].match(ANY_DIRECTIVE_RE)) {
          depth++
          innerLines.push(lines[i])
        } else if (lines[i].match(CLOSE_RE)) {
          depth--
          if (depth > 0) innerLines.push(lines[i])
        } else {
          innerLines.push(lines[i])
        }
        i++
      }

      const innerContent = innerLines.join('\n')

      if (directive === 'hero') {
        blocks.push({ type: 'hero', content: innerContent })
      } else if (CALLOUT_TYPES.has(directive)) {
        blocks.push({ type: 'callout', content: innerContent, variant: directive })
      } else if (directive.startsWith('columns-')) {
        const count = directive === 'columns-3' ? 3 : 2
        blocks.push({ type: 'columns', content: innerContent, columnCount: count })
      } else if (directive === 'box') {
        blocks.push({ type: 'box', content: innerContent })
      }
    } else if (anyMatch) {
      // Unknown directive -- store raw text as markdown block
      const directiveName = anyMatch[1]
      i++

      const innerLines: string[] = []
      let depth = 1
      while (i < lines.length && depth > 0) {
        if (lines[i].match(ANY_DIRECTIVE_RE)) {
          depth++
          innerLines.push(lines[i])
        } else if (lines[i].match(CLOSE_RE)) {
          depth--
          if (depth > 0) innerLines.push(lines[i])
        } else {
          innerLines.push(lines[i])
        }
        i++
      }

      const rawBlock = `:::${directiveName}\n${innerLines.join('\n')}\n:::`
      blocks.push({ type: 'markdown', content: rawBlock })
    } else {
      const mdLines: string[] = [line]
      i++
      while (i < lines.length && !lines[i].match(ANY_DIRECTIVE_RE)) {
        mdLines.push(lines[i])
        i++
      }
      const text = mdLines.join('\n')
      if (text.trim()) {
        blocks.push({ type: 'markdown', content: text })
      }
    }
  }

  return blocks
}

/** Split column content on `---` that is not inside a nested ::: block */
export function splitColumns(raw: string): string[] {
  const lines = raw.split('\n')
  const columns: string[][] = [[]]
  let depth = 0

  for (const line of lines) {
    if (line.match(ANY_DIRECTIVE_RE)) {
      depth++
      columns[columns.length - 1].push(line)
    } else if (line.match(CLOSE_RE)) {
      depth = Math.max(0, depth - 1)
      columns[columns.length - 1].push(line)
    } else if (depth === 0 && line.trim() === '---') {
      columns.push([])
    } else {
      columns[columns.length - 1].push(line)
    }
  }

  return columns.map(col => col.join('\n'))
}
