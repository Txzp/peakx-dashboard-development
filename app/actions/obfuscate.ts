'use server'

import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { scripts } from '@/lib/db/schema'
import { isOwner } from '@/lib/owner'
import { downloadJob, getRecommendedNode, queueJob, waitForJob } from '@/lib/luraph'


async function owner() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !isOwner(session.user)) throw new Error('Unauthorized')
  return session.user.id
}

// Queues a brand-new obfuscation job for a script and waits for it to finish.
export async function obfuscateScript(id: string): Promise<{ status: string; error?: string }> {
  const ownerId = await owner()
  const where = and(eq(scripts.id, id), eq(scripts.ownerId, ownerId))
  const apiKey = process.env.LURAPH_API_KEY
  if (!apiKey) {
    await db.update(scripts).set({ obfStatus: 'error', obfError: 'Missing LURAPH_API_KEY.' }).where(where)
    revalidatePath('/23454-dashboard-peakx')
    return { status: 'error', error: 'Missing LURAPH_API_KEY.' }
  }

  const [script] = await db.select({ source: scripts.source, slug: scripts.slug }).from(scripts).where(where)
  if (!script) throw new Error('Script not found.')

  await db.update(scripts).set({ obfStatus: 'running', obfError: null }).where(where)
  revalidatePath('/23454-dashboard-peakx')

  try {
    const node = await getRecommendedNode(apiKey)
    const jobId = await queueJob(apiKey, node, script.source, `${script.slug}.lua`)
    await db.update(scripts).set({ obfJobId: jobId }).where(where)

    const result = await waitForJob(apiKey, jobId)
    if (!result.success) {
      await db.update(scripts).set({ obfStatus: 'error', obfError: result.error || 'Obfuscation failed.' }).where(where)
      revalidatePath('/23454-dashboard-peakx')
      return { status: 'error', error: result.error ?? undefined }
    }

    const obfuscated = await downloadJob(apiKey, jobId)
    await db.update(scripts).set({ obfuscated, obfStatus: 'ready', obfError: null }).where(where)
    revalidatePath('/23454-dashboard-peakx')
    revalidatePath(`/${script.slug}`)
    return { status: 'ready' }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Obfuscation failed.'
    await db.update(scripts).set({ obfStatus: 'error', obfError: msg }).where(where)
    revalidatePath('/23454-dashboard-peakx')
    return { status: 'error', error: msg }
  }
}

// Re-checks a job that's already queued instead of spending a new obfuscation on every retry.
export async function retryObfuscationCheck(id: string): Promise<{ status: string; error?: string }> {
  const ownerId = await owner()
  const where = and(eq(scripts.id, id), eq(scripts.ownerId, ownerId))
  const apiKey = process.env.LURAPH_API_KEY
  const [script] = await db.select({ obfJobId: scripts.obfJobId, slug: scripts.slug }).from(scripts).where(where)
  if (!apiKey || !script?.obfJobId) return obfuscateScript(id)

  try {
    const result = await waitForJob(apiKey, script.obfJobId, 1)
    if (!result.success) {
      await db.update(scripts).set({ obfStatus: 'error', obfError: result.error || 'Obfuscation failed.' }).where(where)
      revalidatePath('/23454-dashboard-peakx')
      return { status: 'error', error: result.error ?? undefined }
    }
    const obfuscated = await downloadJob(apiKey, script.obfJobId)
    await db.update(scripts).set({ obfuscated, obfStatus: 'ready', obfError: null }).where(where)
    revalidatePath('/23454-dashboard-peakx')
    revalidatePath(`/${script.slug}`)
    return { status: 'ready' }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Obfuscation failed.'
    await db.update(scripts).set({ obfStatus: 'error', obfError: msg }).where(where)
    revalidatePath('/23454-dashboard-peakx')
    return { status: 'error', error: msg }
  }
}
