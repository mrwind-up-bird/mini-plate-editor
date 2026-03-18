import type { TElement } from '@udecode/plate'

// -- Element type constants --------------------------------------------------

export const ELEMENT_CALLOUT = 'callout'
export const ELEMENT_BOX = 'box'
export const ELEMENT_HERO = 'hero'
export const ELEMENT_COLUMNS = 'columns'
export const ELEMENT_COLUMN = 'column'
export const ELEMENT_DIRECTIVE_RAW = 'directive-raw'

// -- Element interfaces ------------------------------------------------------

export interface CalloutElement extends TElement {
  type: typeof ELEMENT_CALLOUT
  variant: 'info' | 'warning' | 'tip' | 'danger'
}

export interface BoxElement extends TElement {
  type: typeof ELEMENT_BOX
}

export interface HeroElement extends TElement {
  type: typeof ELEMENT_HERO
}

export interface ColumnsElement extends TElement {
  type: typeof ELEMENT_COLUMNS
  columnCount: 2 | 3
}

export interface ColumnElement extends TElement {
  type: typeof ELEMENT_COLUMN
}

/** Fallback: raw markdown preserved as-is for unknown/not-yet-implemented directives */
export interface DirectiveRawElement extends TElement {
  type: typeof ELEMENT_DIRECTIVE_RAW
  rawMarkdown: string
}

// -- Union type --------------------------------------------------------------

export type DirectiveElement =
  | CalloutElement
  | BoxElement
  | HeroElement
  | ColumnsElement
  | ColumnElement
  | DirectiveRawElement
