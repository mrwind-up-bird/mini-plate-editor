# Contributing Guide

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
git clone git@github.com:mrwind-up-bird/mini-plate-editor.git
cd mini-plate-editor
npm install
```

## Available Scripts

| Script | Command | Description |
|---|---|---|
| `npm run build` | `tsup` | Build CJS, ESM, and TypeScript declarations to `dist/` |
| `npm run dev` | `tsup --watch` | Watch mode — rebuild on file changes |
| `npm run typecheck` | `tsc --noEmit` | Type-check without emitting files |

## Development Workflow

1. Make changes in `src/`
2. Run `npm run dev` for live rebuilds
3. In a consuming project, use `npm link mini-plate-editor` to test locally
4. Run `npm run typecheck` before committing
5. Run `npm run build` to verify the production build

## Testing with npm link

```bash
# In this project
npm link

# In a consuming project
npm link mini-plate-editor
```

## Project Structure

```
src/
├── index.ts                  # Public API exports
├── PlateEditor.tsx           # Main editor component
├── PlateToolbar.tsx          # Formatting toolbar
├── SlashCommandMenu.tsx      # Block insertion menu
├── useEditorConfig.ts        # Editor plugin configuration
├── types.ts                  # Element type constants and interfaces
├── directiveParser.ts        # Markdown directive parser
├── serialization/
│   ├── markdownToPlate.ts    # Markdown → Plate JSON
│   └── plateToMarkdown.ts    # Plate JSON → Markdown
├── elements/                 # Plate element components
│   ├── StandardElements.tsx  # p, h1-h6, blockquote, lists, etc.
│   ├── DirectiveWrapper.tsx  # Reusable directive block wrapper
│   ├── CalloutElement.tsx    # Info/Warning/Tip/Danger callouts
│   ├── BoxElement.tsx        # Generic content box
│   ├── HeroElement.tsx       # Hero content block
│   ├── ColumnsElement.tsx    # Multi-column layout
│   ├── ColumnElement.tsx     # Single column child
│   └── DirectiveRawElement.tsx # Fallback for unknown directives
└── plugins/                  # Plate.js plugins
    ├── calloutPlugin.ts
    ├── boxPlugin.ts
    ├── heroPlugin.ts
    ├── columnsPlugin.ts
    └── directiveRawPlugin.ts
```

## Peer Dependencies

These must be installed by the consuming project:

| Package | Version |
|---|---|
| `react` | ^18 or ^19 |
| `react-dom` | ^18 or ^19 |
| `@udecode/plate` | ^48 |
| `@udecode/plate-basic-marks` | ^48 |
| `@udecode/plate-heading` | ^48 |
| `@udecode/plate-block-quote` | ^48 |
| `@udecode/plate-horizontal-rule` | ^48 |
| `@udecode/plate-list` | ^48 |
| `@udecode/plate-media` | ^48 |

## Build Output

`npm run build` produces:

| File | Format | Size |
|---|---|---|
| `dist/index.js` | CommonJS | ~45 KB |
| `dist/index.mjs` | ES Module | ~41 KB |
| `dist/index.d.ts` | TypeScript declarations | ~2.5 KB |
| `dist/index.js.map` | Source map (CJS) | ~79 KB |
| `dist/index.mjs.map` | Source map (ESM) | ~79 KB |

## Tech Stack

- **Editor**: Plate.js 48 (built on Slate.js)
- **Build**: tsup (esbuild + dts)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS classes (consumer must provide Tailwind)
