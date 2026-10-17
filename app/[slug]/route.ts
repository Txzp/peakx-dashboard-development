import { db } from '@/lib/db'
import { scripts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

const TOOLS = /curl|wget|python|httpie|axios|node-fetch|undici|go-http|postman|insomnia|scrapy|okhttp|java\//i
const text = (body: string) => new NextResponse(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } })

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [script] = await db.select({ source: scripts.source, visibility: scripts.visibility }).from(scripts).where(eq(scripts.slug, slug))
  if (!script) return new NextResponse('Not Found', { status: 404 })
  const h = request.headers
  const browserLike = h.get('accept')?.includes('text/html') || h.has('sec-fetch-mode') || h.has('sec-fetch-dest') || h.has('origin') || h.has('referer')
  const toolLike = TOOLS.test(h.get('user-agent') ?? '')
  if (script.visibility !== 'public' || browserLike || toolLike) return text('Source Private')
  return text(script.source)
}