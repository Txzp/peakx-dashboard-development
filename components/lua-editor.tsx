'use client'

import { useMemo } from 'react'
import { basicSetup } from 'codemirror'
import { indentUnit, StreamLanguage, syntaxHighlighting, HighlightStyle } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { lua } from '@codemirror/legacy-modes/mode/lua'
import CodeMirror from '@uiw/react-codemirror'
import { EditorView, keymap } from '@codemirror/view'

const luaHighlighting = HighlightStyle.define([
  { tag: tags.keyword, color: '#60a5fa' },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: '#2dd4bf' },
  { tag: tags.string, color: '#f87171' },
  { tag: tags.number, color: '#fbbf24' },
  { tag: tags.comment, color: '#6b7a94', fontStyle: 'italic' },
  { tag: [tags.variableName, tags.propertyName, tags.bool, tags.atom], color: '#d6e2f5' },
])

const editorTheme = EditorView.theme({
  '&': { backgroundColor: 'rgba(5,8,14,.85)', color: '#d6e2f5', fontSize: '13px', fontFamily: "ui-monospace, 'JetBrains Mono', SFMono-Regular, Menlo, Consolas, monospace" },
  '.cm-content': { caretColor: '#fff', padding: '14px 0', minHeight: '260px' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#fff' },
  '.cm-gutters': { backgroundColor: 'rgba(5,8,14,.85)', color: '#52627d', border: 'none', borderRight: '1px solid rgba(148,163,184,.12)' },
  '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'rgba(96,165,250,.06)' },
  '.cm-selectionBackground, ::selection': { backgroundColor: 'rgba(96,165,250,.24)' },
  '.cm-scroller': { overflow: 'auto', minHeight: '260px' },
  '.cm-placeholder': { color: '#52627d' },
})

export default function LuaEditor({ value, onChange, onDropFile, placeholder }: { value: string; onChange: (v: string) => void; onDropFile?: (f: File) => void; placeholder?: string }) {
  const extensions = useMemo(() => [
    basicSetup,
    StreamLanguage.define(lua),
    indentUnit.of('  '),
    keymap.of([{ key: 'Tab', run: view => { view.dispatch(view.state.replaceSelection('  ')); return true } }]),
    editorTheme,
    syntaxHighlighting(luaHighlighting),
  ], [])

  return (
    <div className="lua-editor" onDragOver={e => e.preventDefault()} onDrop={e => {
      const file = e.dataTransfer.files[0]
      if (file && onDropFile) { e.preventDefault(); onDropFile(file) }
    }}>
      <CodeMirror value={value} onChange={onChange} placeholder={placeholder} extensions={extensions} basicSetup={false} height="260px" />
    </div>
  )
}
