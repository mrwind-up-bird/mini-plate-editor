import { usePlateEditor } from '@udecode/plate/react'
import type { TElement } from '@udecode/plate'

// Standard Plate plugins
import { BoldPlugin, ItalicPlugin, StrikethroughPlugin, CodePlugin } from '@udecode/plate-basic-marks/react'
import { HeadingPlugin } from '@udecode/plate-heading/react'
import { BlockquotePlugin } from '@udecode/plate-block-quote/react'
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react'
import { ListPlugin } from '@udecode/plate-list/react'
import { ImagePlugin } from '@udecode/plate-media/react'

import {
  ELEMENT_CALLOUT,
  ELEMENT_BOX,
  ELEMENT_HERO,
  ELEMENT_COLUMNS,
  ELEMENT_COLUMN,
  ELEMENT_DIRECTIVE_RAW,
} from './types'

// Standard leaf + element components
import {
  BoldLeaf,
  ItalicLeaf,
  StrikethroughLeaf,
  CodeLeaf,
  HeadingElement,
  BlockquoteElement,
  HorizontalRuleElement,
  ImageElement,
  LinkElement,
  UnorderedListElement,
  OrderedListElement,
  ListItemElement,
  ListItemContentElement,
  CodeBlockElement,
  CodeLineElement,
  ParagraphElement,
} from './elements/StandardElements'

// Custom directive element components
import { CalloutElement } from './elements/CalloutElement'
import { BoxElement } from './elements/BoxElement'
import { HeroElement } from './elements/HeroElement'
import { ColumnsElement } from './elements/ColumnsElement'
import { ColumnElement } from './elements/ColumnElement'
import { DirectiveRawElement } from './elements/DirectiveRawElement'

import { createCalloutPlugin } from './plugins/calloutPlugin'
import { createBoxPlugin } from './plugins/boxPlugin'
import { createHeroPlugin } from './plugins/heroPlugin'
import { createColumnsPlugin, createColumnPlugin } from './plugins/columnsPlugin'
import { createDirectiveRawPlugin } from './plugins/directiveRawPlugin'

export function useEditorConfig(initialValue: TElement[]) {
  const editor = usePlateEditor({
    plugins: [
      // Standard formatting plugins -- marks need render.leaf for visual rendering
      HeadingPlugin,
      BoldPlugin.extend({ render: { leaf: BoldLeaf } }),
      ItalicPlugin.extend({ render: { leaf: ItalicLeaf } }),
      StrikethroughPlugin.extend({ render: { leaf: StrikethroughLeaf } }),
      CodePlugin.extend({ render: { leaf: CodeLeaf } }),
      BlockquotePlugin,
      HorizontalRulePlugin,
      ListPlugin,
      ImagePlugin,

      // Custom directive plugins
      createCalloutPlugin(),
      createBoxPlugin(),
      createHeroPlugin(),
      createColumnsPlugin(),
      createColumnPlugin(),
      createDirectiveRawPlugin(),
    ],
    override: {
      components: {
        // Standard element components
        p: ParagraphElement,
        h1: HeadingElement,
        h2: HeadingElement,
        h3: HeadingElement,
        h4: HeadingElement,
        h5: HeadingElement,
        h6: HeadingElement,
        blockquote: BlockquoteElement,
        hr: HorizontalRuleElement,
        img: ImageElement,
        a: LinkElement,
        ul: UnorderedListElement,
        ol: OrderedListElement,
        li: ListItemElement,
        lic: ListItemContentElement,
        code_block: CodeBlockElement,
        code_line: CodeLineElement,

        // Custom directive element components
        [ELEMENT_CALLOUT]: CalloutElement,
        [ELEMENT_BOX]: BoxElement,
        [ELEMENT_HERO]: HeroElement,
        [ELEMENT_COLUMNS]: ColumnsElement,
        [ELEMENT_COLUMN]: ColumnElement,
        [ELEMENT_DIRECTIVE_RAW]: DirectiveRawElement,
      },
    },
    value: initialValue,
  }, [])

  return editor
}
