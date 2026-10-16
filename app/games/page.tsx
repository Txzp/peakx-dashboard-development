import Link from 'next/link'
import { PostCard, SiteShell } from '@/components/site'
import { listPublicPosts } from '@/lib/posts'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Games — Peakx' }

export default async function Games({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const { tag } = await searchParams
  const all = await listPublicPosts()
  const tags = [...new Set(all.map(p => p.tag))]
  const shown = tag ? all.filter(p => p.tag === tag) : all
  return (
    <SiteShell active="games">
      <section className="site-hero small"><p className="eyebrow">LIBRARY</p><h1>Games</h1></section>
      <div className="chips"><Link href="/games" className={!tag ? 'chip on' : 'chip'}>All</Link>{tags.map(t => <Link key={t} href={`/games?tag=${encodeURIComponent(t)}`} className={tag === t ? 'chip on' : 'chip'}>{t}</Link>)}</div>
      {shown.length ? <div className="site-grid">{shown.map((p, i) => <PostCard key={p.id} post={p} i={i} />)}</div> : <p className="muted" style={{ textAlign: 'center', padding: 60 }}>Nothing here yet.</p>}
    </SiteShell>
  )
}
