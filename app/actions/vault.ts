'use server'

import { randomBytes } from 'crypto'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { vaultFiles, vaultFolders } from '@/lib/db/schema'
import { isOwner } from '@/lib/owner'

async function userId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !isOwner(session.user)) throw new Error('Unauthorized')
  return session.user.id
}
const refresh = () => revalidatePath('/23454-dashboard-peakx')
const extOf = (name: string) => (name.toLowerCase().endsWith('.lua') ? 'lua' : 'txt')
const nameOf = (name: string) => name.replace(/\.(lua|txt)$/i, '').slice(0, 120) || 'Untitled'

// Everything needed to render "My Files": folder + file metadata, no file content
// (content is fetched on demand with getVaultFile, same pattern as scripts).
export async function listVault() {
  const ownerId = await userId()
  const folders = await db.select().from(vaultFolders).where(eq(vaultFolders.ownerId, ownerId))
  const files = await db.select({ id: vaultFiles.id, folderId: vaultFiles.folderId, title: vaultFiles.title, description: vaultFiles.description, ext: vaultFiles.ext, createdAt: vaultFiles.createdAt }).from(vaultFiles).where(eq(vaultFiles.ownerId, ownerId))
  return { folders, files }
}

export async function getVaultFile(id: string) {
  const ownerId = await userId()
  const [file] = await db.select().from(vaultFiles).where(and(eq(vaultFiles.id, id), eq(vaultFiles.ownerId, ownerId)))
  return file
}

export async function createVaultFile(input: { title: string; description: string; content: string; fileName: string }) {
  const ownerId = await userId()
  const title = input.title.trim().slice(0, 120)
  const content = input.content.slice(0, 1000000)
  if (!title || !content.trim()) throw new Error('Add a title and a file.')
  const id = randomBytes(4).toString('hex')
  await db.insert(vaultFiles).values({ id, ownerId, folderId: null, title, description: input.description.trim().slice(0, 500) || null, content, ext: extOf(input.fileName) })
  refresh()
  return { id }
}

export async function updateVaultFile(input: { id: string; title: string; description: string; content: string }) {
  const ownerId = await userId()
  const title = input.title.trim().slice(0, 120)
  if (!title || !input.content.trim()) throw new Error('Add a title and content.')
  await db.update(vaultFiles).set({ title, description: input.description.trim().slice(0, 500) || null, content: input.content.slice(0, 1000000) }).where(and(eq(vaultFiles.id, input.id), eq(vaultFiles.ownerId, ownerId)))
  refresh()
}

export async function deleteVaultFile(id: string) {
  const ownerId = await userId()
  await db.delete(vaultFiles).where(and(eq(vaultFiles.id, id), eq(vaultFiles.ownerId, ownerId)))
  refresh()
}

// Creates a folder and every .lua/.txt file dropped into it in one go. Each file's
// title comes from its file name; folder files never get a description.
export async function createVaultFolder(input: { title: string; description: string; files: { fileName: string; content: string }[] }) {
  const ownerId = await userId()
  const title = input.title.trim().slice(0, 120)
  if (!title) throw new Error('Name the folder.')
  if (input.files.length > 500) throw new Error('Too many files in one folder (500 max).')
  const id = randomBytes(4).toString('hex')
  await db.insert(vaultFolders).values({ id, ownerId, title, description: input.description.trim().slice(0, 500) || null })
  if (input.files.length) {
    await db.insert(vaultFiles).values(
      input.files.map(f => ({ id: randomBytes(4).toString('hex'), ownerId, folderId: id, title: nameOf(f.fileName), description: null, content: f.content.slice(0, 1000000), ext: extOf(f.fileName) }))
    )
  }
  refresh()
  return { id }
}

export async function deleteVaultFolder(id: string) {
  const ownerId = await userId()
  await db.delete(vaultFiles).where(and(eq(vaultFiles.folderId, id), eq(vaultFiles.ownerId, ownerId)))
  await db.delete(vaultFolders).where(and(eq(vaultFolders.id, id), eq(vaultFolders.ownerId, ownerId)))
  refresh()
}
