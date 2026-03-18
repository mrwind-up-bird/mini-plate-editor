import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    '@udecode/plate',
    '@udecode/plate/react',
    '@udecode/plate-basic-marks',
    '@udecode/plate-basic-marks/react',
    '@udecode/plate-heading',
    '@udecode/plate-heading/react',
    '@udecode/plate-block-quote',
    '@udecode/plate-block-quote/react',
    '@udecode/plate-horizontal-rule',
    '@udecode/plate-horizontal-rule/react',
    '@udecode/plate-list',
    '@udecode/plate-list/react',
    '@udecode/plate-media',
    '@udecode/plate-media/react',
  ],
  banner: {
    js: '"use client";',
  },
})
