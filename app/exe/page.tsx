import { SiteShell } from '@/components/site'

export const metadata = { title: 'Exe — Peakx' }

// Placeholder page for the new "Exe" nav link — tell me what should live here
// (your executor, a download, docs...) and I'll build it out.
export default function ExePage() {
  return (
    <SiteShell active="exe">
      <section className="site-hero small">
        <p className="eyebrow">COMING SOON</p>
        <h1>Exe</h1>
        <p>This page is still being built.</p>
      </section>
    </SiteShell>
  )
}
