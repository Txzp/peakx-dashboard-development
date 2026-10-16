import Link from 'next/link'
import { PostCard, SiteShell } from '@/components/site'
import { listPublicPosts } from '@/lib/posts'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const latest = (await listPublicPosts()).slice(0, 6)
  return (
    <SiteShell active="home">
      <section className="site-hero">
        <p className="eyebrow">ROBLOX SCRIPTS HUB</p>
        <h1>Scripts built for <span>speed</span>.</h1>
        <p>Fresh, maintained Lua scripts for your favorite Roblox games, all in one place.</p>
        <div className="hero-actions"><Link href="/games" className="primary-button">Browse games →</Link></div>
      </section>
      {latest.length > 0 && <><h2 className="site-h2">Latest</h2><div className="site-grid">{latest.map((p, i) => <PostCard key={p.id} post={p} i={i} />)}</div></>}
    </SiteShell>
  )
}
