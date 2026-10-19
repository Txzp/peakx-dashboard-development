import Link from 'next/link'
import { ArrowUpRightIcon } from '@/components/icons/arrow-up-right'
import { ChevronRightIcon } from '@/components/icons/chevron-right'

const LOGO = '/peakx-logo.png'
export type PublicPost = { id: string; title: string; tag: string; content: string; createdAt: Date }
const date = (d: Date) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(d))

export function SiteShell({ active, children }: { active?: 'home' | 'games' | 'exe'; children: React.ReactNode }) {
  const link = (href: string, label: string, key: 'home' | 'games' | 'exe') => (
    <Link href={href} className={active === key ? 'on' : ''}>{label}<ChevronRightIcon className="nav-chevron" /></Link>
  )
  return (
    <div className="site">
      <div className="site-bg" aria-hidden="true"><i className="orb orb-a" /><i className="orb orb-b" /><i className="sheen" /><i className="grain" /><i className="vignette" /></div>
      <header className="site-nav">
        <nav>
          {link('/', 'Home', 'home')}
          {link('/games', 'Games', 'games')}
          {link('/exe', 'Exe', 'exe')}
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
      <div className="site-card-body">
        <div className="site-card-text"><h3>{post.title}</h3><p>{post.content.slice(0, 100)}{post.content.length > 100 ? '…' : ''}</p></div>
        <span className="site-card-arrow"><ArrowUpRightIcon size={15} /></span>
      </div>
      <small className="site-card-date">{date(post.createdAt)}</small>
    </Link>
  )
}
export { LOGO, date }
