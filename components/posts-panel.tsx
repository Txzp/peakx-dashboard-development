'use client'

import { useState } from 'react'
import { ImagePlus, Rocket, Trash2 } from 'lucide-react'
import { createPost, deletePost } from '@/app/actions/posts'

export type PostItem = { id: string; title: string; tag: string; content: string; createdAt: Date }

async function toThumb(file: File) {
  const img = await createImageBitmap(file)
  const W = 800, H = 450, c = document.createElement('canvas')
  c.width = W; c.height = H
  const s = Math.max(W / img.width, H / img.height)
  c.getContext('2d')!.drawImage(img, (W - img.width * s) / 2, (H - img.height * s) / 2, img.width * s, img.height * s)
  return c.toDataURL('image/webp', 0.82)
}

export default function PostsPanel({ initialPosts, flash, scripts }: { initialPosts: PostItem[]; flash: (t: string) => void; scripts: { id: string; title: string }[] }) {
  const [posts, setPosts] = useState(initialPosts)
  const [thumb, setThumb] = useState('')
  const [title, setTitle] = useState('')
  const [tag, setTag] = useState('')
  const [content, setContent] = useState('')
  const [scriptId, setScriptId] = useState('')
  const [busy, setBusy] = useState(false)

  async function pick(f?: File) {
    if (!f || !f.type.startsWith('image/')) return flash('Choose an image file.')
    try { setThumb(await toThumb(f)) } catch { flash('Could not read that image.') }
  }
  async function publish() {
    if (!thumb || !title.trim() || !tag.trim() || !content.trim()) return flash('Add a thumbnail, title, tag and content first.')
    setBusy(true)
    try {
      const p = await createPost({ title, tag, content, thumb, scriptId: scriptId || undefined })
      setPosts([p, ...posts]); setThumb(''); setTitle(''); setTag(''); setContent(''); setScriptId('')
      flash(`[${p.title}] is live on the site`)
    } catch { flash('Could not publish this post.') } finally { setBusy(false) }
  }
  async function remove(p: PostItem) {
    if (!confirm(`Remove “${p.title}” from the site?`)) return
    await deletePost(p.id); setPosts(posts.filter(x => x.id !== p.id)); flash('Post removed')
  }

  return (
    <>
      <div className="editor-layout">
        <div className="panel form-panel">
          <div className="panel-heading"><div><p className="eyebrow">NEW POST</p><h2>Publish to the website</h2></div><span className="panel-index">peakx.site/games</span></div>
          <label>Thumbnail
            <span className="drop" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); pick(e.dataTransfer.files[0]) }}>
              {thumb ? <img src={thumb} alt="" /> : <span className="drop-hint"><ImagePlus size={22} />Click or drop an image (16:9)</span>}
              <input type="file" accept="image/*" onChange={e => pick(e.target.files?.[0])} />
            </span>
          </label>
          <label>Title<input value={title} onChange={e => setTitle(e.target.value)} placeholder="Steal and Escape Police" maxLength={120} /></label>
          <label>Tag<input value={tag} onChange={e => setTag(e.target.value)} list="tags" placeholder="Obby, Simulator, Tycoon…" maxLength={24} /></label>
          <datalist id="tags">{[...new Set(posts.map(p => p.tag))].map(t => <option key={t} value={t} />)}</datalist>
          <label>Script shown on the page<select value={scriptId} onChange={e => setScriptId(e.target.value)}><option value="">None (text only)</option>{scripts.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</select></label>
          <label>Description<textarea className="code-editor" style={{ minHeight: 180, font: 'inherit', fontSize: 13 }} value={content} onChange={e => setContent(e.target.value)} placeholder="Describe the script, features, how to use it…" /></label>
          <div className="form-footer"><span className="muted">{content.length.toLocaleString()} characters</span><button className="primary-button" disabled={busy} onClick={publish}><Rocket size={14} /> {busy ? 'Publishing…' : 'Publish'}</button></div>
        </div>
        <aside className="panel preview-panel">
          <div className="panel-heading"><div><p className="eyebrow">LIVE PREVIEW</p><h2>Card on the site</h2></div><span className="pulse-dot" /></div>
          <div className="site-card static">
            <div className="site-thumb">{thumb ? <img src={thumb} alt="" /> : null}<span className="site-tag">{tag || 'Tag'}</span></div>
            <div className="site-card-body"><h3>{title || 'Untitled'}</h3><p>{content.slice(0, 110) || 'Your description appears here.'}</p></div>
          </div>
        </aside>
      </div>
      {posts.length > 0 && (
        <div className="panel library-panel" style={{ marginTop: 16 }}>
          <div className="library-toolbar"><div><h2>Published</h2><span className="muted">{posts.length} on the site</span></div></div>
          <div className="script-list">{posts.map((p, i) => (
            <article className="script-row" key={p.id} style={{ '--i': i } as React.CSSProperties}>
              <img src={`/thumb/${p.id}`} alt="" className="mini-thumb" />
              <div className="script-main"><h3>{p.title}</h3><p>/games/{p.id}</p></div>
              <span className="badge public">{p.tag}</span>
              <div className="row-actions"><button className="danger-button" onClick={() => remove(p)}><Trash2 size={12} /> Remove</button></div>
            </article>
          ))}</div>
        </div>
      )}
    </>
  )
}
