'use server'

import { auth } from '@/lib/auth'
import { isOwner } from '@/lib/owner'
import { db } from '@/lib/db'
import { scripts } from '@/lib/db/schema'
import { and, desc, eq, sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { randomBytes } from 'crypto'

async function userId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !isOwner(session.user)) throw new Error('Unauthorized')
  return session.user.id
}
const okImg = (s?: string) => !s || (/^data:image\/(webp|jpeg|png);base64,/.test(s) && s.length < 400000)
const slugify = (title: string) => title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'script'
const publicUrl = (slug: string) => `${process.env.BETTER_AUTH_URL || 'https://peakx.site'}/${slug}`

export async function listScripts() { const ownerId = await userId(); return db.select({ id: scripts.id, title: scripts.title, slug: scripts.slug, visibility: scripts.visibility, version: scripts.version, createdAt: scripts.createdAt, updatedAt: scripts.updatedAt, loadstring: scripts.loadstring, hasImage: sql<boolean>`${scripts.image} is not null` }).from(scripts).where(eq(scripts.ownerId, ownerId)).orderBy(desc(scripts.createdAt)) }
export async function getScript(id: string) { const ownerId = await userId(); const [script] = await db.select().from(scripts).where(and(eq(scripts.id, id), eq(scripts.ownerId, ownerId))); return script }
export async function createScript(input: { title: string; visibility: 'private' | 'public'; source: string; image?: string }) { const ownerId = await userId(); const title = input.title.trim(); const source = input.source.trim(); if (!title || title.length > 120 || !source || source.length > 1000000) throw new Error('Enter a valid title and Lua source.'); if (!okImg(input.image)) throw new Error('Invalid image.'); const id = randomBytes(4).toString('hex'); const slug = `${slugify(title)}-${id}`; const loadstring = `loadstring(game:HttpGet("${publicUrl(slug)}"))()`; await db.insert(scripts).values({ id, ownerId, title, slug, source, visibility: input.visibility, version: 'v1.0.0', loadstring, image: input.image || null }); revalidatePath('/20115p'); return { id, title, slug, loadstring } }
export async function updateScript(input: { id: string; title: string; visibility: 'private' | 'public'; source: string; image?: string }) { const ownerId = await userId(); const existing = await getScript(input.id); if (!existing) throw new Error('Script not found.'); const changed = existing.title !== input.title.trim() || existing.visibility !== input.visibility || existing.source !== input.source; await db.update(scripts).set({ image: input.image === undefined || !okImg(input.image) ? existing.image : input.image || null, title: input.title.trim(), visibility: input.visibility, source: input.source, version: changed ? `v1.0.${Number(existing.version.split('.').at(-1) ?? 0) + 1}` : existing.version, updatedAt: new Date() }).where(and(eq(scripts.id, input.id), eq(scripts.ownerId, ownerId))); revalidatePath('/20115p'); revalidatePath(`/${existing.slug}`); return { changed } }
export async function deleteScript(id: string) { const ownerId = await userId(); await db.delete(scripts).where(and(eq(scripts.id, id), eq(scripts.ownerId, ownerId))); revalidatePath('/20115p') }
