import { parseBlocks, splitColumns, type Block } from '../directiveParser'
import type { TElement, TText, Descendant } from '@udecode/plate'
import {
  ELEMENT_CALLOUT,
  ELEMENT_BOX,
  ELEMENT_HERO,
  ELEMENT_COLUMNS,
  ELEMENT_COLUMN,
  ELEMENT_DIRECTIVE_RAW,
} from '../types'

// -- Inline markdown parsing -------------------------------------------------

/** Parse inline markdown into Plate text nodes with marks + inline elements */
function parseInlineMarkdown(text: string): Descendant[] {
  const nodes: Descendant[] = []

  // Regex to find images, links, and formatted text
  // Order matters: images before links (both start with [)
  const inlineRe = /!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|\*\*(.+?)\*\*|\*(.+?)\*|~~(.+?)~~|`([^`]+)`/g

  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = inlineRe.exec(text)) !== null) {
    // Add plain text before this match
    if (match.index > lastIndex) {
      const plain = text.slice(lastIndex, match.index)
      if (plain) nodes.push({ text: plain } as TText)
    }

    if (match[1] !== undefined || match[2] !== undefined) {
      // Image: ![alt](url)
      const alt = match[1] || ''
      const url = match[2] || ''
      nodes.push({
        type: 'img',
        url,
        alt,
        children: [{ text: '' }],
      } as TElement)
    } else if (match[3] !== undefined) {
      // Link: [text](url)
      const linkText = match[3]
      const url = match[4] || ''
      nodes.push({
        type: 'a',
        url,
        children: [{ text: linkText }],
      } as TElement)
    } else if (match[5] !== undefined) {
      // Bold: **text**
      nodes.push({ text: match[5], bold: true } as TText)
    } else if (match[6] !== undefined) {
      // Italic: *text*
      nodes.push({ text: match[6], italic: true } as TText)
    } else if (match[7] !== undefined) {
      // Strikethrough: ~~text~~
      nodes.push({ text: match[7], strikethrough: true } as TText)
    } else if (match[8] !== undefined) {
      // Inline code: `text`
      nodes.push({ text: match[8], code: true } as TText)
    }

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex)
    if (remaining) nodes.push({ text: remaining } as TText)
  }

  // Ensure at least one text node
  if (nodes.length === 0) nodes.push({ text: '' } as TText)

  return nodes
}

// -- Block-level markdown parsing --------------------------------------------

/** Minimal paragraph node with inline parsing */
function p(text: string): TElement {
  return { type: 'p', children: parseInlineMarkdown(text) } as TElement
}

/** Parse a heading line like "# Heading" */
function parseHeading(line: string): TElement | null {
  const m = line.match(/^(#{1,6})\s+(.*)$/)
  if (!m) return null
  const level = m[1].length
  return { type: `h${level}`, children: parseInlineMarkdown(m[2]) } as TElement
}

/** Parse a blockquote line */
function isBlockquoteLine(line: string): string | null {
  const m = line.match(/^>\s?(.*)$/)
  return m ? m[1] : null
}

/** Parse a list item line */
function parseListItem(line: string): { type: 'ul' | 'ol'; text: string } | null {
  const ul = line.match(/^[-*+]\s+(.*)$/)
  if (ul) return { type: 'ul', text: ul[1] }
  const ol = line.match(/^\d+\.\s+(.*)$/)
  if (ol) return { type: 'ol', text: ol[1] }
  return null
}

/** Parse an image-only line */
function parseImageLine(line: string): TElement | null {
  const m = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/)
  if (!m) return null
  return {
    type: 'img',
    url: m[2],
    alt: m[1],
    children: [{ text: '' }],
  } as TElement
}

/** Check for horizontal rule */
function isHorizontalRule(line: string): boolean {
  return /^(---|\*\*\*|___)(\s*)$/.test(line)
}

/** Check for code block start */
function isCodeBlockStart(line: string): string | null {
  const m = line.match(/^```(\w*)$/)
  return m ? m[1] : null
}

