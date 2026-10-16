import { db } from '@/lib/db'
import { scripts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [script] = await db.select({ source: scripts.source, visibility: scripts.visibility }).from(scripts).where(eq(scripts.slug, slug))
  if (!script) return new NextResponse('Not Found', { status: 404 })

  const acceptsHtml = request.headers.get('accept')?.includes('text/html')
  if (script.visibility !== 'public' || acceptsHtml) {
    return new NextResponse('Source Private', { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } })
  }

  return new NextResponse(script.source, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } })
}
