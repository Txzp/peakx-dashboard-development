'use client'

import { useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { HighlightStyle, StreamLanguage, syntaxHighlighting } from '@codemirror/language'
import { lua } from '@codemirror/legacy-modes/mode/lua'
import { EditorView } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'

const luaLang = StreamLanguage.define(lua)

// Matches the dark theme already used across the dashboard/public site.
// @uiw/react-codemirror falls back to its own light theme unless `theme`
// is passed explicitly — pass this as the `theme` prop, not as an extension.
const peakxTheme = EditorView.theme({
  '&': { backgroundColor: 'transparent', color: '#d6e2f5', height: '100%', fontSize: '13px' },
  '.cm-content': { caretColor: '#fff', fontFamily: "ui-monospace,'JetBrains Mono',SFMono-Regular,Menlo,Consolas,monospace", padding: '14px 16px' },
  '.cm-scroller': { fontFamily: "ui-monospace,'JetBrains Mono',SFMono-Regular,Menlo,Consolas,monospace", overflow: 'auto' },
  '.cm-gutters': { backgroundColor: '#0a0e16', color: '#4a5670', border: 'none', borderRight: '1px solid #182033' },
  '.cm-lineNumbers .cm-gutterElement': { padding: '0 8px 0 0' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: '#8aa0c2' },
  '.cm-activeLine': { backgroundColor: '#ffffff08' },
  '&.cm-focused': { outline: 'none' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': { backgroundColor: '#5b9cff40 !important' },
  '.cm-cursor': { borderLeftColor: '#fff' },
  '.cm-scroller::-webkit-scrollbar': { width: '10px', height: '10px' },
  '.cm-scroller::-webkit-scrollbar-track': { background: 'transparent' },
  '.cm-scroller::-webkit-scrollbar-thumb': { background: '#2a3347', borderRadius: '999px' },
  '.cm-placeholder': { color: '#4a5670' },
}, { dark: true })

// Real CodeMirror highlight API — not made-up ".tok-*" class names.
const luaHighlight = syntaxHighlighting(HighlightStyle.define([
  { tag: t.keyword, color: '#60a5fa' },
  { tag: [t.standard(t.variableName), t.special(t.variableName)], color: '#38bdf8' },
  { tag: t.function(t.variableName), color: '#2dd4bf' },
  { tag: t.string, color: '#f87171' },
  { tag: [t.number, t.bool, t.null], color: '#fbbf24' },
  { tag: t.comment, color: '#6b7a94', fontStyle: 'italic' },
  { tag: t.operator, color: '#d6e2f5' },
  { tag: t.variableName, color: '#d6e2f5' },
]))

export default function LuaEditor({ value, onChange, onDropFile, placeholder }: { value: string; onChange: (v: string) => void; onDropFile?: (f: File) => void; placeholder?: string }) {
  const extensions = useMemo(() => [luaLang, luaHighlight], [])
  return (
    <div
      className="lua-editor"
      onDragOver={e => e.preventDefault()}
      onDrop={e => { const f = e.dataTransfer.files[0]; if (f && onDropFile) { e.preventDefault(); onDropFile(f) } }}
    >
      <CodeMirror
        value={value}
        height="100%"
        theme={peakxTheme}
        basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: true, tabSize: 2 }}
        extensions={extensions}
        placeholder={placeholder}
        onChange={v => onChange(v)}
        indentWithTab
      />
    </div>
  )
}
