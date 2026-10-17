'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import { highlight } from '@/lib/lua'

export default function LuaEditor({ value, onChange, onDropFile, placeholder }: { value: string; onChange: (v: string) => void; onDropFile?: (f: File) => void; placeholder?: string }) {
  const pre = useRef<HTMLPreElement>(null)
  const gut = useRef<HTMLDivElement>(null)
  const area = useRef<HTMLTextAreaElement>(null)
  const html = useMemo(() => highlight(value) + '\n', [value])
  const nums = useMemo(() => Array.from({ length: value.split('\n').length }, (_, i) => i + 1).join('\n'), [value])

  // Keep the color layer and the line numbers aligned with the textarea.
  const sync = () => {
    const t = area.current
    if (!t) return
    if (pre.current) { pre.current.scrollTop = t.scrollTop; pre.current.scrollLeft = t.scrollLeft }
    if (gut.current) gut.current.scrollTop = t.scrollTop
  }
  // Runs AFTER the new text is rendered: pasting or uploading long code scrolls the textarea
  // before the color layer has the new content, so it must be re-synced here.
  useLayoutEffect(sync, [html, nums])

  return (
    <div className="lua-editor" onDragOver={e => e.preventDefault()} onDrop={e => { const f = e.dataTransfer.files[0]; if (f && onDropFile) { e.preventDefault(); onDropFile(f) } }}>
      <div className="lua-gutter" ref={gut} aria-hidden="true">{nums}</div>
      <div className="lua-area">
        <pre ref={pre} aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />
        <textarea
          ref={area}
          value={value}
          spellCheck={false}
          wrap="off"
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          onScroll={sync}
          onKeyDown={e => {
            if (e.key !== 'Tab') return
            e.preventDefault()
            const t = e.currentTarget, a = t.selectionStart, b = t.selectionEnd
            onChange(value.slice(0, a) + '  ' + value.slice(b))
            requestAnimationFrame(() => { t.selectionStart = t.selectionEnd = a + 2 })
          }}
        />
      </div>
    </div>
  )
}