import { ArrowUpRightIcon } from '@/components/icons/arrow-up-right'
import { SiteShell } from '@/components/site'
import { Exploit, getExploits, typeLabel } from '@/lib/weao'
import Link from 'next/link'

export const metadata = { title: 'Exe — Peakx' }

function Bar({ label, value }: { label: string; value?: number }) {
  if (value == null) return null
  return <div className="exe-score"><span><b>{label}</b>{value}%</span><i><b style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></i></div>
}

function Card({ e, i }: { e: Exploit; i: number }) {
  return (
    <article className="exe-card" style={{ '--i': i } as React.CSSProperties}>
      <div className="exe-head"><h3>{e.title}</h3>{e.version && <span>v{e.version}</span>}</div>
      <div className="exe-chips">
        {e.platform && <span className="exe-chip neutral">{e.platform}{typeLabel(e.type) ? ` · ${typeLabel(e.type)}` : ''}</span>}
        <span className={`exe-chip ${e.free ? 'good' : 'neutral'}`}>{e.free ? 'Free' : e.cost || 'Paid'}</span>
        <span className={`exe-chip ${e.updateStatus ? 'good' : 'bad'}`}>{e.updateStatus ? 'Updated' : 'Outdated'}</span>
        <span className={`exe-chip ${e.detected ? 'bad' : 'good'}`}>{e.detected ? 'Detected' : 'Undetected'}</span>
      </div>
      {(e.uncPercentage != null || e.suncPercentage != null) && (
        <div className="exe-scores"><Bar label="UNC" value={e.uncPercentage} /><Bar label="sUNC" value={e.suncPercentage} /></div>
      )}
      <div className="exe-links">
        {e.websitelink && <a href={e.websitelink} target="_blank" rel="noreferrer">Website <ArrowUpRightIcon size={12} /></a>}
        {e.discordlink && <a href={e.discordlink} target="_blank" rel="noreferrer">Discord <ArrowUpRightIcon size={12} /></a>}
        {!e.free && e.purchaselink && <a href={e.purchaselink} target="_blank" rel="noreferrer">Buy <ArrowUpRightIcon size={12} /></a>}
      </div>
    </article>
  )
}

export default async function ExePage({ searchParams }: { searchParams: Promise<{ platform?: string }> }) {
  const { platform } = await searchParams
  let exploits: Exploit[] = []
  let failed = false
  try { exploits = await getExploits() } catch { failed = true }

  const platforms = [...new Set(exploits.map(e => e.platform).filter(Boolean))] as string[]
  const shown = platform ? exploits.filter(e => e.platform === platform) : exploits

  return (
    <SiteShell active="exe">
      <section className="site-hero small"><p className="eyebrow">LIVE STATUS</p><h1>Exe</h1><p>Real-time executor status, powered by WEAO.</p></section>
      {platforms.length > 1 && (
        <div className="exe-toolbar">
          <Link href="/exe" className={!platform ? 'chip on' : 'chip'}>All</Link>
          {platforms.map(p => <Link key={p} href={`/exe?platform=${encodeURIComponent(p)}`} className={platform === p ? 'chip on' : 'chip'}>{p}</Link>)}
        </div>
      )}
      {failed ? (
        <div className="exe-empty">Status temporarily unavailable — try again in a moment.</div>
      ) : shown.length === 0 ? (
        <div className="exe-empty">Nothing to show right now.</div>
      ) : (
        <div className="exe-grid">{shown.map((e, i) => <Card key={e._id} e={e} i={i} />)}</div>
      )}
    </SiteShell>
  )
}
