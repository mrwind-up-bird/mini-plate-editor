'use client'

import React, { useCallback, useRef, useState } from 'react'
import { Plate, PlateContent } from '@udecode/plate/react'
import type { TElement } from '@udecode/plate'
import { useEditorConfig } from './useEditorConfig'
import { PlateToolbar } from './PlateToolbar'

interface PlateEditorProps {
  initialValue: TElement[]
  onChange: (value: TElement[]) => void
}

export function PlateEditor({ initialValue, onChange }: PlateEditorProps) {
  const editor = useEditorConfig(initialValue)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const [activeMarks, setActiveMarks] = useState<Record<string, boolean>>({})

  const handleChange = useCallback(({ value }: { value: TElement[] }) => {
    onChangeRef.current(value)
  }, [])

  const handleSelectionChange = useCallback(() => {
    if (!editor) return
    // Check active marks at current selection
    const marks = editor.api.marks() || {}
    setActiveMarks({
      bold: !!marks.bold,
      italic: !!marks.italic,
      strikethrough: !!marks.strikethrough,
      code: !!marks.code,
    })
  }, [editor])

  const toggleMark = useCallback((mark: string) => {
    if (!editor) return
    editor.tf.toggleMark(mark)
    // Update active marks after toggle
    const marks = editor.api.marks() || {}
    setActiveMarks({
      bold: !!marks.bold,
      italic: !!marks.italic,
      strikethrough: !!marks.strikethrough,
      code: !!marks.code,
    })
  }, [editor])

  const insertNode = useCallback((node: TElement) => {
    if (!editor) return
    // Collapse selection to end so inserting a block doesn't delete selected text
    if (editor.selection) {
      editor.tf.collapse({ edge: 'end' })
    }
    editor.tf.insertNodes(node)
  }, [editor])

  if (!editor) return null

  return (
    <Plate editor={editor} onValueChange={handleChange} onSelectionChange={handleSelectionChange}>
      <PlateToolbar
        onInsertNode={insertNode}
        onToggleMark={toggleMark}
        activeMarks={activeMarks}
      />
      <PlateContent
        className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 min-h-[300px] h-full overflow-y-auto focus:outline-none focus:ring-2 focus:ring-blue-500/30 prose prose-sm max-w-none"
        placeholder="Start typing..."
        spellCheck={false}
      />
    </Plate>
  )
}
