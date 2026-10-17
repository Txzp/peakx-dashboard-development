'use client'

import { useState } from 'react'
import { Check, ChevronDown, ChevronUp, Copy } from 'lucide-react'
import { highlight } from '@/lib/lua'

export function CopyButton({ text }: { text: string }) {
  const [ok, setOk] = useState(false)
  return (
    <button type="button" className="code-copy" onClick={async () => { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1600) }}>
      {ok ? <Check size={14} /> : <Copy size={14} />}{ok ? 'Copied' : 'Copy'}
    </button>
  )
}

const COLLAPSE_AT = 50

export function CodeBlock({ code, image, collapse = true, label = 'Lua' }: { code: string; image?: string; collapse?: boolean; label?: string }) {
  const total = code.split('\n').length
  const long = collapse && total > COLLAPSE_AT
  const [open, setOpen] = useState(false)
  const clamped = long && !open
  const nums = Array.from({ length: total }, (_, i) => i + 1).join('\n')
  return (
    <div className="code-block">
      <div className="code-head">
        <span className="code-lang">{image ? <img src={image} alt="" /> : null}{label}</span>
        <CopyButton text={code} />
      </div>
      <div className="code-wrap">
        <pre className={clamped ? 'code-pre clamped' : 'code-pre'}><span className="code-nums" aria-hidden="true">{nums}</span><code dangerouslySetInnerHTML={{ __html: highlight(code) }} /></pre>
        {clamped && (
          <div className="code-fade">
            <button type="button" className="code-more" onClick={() => setOpen(true)}><ChevronDown size={15} /> Show Source<small>{(total - COLLAPSE_AT).toLocaleString()} more lines</small></button>
          </div>
        )}
      </div>
      {long && open && <button type="button" className="code-less" onClick={() => setOpen(false)}><ChevronUp size={14} /> Hide source</button>}
    </div>
  )
}
