import { db } from '@/lib/db'
import { scripts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

const text = (body: string) => new NextResponse(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } })

// This route never serves the real source — only the Luraph-obfuscated copy. The
// original stays in the `source` column, readable only inside /23454-dashboard-peakx.
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [script] = await db.select({ obfuscated: scripts.obfuscated, visibility: scripts.visibility }).from(scripts).where(eq(scripts.slug, slug))
  if (!script) return new NextResponse('Not Found', { status: 404 })

  const acceptsHtml = request.headers.get('accept')?.includes('text/html')
  if (script.visibility !== 'public' || acceptsHtml) return text('Source Private')
  if (!script.obfuscated) return text('-- Protecting this script, try again in a moment.')
  return text(script.obfuscated)
}
