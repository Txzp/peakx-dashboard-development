import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { listScripts } from '@/app/actions/scripts'
import { listPublicPosts } from '@/lib/posts'
import { isOwner } from '@/lib/owner'
import Dashboard from '@/components/dashboard'

export default async function DashboardPage() { const session = await auth.api.getSession({ headers: await headers() }); if (!isOwner(session?.user)) redirect('/20115p/login'); const scripts = await listScripts(); const posts = await listPublicPosts(); return <Dashboard user={session.user} initialScripts={scripts} initialPosts={posts} /> }
