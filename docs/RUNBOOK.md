# Runbook

## Publishing

### npm (when ready)

```bash
npm run build
npm version patch    # or minor/major
npm publish
```

### GitHub Package (current)

Install from GitHub directly:

```bash
npm install mrwind-up-bird/mini-plate-editor
```

Or as a git dependency in `package.json`:

```json
"mini-plate-editor": "github:mrwind-up-bird/mini-plate-editor"
```

### Local Development (npm link)

```bash
# In mini-plate-editor/
npm link

# In consuming project/
npm link mini-plate-editor
```

## Common Issues and Fixes

### "Cannot find module 'mini-plate-editor'"

**Fix:** Run `npm run build` first — the `dist/` folder must exist. The package.json `main` points to `dist/index.js`.

### Peer dependency warnings

**Fix:** Install all peer dependencies in the consuming project:

```bash
npm install react react-dom @udecode/plate @udecode/plate-basic-marks @udecode/plate-heading @udecode/plate-block-quote @udecode/plate-horizontal-rule @udecode/plate-list @udecode/plate-media
```

### Tailwind classes not rendering

**Fix:** The editor uses Tailwind CSS classes. The consuming project must:
1. Have Tailwind CSS configured
2. Include the package's dist files in Tailwind's `content` config:

```js
// tailwind.config.js
content: [
  './node_modules/mini-plate-editor/dist/**/*.{js,mjs}',
  // ...your other content paths
]
```

### "use client" errors in Next.js

**Fix:** The build output includes `"use client"` banners automatically. If you still get errors, wrap the import in a client component:

```tsx
'use client'
import { PlateEditor } from 'mini-plate-editor'
```

### Type errors with Plate.js version mismatch

**Fix:** Ensure your project uses `@udecode/plate` version ^48. Major version mismatches will cause type incompatibilities.

### Unknown directives not preserved

**Expected behavior:** Unknown `:::directive` blocks are stored as `DirectiveRawElement` with the raw markdown preserved. They round-trip through `markdownToPlate` → `plateToMarkdown` without data loss.

## Versioning

Follow semver:
- **patch**: Bug fixes, internal changes
- **minor**: New directive types, new exports, non-breaking additions
- **major**: Breaking API changes (PlateEditor props, serialization format)
