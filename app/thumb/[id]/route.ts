import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [p] = await db.select({ thumb: posts.thumb }).from(posts).where(eq(posts.id, id))
  const m = p?.thumb.match(/^data:(image\/[a-z]+);base64,(.+)$/)
  if (!m) return new Response('Not Found', { status: 404 })
  return new Response(Buffer.from(m[2], 'base64'), { headers: { 'Content-Type': m[1], 'Cache-Control': 'public, max-age=31536000, immutable' } })
}
