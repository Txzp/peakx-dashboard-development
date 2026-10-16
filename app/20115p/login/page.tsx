import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { isOwner } from '@/lib/owner'
import { AuthForm } from '@/components/auth-form'
export default async function LoginPage() { const session = await auth.api.getSession({ headers: await headers() }); if (isOwner(session?.user)) redirect('/20115p'); return <AuthForm /> }
