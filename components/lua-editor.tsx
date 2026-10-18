'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { highlight } from '@/lib/lua'

// One scroll container holds the line numbers, the color layer and the textarea,
// so they can never get out of sync. If a browser/extension hides the color layer,
// it falls back to showing the textarea text itself (plain mode) so code is never invisible.
export default function LuaEditor({ value, onChange, onDropFile, placeholder }: { value: string; onChange: (v: string) => void; onDropFile?: (f: File) => void; placeholder?: string }) {
  const preRef = useRef<HTMLPreElement>(null)
  const [plain, setPlain] = useState(false)
  const html = useMemo(() => highlight(value) + '\n', [value])
  const lines = useMemo(() => value.split('\n').length, [value])
  const nums = useMemo(() => Array.from({ length: lines }, (_, i) => i + 1).join('\n'), [lines])

  useEffect(() => {
    const check = () => {
      const el = preRef.current
      if (!el) return
      const cs = getComputedStyle(el)
      setPlain(cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0' || el.getBoundingClientRect().height === 0)
    }
    check()
    const t1 = setTimeout(check, 500), t2 = setTimeout(check, 2000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className={plain ? 'lua-editor plain' : 'lua-editor'} style={{ '--n': lines } as React.CSSProperties} onDragOver={e => e.preventDefault()} onDrop={e => { const f = e.dataTransfer.files[0]; if (f && onDropFile) { e.preventDefault(); onDropFile(f) } }}>
      <div className="lua-inner">
        <div className="lua-gutter" aria-hidden="true">{nums}</div>
        <div className="lua-area">
          <pre ref={preRef} aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />
          <textarea
            value={value}
            spellCheck={false}
            wrap="off"
            placeholder={placeholder}
            onChange={e => onChange(e.target.value)}
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
    </div>
  )
}