'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { highlight } from '@/lib/lua'

export function CopyButton({ text }: { text: string }) {
  const [ok, setOk] = useState(false)
  return (
    <button type="button" className="code-copy" onClick={async () => { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1600) }}>
      {ok ? <Check size={14} /> : <Copy size={14} />}{ok ? 'Copied' : 'Copy'}
    </button>
  )
}

export function CodeBlock({ code, image }: { code: string; image?: string }) {
  const nums = Array.from({ length: code.split('\n').length }, (_, i) => i + 1).join('\n')
  return (
    <div className="code-block">
      <div className="code-head">
        <span className="code-lang">{image ? <img src={image} alt="" /> : null}Lua</span>
        <CopyButton text={code} />
      </div>
      <pre className="code-pre"><span className="code-nums" aria-hidden="true">{nums}</span><code dangerouslySetInnerHTML={{ __html: highlight(code) }} /></pre>
    </div>
  )
}
