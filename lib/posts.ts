import { desc, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { posts, scripts } from '@/lib/db/schema'

const cols = { id: posts.id, title: posts.title, tag: posts.tag, content: posts.content, createdAt: posts.createdAt }
export const listPublicPosts = () => db.select(cols).from(posts).orderBy(desc(posts.createdAt))

export async function getPublicPost(id: string) {
  const [p] = await db
    .select({ ...cols, scriptId: posts.scriptId, showMode: posts.showMode, source: scripts.source, loadstring: scripts.loadstring, scriptVersion: scripts.updatedAt, hasImage: sql<boolean>`${scripts.image} is not null` })
    .from(posts)
    .leftJoin(scripts, eq(posts.scriptId, scripts.id))
    .where(eq(posts.id, id))
  return p
}