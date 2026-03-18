'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import type { TElement } from '@udecode/plate'
import {
  ELEMENT_CALLOUT,
  ELEMENT_BOX,
  ELEMENT_HERO,
  ELEMENT_COLUMNS,
  ELEMENT_COLUMN,
} from './types'

interface SlashMenuItem {
  label: string
  description: string
  category: string
  insert: () => TElement
}

const CATEGORIES = [
  'Text',
  'Layout',
  'Callouts',
]

function createItems(): SlashMenuItem[] {
  return [
    // Text
    { label: 'Paragraph', description: 'Plain text', category: 'Text', insert: () => ({ type: 'p', children: [{ text: '' }] }) },
    { label: 'Heading 1', description: 'Large heading', category: 'Text', insert: () => ({ type: 'h1', children: [{ text: '' }] }) },
    { label: 'Heading 2', description: 'Medium heading', category: 'Text', insert: () => ({ type: 'h2', children: [{ text: '' }] }) },
    { label: 'Heading 3', description: 'Small heading', category: 'Text', insert: () => ({ type: 'h3', children: [{ text: '' }] }) },
    { label: 'Blockquote', description: 'Quote block', category: 'Text', insert: () => ({ type: 'blockquote', children: [{ type: 'p', children: [{ text: '' }] }] }) },
    { label: 'Horizontal Rule', description: 'Divider line', category: 'Text', insert: () => ({ type: 'hr', children: [{ text: '' }] }) },

    // Layout
    { label: 'Two Columns', description: 'Two-column layout', category: 'Layout', insert: () => ({
      type: ELEMENT_COLUMNS, columnCount: 2,
      children: [
        { type: ELEMENT_COLUMN, children: [{ type: 'p', children: [{ text: '' }] }] },
        { type: ELEMENT_COLUMN, children: [{ type: 'p', children: [{ text: '' }] }] },
      ],
    }) },
    { label: 'Three Columns', description: 'Three-column layout', category: 'Layout', insert: () => ({
      type: ELEMENT_COLUMNS, columnCount: 3,
      children: [
        { type: ELEMENT_COLUMN, children: [{ type: 'p', children: [{ text: '' }] }] },
        { type: ELEMENT_COLUMN, children: [{ type: 'p', children: [{ text: '' }] }] },
        { type: ELEMENT_COLUMN, children: [{ type: 'p', children: [{ text: '' }] }] },
      ],
    }) },
    { label: 'Feature Box', description: 'Content card', category: 'Layout', insert: () => ({
      type: ELEMENT_BOX, children: [{ type: 'p', children: [{ text: '' }] }],
    }) },
    { label: 'Hero', description: 'Hero block', category: 'Layout', insert: () => ({
      type: ELEMENT_HERO, children: [{ type: 'h1', children: [{ text: '' }] }],
    }) },

    // Callouts
    { label: 'Info', description: 'Informational note', category: 'Callouts', insert: () => ({
      type: ELEMENT_CALLOUT, variant: 'info', children: [{ type: 'p', children: [{ text: '' }] }],
    }) },
    { label: 'Warning', description: 'Warning notice', category: 'Callouts', insert: () => ({
      type: ELEMENT_CALLOUT, variant: 'warning', children: [{ type: 'p', children: [{ text: '' }] }],
    }) },
    { label: 'Tip', description: 'Helpful tip', category: 'Callouts', insert: () => ({
      type: ELEMENT_CALLOUT, variant: 'tip', children: [{ type: 'p', children: [{ text: '' }] }],
    }) },
    { label: 'Danger', description: 'Danger alert', category: 'Callouts', insert: () => ({
      type: ELEMENT_CALLOUT, variant: 'danger', children: [{ type: 'p', children: [{ text: '' }] }],
    }) },
  ]
}

interface SlashCommandMenuProps {
  onInsert: (node: TElement) => void
  onClose: () => void
  position?: { top: number; left: number }
}

export function SlashCommandMenu({ onInsert, onClose, position }: SlashCommandMenuProps) {
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const items = createItems()
  const filtered = search
    ? items.filter(item =>
        item.label.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
      )
    : items

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault()
      onInsert(filtered[selectedIndex].insert())
      onClose()
    }
  }, [filtered, selectedIndex, onInsert, onClose])

  // Group by category
  const grouped: { category: string; items: (SlashMenuItem & { globalIndex: number })[] }[] = []
  let globalIdx = 0
  const categoryMap = new Map<string, (SlashMenuItem & { globalIndex: number })[]>()
  for (const item of filtered) {
    if (!categoryMap.has(item.category)) categoryMap.set(item.category, [])
    categoryMap.get(item.category)!.push({ ...item, globalIndex: globalIdx++ })
  }
  for (const cat of CATEGORIES) {
    const catItems = categoryMap.get(cat)
    if (catItems && catItems.length > 0) {
      grouped.push({ category: cat, items: catItems })
    }
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-72 max-h-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden flex flex-col animate-fade-in"
      style={position ? { top: position.top, left: position.left } : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
    >
      <div className="p-2 border-b border-gray-100">
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search blocks..."
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-1">
        {grouped.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">No blocks found</p>
        )}
        {grouped.map(group => (
          <div key={group.category}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 px-2 pt-2 pb-1">{group.category}</p>
            {group.items.map(item => (
              <button
                key={item.label}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); onInsert(item.insert()); onClose() }}
                className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${
                  item.globalIndex === selectedIndex ? 'bg-blue-50 text-gray-900' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div>
                  <span className="text-xs font-medium">{item.label}</span>
                  <span className="text-[10px] text-gray-400 ml-1.5">{item.description}</span>
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
