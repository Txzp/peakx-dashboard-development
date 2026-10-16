import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'

const cols = { id: posts.id, title: posts.title, tag: posts.tag, content: posts.content, createdAt: posts.createdAt }
export const listPublicPosts = () => db.select(cols).from(posts).orderBy(desc(posts.createdAt))
export async function getPublicPost(id: string) { const [p] = await db.select(cols).from(posts).where(eq(posts.id, id)); return p }
