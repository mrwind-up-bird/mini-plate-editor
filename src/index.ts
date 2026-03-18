// -- Main editor component ---------------------------------------------------
export { PlateEditor } from './PlateEditor'

// -- Serialization -----------------------------------------------------------
export { markdownToPlate } from './serialization/markdownToPlate'
export { plateToMarkdown } from './serialization/plateToMarkdown'

// -- Directive parser --------------------------------------------------------
export { parseBlocks, splitColumns } from './directiveParser'
export type { Block } from './directiveParser'

// -- Element type constants --------------------------------------------------
export {
  ELEMENT_CALLOUT,
  ELEMENT_BOX,
  ELEMENT_HERO,
  ELEMENT_COLUMNS,
  ELEMENT_COLUMN,
  ELEMENT_DIRECTIVE_RAW,
} from './types'

// -- Type interfaces ---------------------------------------------------------
export type {
  CalloutElement,
  BoxElement,
  HeroElement,
  ColumnsElement,
  ColumnElement,
  DirectiveRawElement,
  DirectiveElement,
} from './types'

// -- Reusable components -----------------------------------------------------
export { DirectiveWrapper } from './elements/DirectiveWrapper'
