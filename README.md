# mini-plate-editor

A Plate.js WYSIWYG markdown editor with directive-based custom blocks (callouts, boxes, columns, hero sections). Converts between markdown with `:::directive` syntax and Plate.js editor state.

## Install

```bash
npm install mini-plate-editor
```

### Peer Dependencies

You must also install:

```bash
npm install react react-dom @udecode/plate @udecode/plate-basic-marks @udecode/plate-heading @udecode/plate-block-quote @udecode/plate-horizontal-rule @udecode/plate-list @udecode/plate-media
```

## Usage

```tsx
import { PlateEditor, markdownToPlate, plateToMarkdown } from 'mini-plate-editor'

const initialValue = markdownToPlate('# Hello\n\nSome **bold** text')

<PlateEditor
  initialValue={initialValue}
  onChange={(value) => {
    const md = plateToMarkdown(value)
    console.log(md)
  }}
/>
```

## Supported Blocks

### Standard Markdown
- Paragraphs, headings (h1-h6), blockquotes, horizontal rules
- Bold, italic, strikethrough, inline code
- Ordered and unordered lists
- Images, links
- Code blocks

### Directive Blocks

Custom blocks use `:::directive` / `:::` fenced syntax in markdown:

- **Callouts**: `:::info`, `:::warning`, `:::tip`, `:::danger`
- **Box**: `:::box` -- a generic content container
- **Hero**: `:::hero` -- a hero content block
- **Columns**: `:::columns-2`, `:::columns-3` -- multi-column layout (columns separated by `---`)
- **DirectiveRaw**: Fallback for unknown directives, preserved as raw markdown

## Exports

- `PlateEditor` -- the editor component
- `markdownToPlate` -- convert markdown string to Plate editor value
- `plateToMarkdown` -- convert Plate editor value to markdown string
- `parseBlocks`, `splitColumns` -- directive parser utilities
- `DirectiveWrapper` -- reusable wrapper component for custom directive elements
- Element type constants: `ELEMENT_CALLOUT`, `ELEMENT_BOX`, `ELEMENT_HERO`, `ELEMENT_COLUMNS`, `ELEMENT_COLUMN`, `ELEMENT_DIRECTIVE_RAW`
- TypeScript interfaces for all element types
