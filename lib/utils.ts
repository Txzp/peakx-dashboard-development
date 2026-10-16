import { desc, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { posts, scripts } from '@/lib/db/schema'

const cols = { id: posts.id, title: posts.title, tag: posts.tag, content: posts.content, createdAt: posts.createdAt }
export const listPublicPosts = () => db.select(cols).from(posts).orderBy(desc(posts.createdAt))

// A post can link to one of your scripts: the page then shows that script's source in a code block.
export async function getPublicPost(id: string) {
  const [p] = await db
    .select({ ...cols, scriptId: posts.scriptId, source: scripts.source, scriptVersion: scripts.updatedAt, hasImage: sql<boolean>`${scripts.image} is not null` })
    .from(posts)
    .leftJoin(scripts, eq(posts.scriptId, scripts.id))
    .where(eq(posts.id, id))
  return p
}
