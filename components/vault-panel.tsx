'use client'

import { useMemo, useRef, useState } from 'react'
import { ArrowLeft, Check, Copy, File, Folder, FolderPlus, Pencil, Save, Trash2, Upload, X } from 'lucide-react'
import { createVaultFile, createVaultFolder, deleteVaultFile, deleteVaultFolder, getVaultFile, updateVaultFile } from '@/app/actions/vault'
import { highlight } from '@/lib/lua'
import LuaEditor from '@/components/lua-editor'

export type VaultFolder = { id: string; title: string; description: string | null; createdAt: Date }
export type VaultFileMeta = { id: string; folderId: string | null; title: string; description: string | null; ext: string; createdAt: Date }

// Numeric-only date + time, e.g. 17/10/2026 14:32:05 — no month names.
function stamp(d: Date) {
  const n = new Date(d)
  const p = (x: number) => String(x).padStart(2, '0')
  return `${p(n.getDate())}/${p(n.getMonth() + 1)}/${n.getFullYear()} ${p(n.getHours())}:${p(n.getMinutes())}:${p(n.getSeconds())}`
}

type View = { mode: 'root' } | { mode: 'new-file' } | { mode: 'new-folder' } | { mode: 'folder'; folderId: string } | { mode: 'file'; fileId: string; back: View } | { mode: 'edit'; fileId: string; back: View }

export default function VaultPanel({ initialFolders, initialFiles, flash }: { initialFolders: VaultFolder[]; initialFiles: VaultFileMeta[]; flash: (t: string) => void }) {
  const [folders, setFolders] = useState(initialFolders)
  const [files, setFiles] = useState(initialFiles)
  const [view, setView] = useState<View>({ mode: 'root' })
  const rootFiles = useMemo(() => files.filter(f => !f.folderId), [files])

  return (
    <div className="vault">
      {view.mode === 'root' && (
        <VaultRoot folders={folders} files={rootFiles} onOpenFolder={id => setView({ mode: 'folder', folderId: id })} onOpenFile={id => setView({ mode: 'file', fileId: id, back: { mode: 'root' } })} onNewFile={() => setView({ mode: 'new-file' })} onNewFolder={() => setView({ mode: 'new-folder' })}
          onDeleteFolder={async id => { if (!confirm('Delete this folder and everything in it?')) return; await deleteVaultFolder(id); setFolders(folders.filter(f => f.id !== id)); setFiles(files.filter(f => f.folderId !== id)); flash('Folder removed') }}
          onDeleteFile={async id => { if (!confirm('Delete this file?')) return; await deleteVaultFile(id); setFiles(files.filter(f => f.id !== id)); flash('File removed') }} />
      )}
      {view.mode === 'new-file' && (
        <NewFile onCancel={() => setView({ mode: 'root' })} onSaved={f => { setFiles([f, ...files]); setView({ mode: 'root' }); flash(`[${f.title}] saved`) }} />
      )}
      {view.mode === 'new-folder' && (
        <NewFolder onCancel={() => setView({ mode: 'root' })} onSaved={(folder, added) => { setFolders([folder, ...folders]); setFiles([...added, ...files]); setView({ mode: 'root' }); flash(`[${folder.title}] saved · ${added.length} file${added.length === 1 ? '' : 's'}`) }} />
      )}
      {view.mode === 'folder' && (() => {
        const folder = folders.find(f => f.id === view.folderId)
        const inside = files.filter(f => f.folderId === view.folderId)
        if (!folder) return null
        return <FolderView folder={folder} files={inside} onBack={() => setView({ mode: 'root' })} onOpenFile={id => setView({ mode: 'file', fileId: id, back: view })}
          onDeleteFile={async id => { if (!confirm('Delete this file?')) return; await deleteVaultFile(id); setFiles(files.filter(f => f.id !== id)); flash('File removed') }} />
      })()}
      {view.mode === 'file' && (
        <FileView fileId={view.fileId} onBack={() => setView(view.back)} onEdit={() => setView({ mode: 'edit', fileId: view.fileId, back: view.back })} />
      )}
      {view.mode === 'edit' && (
        <EditFile fileId={view.fileId} onCancel={() => setView({ mode: 'file', fileId: view.fileId, back: view.back })}
          onSaved={meta => { setFiles(files.map(f => f.id === meta.id ? { ...f, title: meta.title, description: meta.description } : f)); setView({ mode: 'file', fileId: view.fileId, back: view.back }); flash('Changes saved') }} />
      )}
    </div>
  )
}

