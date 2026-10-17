'use server'

import { randomBytes } from 'crypto'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { posts, scripts } from '@/lib/db/schema'
import { isOwner } from '@/lib/owner'

async function owner() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !isOwner(session.user)) throw new Error('Unauthorized')
  return session.user.id
}
const refresh = () => { revalidatePath('/'); revalidatePath('/games') }

export async function createPost(input: { title: string; tag: string; content: string; thumb: string; scriptId?: string; showMode?: 'source' | 'loadstring' }) {
  const uid = await owner()
  const title = input.title.trim().slice(0, 120), tag = input.tag.trim().slice(0, 24), content = input.content.trim()
  if (!title || !tag || !content || content.length > 20000) throw new Error('Invalid post.')
  if (!/^data:image\/(webp|jpeg|png);base64,/.test(input.thumb) || input.thumb.length > 600000) throw new Error('Invalid thumbnail.')
  let scriptId: string | null = null
  const showMode = input.showMode === 'loadstring' ? 'loadstring' : 'source'
  if (input.scriptId) {
    const [s] = await db.select({ id: scripts.id, visibility: scripts.visibility }).from(scripts).where(and(eq(scripts.id, input.scriptId), eq(scripts.ownerId, uid)))
    if (!s) throw new Error('Script not found.')
    if (showMode === 'loadstring' && s.visibility !== 'public') throw new Error('Set the script to Public first.')
    scriptId = s.id
  }
  const id = randomBytes(4).toString('hex')
  await db.insert(posts).values({ id, title, tag, content, thumb: input.thumb, scriptId, showMode: scriptId ? showMode : null })
  refresh()
  return { id, title, tag, content, createdAt: new Date() }
}

export async function deletePost(id: string) { await owner(); await db.delete(posts).where(eq(posts.id, id)); refresh() }
