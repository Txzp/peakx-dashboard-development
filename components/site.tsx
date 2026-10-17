import Link from 'next/link'

const LOGO = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/PKXlogo-removebg-Jugkol20SD6kLubnS7gILTyCgv7Ygo.png'
export type PublicPost = { id: string; title: string; tag: string; content: string; createdAt: Date }
const date = (d: Date) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(d))

export function SiteShell({ active, children }: { active?: 'home' | 'games'; children: React.ReactNode }) {
  return (
    <div className="site">
      <div className="aurora" aria-hidden="true"><i /><i /><i /><i /></div><div className="ambient-grid" aria-hidden="true" />
      <header className="site-nav">
        <Link href="/" className="site-brand"><img className="brand-logo" src={LOGO} alt="" />PEAKX</Link>
        <nav>
          <Link href="/" className={active === 'home' ? 'on' : ''}>Home</Link>
          <Link href="/games" className={active === 'games' ? 'on' : ''}>Games</Link>
        </nav>
      </header>
      <main className="site-main">{children}</main>
      <footer className="site-footer">© {new Date().getFullYear()} Peakx</footer>
    </div>
  )
}

export function PostCard({ post, i = 0 }: { post: PublicPost; i?: number }) {
  return (
    <Link href={`/games/${post.id}`} className="site-card" style={{ '--i': i } as React.CSSProperties}>
      <div className="site-thumb"><img src={`/thumb/${post.id}`} alt="" loading="lazy" /><span className="site-tag">{post.tag}</span></div>
      <div className="site-card-body"><h3>{post.title}</h3><p>{post.content.slice(0, 110)}{post.content.length > 110 ? '…' : ''}</p><small>{date(post.createdAt)}</small></div>
    </Link>
  )
}
export { date }