function VaultRoot({ folders, files, onOpenFolder, onOpenFile, onNewFile, onNewFolder, onDeleteFolder, onDeleteFile }: { folders: VaultFolder[]; files: VaultFileMeta[]; onOpenFolder: (id: string) => void; onOpenFile: (id: string) => void; onNewFile: () => void; onNewFolder: () => void; onDeleteFolder: (id: string) => void; onDeleteFile: (id: string) => void }) {
  return (
    <div className="panel library-panel">
      <div className="library-toolbar">
        <div><h2>My Files</h2><span className="muted">{folders.length} folder{folders.length === 1 ? '' : 's'} · {files.length} file{files.length === 1 ? '' : 's'}</span></div>
        <div className="vault-actions"><button type="button" className="ghost-button" onClick={onNewFolder}><FolderPlus size={13} /> New folder</button><button type="button" className="primary-button" onClick={onNewFile}><Upload size={13} /> New file</button></div>
      </div>
      {folders.length === 0 && files.length === 0 ? (
        <div className="empty-state"><span className="empty-icon">＋</span><h3>Nothing saved yet</h3><p>Upload a .lua or .txt file, or a whole folder of them.</p></div>
      ) : (
        <div className="script-list">
          {folders.map((f, i) => (
            <article className="script-row" key={f.id} style={{ '--i': i } as React.CSSProperties} onClick={() => onOpenFolder(f.id)}>
              <div className="script-icon"><Folder size={16} /></div>
              <div className="script-main"><h3>{f.title}</h3><p>{f.description || 'Folder'}</p></div>
              <span className="script-date">{stamp(f.createdAt)}</span>
              <div className="row-actions"><button onClick={e => { e.stopPropagation(); onDeleteFolder(f.id) }}><Trash2 size={12} /> Delete</button></div>
            </article>
          ))}
          {files.map((f, i) => (
            <article className="script-row" key={f.id} style={{ '--i': i + folders.length } as React.CSSProperties} onClick={() => onOpenFile(f.id)}>
              <div className="script-icon"><File size={16} /></div>
              <div className="script-main"><h3>{f.title}</h3><p>{f.description || `.${f.ext}`}</p></div>
              <span className="script-date">{stamp(f.createdAt)}</span>
              <div className="row-actions"><button onClick={e => { e.stopPropagation(); onDeleteFile(f.id) }}><Trash2 size={12} /> Delete</button></div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

function FolderView({ folder, files, onBack, onOpenFile, onDeleteFile }: { folder: VaultFolder; files: VaultFileMeta[]; onBack: () => void; onOpenFile: (id: string) => void; onDeleteFile: (id: string) => void }) {
  return (
    <div className="panel library-panel">
      <button type="button" className="vault-back" onClick={onBack}><ArrowLeft size={14} /> My Files</button>
      <div className="library-toolbar"><div><h2>{folder.title}</h2><span className="muted">{folder.description || `${files.length} file${files.length === 1 ? '' : 's'}`}</span></div></div>
      {files.length === 0 ? <div className="empty-state"><span className="empty-icon">＋</span><h3>This folder is empty</h3></div> : (
        <div className="script-list">
          {files.map((f, i) => (
            <article className="script-row" key={f.id} style={{ '--i': i } as React.CSSProperties} onClick={() => onOpenFile(f.id)}>
              <div className="script-icon"><File size={16} /></div>
              <div className="script-main"><h3>{f.title}</h3><p>.{f.ext}</p></div>
              <span className="script-date">{stamp(f.createdAt)}</span>
              <div className="row-actions"><button onClick={e => { e.stopPropagation(); onDeleteFile(f.id) }}><Trash2 size={12} /> Delete</button></div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

function FileView({ fileId, onBack, onEdit }: { fileId: string; onBack: () => void; onEdit: () => void }) {
  const [file, setFile] = useState<{ title: string; description: string | null; content: string; createdAt: Date } | null>(null)
  const [copied, setCopied] = useState(false)
  useMemo(() => { getVaultFile(fileId).then(f => f && setFile(f)) }, [fileId])
  if (!file) return <div className="panel library-panel"><button type="button" className="vault-back" onClick={onBack}><ArrowLeft size={14} /> Back</button><p className="muted" style={{ padding: 20 }}>Loading…</p></div>
  return (
    <div className="panel library-panel">
      <button type="button" className="vault-back" onClick={onBack}><ArrowLeft size={14} /> Back</button>
      <div className="library-toolbar">
        <div><h2>{file.title}</h2><span className="muted">{file.description || stamp(file.createdAt)}</span></div>
        <div className="vault-actions">
          <button type="button" className="ghost-button" onClick={async () => { await navigator.clipboard.writeText(file.content); setCopied(true); setTimeout(() => setCopied(false), 1600) }}>{copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy'}</button>
          <button type="button" className="primary-button" onClick={onEdit}><Pencil size={13} /> Edit</button>
        </div>
      </div>
      <pre className="vault-view" dangerouslySetInnerHTML={{ __html: highlight(file.content) }} />
    </div>
  )
}

function EditFile({ fileId, onCancel, onSaved }: { fileId: string; onCancel: () => void; onSaved: (m: { id: string; title: string; description: string | null }) => void }) {
  const [loaded, setLoaded] = useState<{ title: string; description: string; content: string } | null>(null)
  const [busy, setBusy] = useState(false)
  useMemo(() => { getVaultFile(fileId).then(f => f && setLoaded({ title: f.title, description: f.description ?? '', content: f.content })) }, [fileId])
  if (!loaded) return <div className="panel form-panel"><p className="muted" style={{ padding: 20 }}>Loading…</p></div>
  return (
    <div className="panel form-panel">
      <div className="panel-heading"><div><p className="eyebrow">EDIT FILE</p><h2>{loaded.title}</h2></div><button type="button" className="more-button" onClick={onCancel}><X size={16} /></button></div>
      <label>Title<input value={loaded.title} onChange={e => setLoaded({ ...loaded, title: e.target.value })} maxLength={120} /></label>
      <label>Description<textarea value={loaded.description} onChange={e => setLoaded({ ...loaded, description: e.target.value })} placeholder="Optional" style={{ minHeight: 70 }} /></label>
      <label>Content<LuaEditor value={loaded.content} onChange={content => setLoaded({ ...loaded, content })} /></label>
      <div className="form-footer">
        <span className="muted">{loaded.content.split('\n').length.toLocaleString()} lines</span>
        <button className="primary-button" disabled={busy} onClick={async () => { setBusy(true); try { await updateVaultFile({ id: fileId, title: loaded.title, description: loaded.description, content: loaded.content }); onSaved({ id: fileId, title: loaded.title.trim(), description: loaded.description.trim() || null }) } finally { setBusy(false) } }}><Save size={13} /> {busy ? 'Saving…' : 'Save changes'}</button>
      </div>
    </div>
  )
}

function NewFile({ onCancel, onSaved }: { onCancel: () => void; onSaved: (f: VaultFileMeta) => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [fileName, setFileName] = useState('')
  const [busy, setBusy] = useState(false)
  const picker = useRef<HTMLInputElement>(null)

  async function pick(f?: File) {
    if (!f) return
    if (!/\.(lua|txt)$/i.test(f.name)) return alert('Choose a .lua or .txt file.')
    if (f.size > 1000000) return alert('File too large (1 MB max).')
    setContent((await f.text()).replace(/\r\n/g, '\n'))
    setFileName(f.name)
  }

  return (
    <div className="panel form-panel">
      <div className="panel-heading"><div><p className="eyebrow">NEW FILE</p><h2>Save a file</h2></div><button type="button" className="more-button" onClick={onCancel}><X size={16} /></button></div>
      <div className="upload-box" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); pick(e.dataTransfer.files[0]) }}>
        <span className="muted">{fileName || 'No file chosen'}</span>
        <div className="upload-actions"><button type="button" className="ghost-button" onClick={() => picker.current?.click()}><Upload size={13} /> Choose .lua / .txt</button></div>
        <input ref={picker} type="file" accept=".lua,.txt,text/plain" hidden onChange={e => { pick(e.target.files?.[0]); e.target.value = '' }} />
      </div>
      <label>Title<input value={title} onChange={e => setTitle(e.target.value)} placeholder="My notes" maxLength={120} /></label>
      <label>Description<textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional" style={{ minHeight: 70 }} /></label>
      <div className="form-footer">
        <span className="muted">{content ? `${content.split('\n').length.toLocaleString()} lines` : 'Content fills in from the file'}</span>
        <button className="primary-button" disabled={busy || !content} onClick={async () => { setBusy(true); try { const { id } = await createVaultFile({ title, description, content, fileName }); onSaved({ id, folderId: null, title: title.trim(), description: description.trim() || null, ext: /\.lua$/i.test(fileName) ? 'lua' : 'txt', createdAt: new Date() }) } finally { setBusy(false) } }}><Save size={13} /> {busy ? 'Saving…' : 'Save'}</button>
      </div>
    </div>
  )
}

function NewFolder({ onCancel, onSaved }: { onCancel: () => void; onSaved: (folder: VaultFolder, files: VaultFileMeta[]) => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [picked, setPicked] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const picker = useRef<HTMLInputElement>(null)

  function pick(list: FileList | null) {
    if (!list) return
    const found = Array.from(list).filter(f => /\.(lua|txt)$/i.test(f.name))
    if (!found.length) return alert('That folder has no .lua or .txt files.')
    setPicked(found)
    if (!title) { const rel = (found[0] as any).webkitRelativePath as string | undefined; if (rel?.includes('/')) setTitle(rel.split('/')[0]) }
  }

  return (
    <div className="panel form-panel">
      <div className="panel-heading"><div><p className="eyebrow">NEW FOLDER</p><h2>Save a folder</h2></div><button type="button" className="more-button" onClick={onCancel}><X size={16} /></button></div>
      <div className="upload-box">
        <span className="muted">{picked.length ? `${picked.length} .lua/.txt file${picked.length === 1 ? '' : 's'} found` : 'No folder chosen'}</span>
        <div className="upload-actions"><button type="button" className="ghost-button" onClick={() => picker.current?.click()}><FolderPlus size={13} /> Choose folder</button></div>
        {/* @ts-ignore webkitdirectory isn't in the HTML types but every browser supports it */}
        <input ref={picker} type="file" webkitdirectory="" directory="" multiple hidden onChange={e => { pick(e.target.files); e.target.value = '' }} />
      </div>
      <label>Folder title<input value={title} onChange={e => setTitle(e.target.value)} placeholder="My scripts" maxLength={120} /></label>
      <label>Description<textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional" style={{ minHeight: 70 }} /></label>
      <div className="form-footer">
        <span className="muted">Files keep their file name as the title</span>
        <button className="primary-button" disabled={busy || !picked.length || !title.trim()} onClick={async () => {
          setBusy(true)
          try {
            const read = await Promise.all(picked.map(async f => ({ fileName: f.name, content: (await f.text()).replace(/\r\n/g, '\n') })))
            const { id } = await createVaultFolder({ title, description, files: read })
            const now = new Date()
            onSaved({ id, title: title.trim(), description: description.trim() || null, createdAt: now }, read.map(r => ({ id: `${id}-${r.fileName}`, folderId: id, title: r.fileName.replace(/\.(lua|txt)$/i, ''), description: null, ext: /\.lua$/i.test(r.fileName) ? 'lua' : 'txt', createdAt: now })))
          } finally { setBusy(false) }
        }}><Save size={13} /> {busy ? 'Saving…' : 'Save'}</button>
      </div>
    </div>
  )
}
