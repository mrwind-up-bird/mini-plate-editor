'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import type { TElement } from '@udecode/plate'
import { SlashCommandMenu } from './SlashCommandMenu'

interface PlateToolbarProps {
  onInsertNode: (node: TElement) => void
  onToggleMark: (mark: string) => void
  activeMarks: Record<string, boolean>
}

export function PlateToolbar({ onInsertNode, onToggleMark, activeMarks }: PlateToolbarProps) {
  const [showBlockMenu, setShowBlockMenu] = useState(false)
  const blockBtnRef = useRef<HTMLButtonElement>(null)
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | undefined>()

  const openBlockMenu = useCallback(() => {
    if (blockBtnRef.current) {
      const rect = blockBtnRef.current.getBoundingClientRect()
      setMenuPos({ top: rect.bottom + 4, left: rect.left })
    }
    setShowBlockMenu(true)
  }, [])

  // Close on outside click
  useEffect(() => {
    if (!showBlockMenu) return
    const handler = (e: MouseEvent) => {
      if (blockBtnRef.current?.contains(e.target as Node)) return
      setShowBlockMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showBlockMenu])

  const ToolBtn = ({ label, mark, children }: { label: string; mark?: string; children: React.ReactNode }) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        if (mark) onToggleMark(mark)
      }}
      className={`p-1.5 rounded transition-colors ${
        mark && activeMarks[mark] ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
      }`}
      title={label}
    >
      {children}
    </button>
  )

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg px-2 py-1 mb-2 flex items-center gap-0.5 flex-wrap">
        <ToolBtn label="Bold" mark="bold">
          <span className="text-xs font-bold">B</span>
        </ToolBtn>
        <ToolBtn label="Italic" mark="italic">
          <span className="text-xs italic">I</span>
        </ToolBtn>
        <ToolBtn label="Strikethrough" mark="strikethrough">
          <span className="text-xs line-through">S</span>
        </ToolBtn>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            onInsertNode({ type: 'h1', children: [{ text: '' }] })
          }}
          className="p-1.5 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          title="Heading 1"
        >
          <span className="text-xs font-bold">H1</span>
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            onInsertNode({ type: 'h2', children: [{ text: '' }] })
          }}
          className="p-1.5 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          title="Heading 2"
        >
          <span className="text-xs font-bold">H2</span>
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            onInsertNode({ type: 'h3', children: [{ text: '' }] })
          }}
          className="p-1.5 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          title="Heading 3"
        >
          <span className="text-xs font-bold">H3</span>
        </button>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        <button
          ref={blockBtnRef}
          type="button"
          onMouseDown={(e) => { e.preventDefault(); openBlockMenu() }}
          className="px-2 py-1 rounded text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          title="Insert block"
        >
          + Block
        </button>
      </div>

      {showBlockMenu && (
        <SlashCommandMenu
          onInsert={onInsertNode}
          onClose={() => setShowBlockMenu(false)}
          position={menuPos}
        />
      )}
    </>
  )
}
