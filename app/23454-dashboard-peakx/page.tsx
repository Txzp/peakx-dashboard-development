import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { listScripts } from '@/app/actions/scripts'
import { listPublicPosts } from '@/lib/posts'
import { listVault } from '@/app/actions/vault'
import { isOwner } from '@/lib/owner'
import Dashboard from '@/components/dashboard'

// Needed so the obfuscation server action (up to ~60s) has time to finish.
export const maxDuration = 60

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!isOwner(session?.user)) redirect('/23454-dashboard-peakx/login')
  const scripts = await listScripts()
  const posts = await listPublicPosts()
  const { folders, files } = await listVault()
  return <Dashboard user={session!.user} initialScripts={scripts} initialPosts={posts} initialFolders={folders} initialFiles={files} />
}