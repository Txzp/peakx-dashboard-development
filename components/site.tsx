import Link from 'next/link'
import { ArrowUpRightIcon } from '@/components/icons/arrow-up-right'
import { ChevronRightIcon } from '@/components/icons/chevron-right'
import { LightningBg } from '@/components/lightning-bg'

const LOGO = '/peakx-logo.png'
const DISCORD = 'https://discord.gg/NtaW8MjZfX'
export type PublicPost = { id: string; title: string; tag: string; content: string; createdAt: Date }
const date = (d: Date) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(d))

export function SiteShell({ active, children }: { active?: 'home' | 'games' | 'exe'; children: React.ReactNode }) {
  const link = (href: string, label: string, key: 'home' | 'games' | 'exe') => (
    <Link href={href} className={active === key ? 'on' : ''}>{label}<ChevronRightIcon className="nav-chevron" /></Link>
  )
  return (
    <div className="site">
      <div className="site-bg" aria-hidden="true">
        <i className="blob b1" /><i className="blob b2" /><i className="blob b3" /><i className="blob b4" />
        <LightningBg />
        <i className="vignette" />
      </div>
      <header className="site-nav">
        <nav>
          {link('/', 'Home', 'home')}
          {link('/games', 'Games', 'games')}
          {link('/exe', 'Exe', 'exe')}
        </nav>
      </header>
      <main className="site-main">{children}</main>
      <footer className="site-footer">
        <span>© {new Date().getFullYear()} Peakx</span>
        <a href={DISCORD} target="_blank" rel="noreferrer">Discord</a>
      </footer>
    </div>
  )
}

// Thumbnail + name only — the rest only shows once you open the game.
export function PostCard({ post, i = 0 }: { post: PublicPost; i?: number }) {
  return (
    <Link href={`/games/${post.id}`} className="site-card" style={{ '--i': i } as React.CSSProperties}>
      <div className="site-thumb"><img src={`/thumb/${post.id}`} alt="" loading="lazy" /></div>
      <div className="site-card-body"><h3>{post.title}</h3><span className="site-card-arrow"><ArrowUpRightIcon size={15} /></span></div>
    </Link>
  )
}
export { LOGO, date }
