'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

// The quick-copy bar at the top of a game page — paste straight into an executor.
export function CopyLoadstring({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="loadstring-bar">
      <input readOnly value={value} onFocus={e => e.currentTarget.select()} />
      <button type="button" onClick={async () => { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1600) }}>
        {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}
