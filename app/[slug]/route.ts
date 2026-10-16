import { db } from '@/lib/db'
import { scripts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [script] = await db.select({ source: scripts.source, visibility: scripts.visibility }).from(scripts).where(eq(scripts.slug, slug))
  if (!script) return new NextResponse('Not Found', { status: 404 })
  if (script.visibility !== 'public') return new NextResponse('<!doctype html><title>Private Code</title><main style="font-family:system-ui;padding:3rem">Private Code</main>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  return new NextResponse(script.source, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } })
}