/** Convert standard markdown text into Plate nodes */
function markdownTextToNodes(text: string): TElement[] {
  if (!text.trim()) return [p('')]

  const lines = text.split('\n')
  const nodes: TElement[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Empty line -- skip
    if (!line.trim()) {
      i++
      continue
    }

    // Horizontal rule
    if (isHorizontalRule(line)) {
      nodes.push({ type: 'hr', children: [{ text: '' }] } as TElement)
      i++
      continue
    }

    // Heading
    const heading = parseHeading(line)
    if (heading) {
      nodes.push(heading)
      i++
      continue
    }

    // Code block
    const codeLang = isCodeBlockStart(line)
    if (codeLang !== null) {
      i++
      const codeLines: string[] = []
      while (i < lines.length && !lines[i].match(/^```\s*$/)) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      nodes.push({
        type: 'code_block',
        lang: codeLang || undefined,
        children: codeLines.map(cl => ({
          type: 'code_line',
          children: [{ text: cl }],
        })),
      } as TElement)
      continue
    }

    // Image on its own line
    const img = parseImageLine(line)
    if (img) {
      nodes.push(img)
      i++
      continue
    }

    // Blockquote -- collect consecutive lines
    const bqText = isBlockquoteLine(line)
    if (bqText !== null) {
      const bqLines: string[] = [bqText]
      i++
      while (i < lines.length) {
        const next = isBlockquoteLine(lines[i])
        if (next !== null) {
          bqLines.push(next)
          i++
        } else break
      }
      nodes.push({
        type: 'blockquote',
        children: [p(bqLines.join('\n'))],
      } as TElement)
      continue
    }

    // List -- collect consecutive list items
    const listItem = parseListItem(line)
    if (listItem) {
      const listType = listItem.type
      const items: string[] = [listItem.text]
      i++
      while (i < lines.length) {
        const next = parseListItem(lines[i])
        if (next && next.type === listType) {
          items.push(next.text)
          i++
        } else break
      }
      nodes.push({
        type: listType,
        children: items.map(itemText => ({
          type: 'li',
          children: [{
            type: 'lic',
            children: parseInlineMarkdown(itemText),
          }],
        })),
      } as TElement)
      continue
    }

    // Regular paragraph -- collect lines until empty line or block-level element
    const paraLines: string[] = [line]
    i++
    while (i < lines.length) {
      const nextLine = lines[i]
      // Stop on empty line, heading, hr, code block, image line, blockquote, list
      if (!nextLine.trim() ||
          parseHeading(nextLine) ||
          isHorizontalRule(nextLine) ||
          isCodeBlockStart(nextLine) !== null ||
          parseImageLine(nextLine) ||
          isBlockquoteLine(nextLine) !== null ||
          parseListItem(nextLine)) {
        break
      }
      paraLines.push(nextLine)
      i++
    }
    nodes.push(p(paraLines.join('\n')))
  }

  return nodes.length > 0 ? nodes : [p('')]
}

// -- Block-to-Plate conversion -----------------------------------------------

/** Convert a parsed Block into Plate element(s) */
function blockToPlateNodes(block: Block): TElement[] {
  switch (block.type) {
    case 'markdown': {
      // Check if this is a raw directive block (starts with :::)
      if (block.content.startsWith(':::')) {
        return [{
          type: ELEMENT_DIRECTIVE_RAW,
          rawMarkdown: block.content,
          children: [{ text: '' }],
        } as TElement]
      }
      return markdownTextToNodes(block.content)
    }

    case 'callout':
      return [{
        type: ELEMENT_CALLOUT,
        variant: block.variant || 'info',
        children: convertBlocksToPlateNodes(block.content),
      } as TElement]

    case 'box':
      return [{
        type: ELEMENT_BOX,
        children: convertBlocksToPlateNodes(block.content),
      } as TElement]

    case 'hero':
      return [{
        type: ELEMENT_HERO,
        children: convertBlocksToPlateNodes(block.content),
      } as TElement]

    case 'columns': {
      const cols = splitColumns(block.content)
      return [{
        type: ELEMENT_COLUMNS,
        columnCount: block.columnCount || 2,
        children: cols.map((colContent) => ({
          type: ELEMENT_COLUMN,
          children: convertBlocksToPlateNodes(colContent.trim()),
        })),
      } as TElement]
    }

    default:
      return [p(block.content)]
  }
}

/** Recursively convert inner content through parseBlocks */
function convertBlocksToPlateNodes(content: string): TElement[] {
  if (!content.trim()) return [p('')]
  const blocks = parseBlocks(content)
  const nodes = blocks.flatMap(blockToPlateNodes)
  return nodes.length > 0 ? nodes : [p('')]
}

/** Main entry point: markdown string -> Plate document value */
export function markdownToPlate(markdown: string): TElement[] {
  if (!markdown.trim()) return [p('')]
  return convertBlocksToPlateNodes(markdown)
}
