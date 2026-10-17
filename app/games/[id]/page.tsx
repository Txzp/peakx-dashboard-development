import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CodeBlock } from '@/components/code-block'
import { SiteShell, date } from '@/components/site'
import { getPublicPost } from '@/lib/posts'

export const dynamic = 'force-dynamic'

export default async function Post({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPublicPost(id)
  if (!post) notFound()
  return (
    <SiteShell active="games">
      <article className="site-article">
        <Link href="/games" className="back">← Games</Link>
        <img src={`/thumb/${post.id}`} alt="" className="article-thumb" />
        <div className="article-meta"><span className="site-tag static">{post.tag}</span><small>{date(post.createdAt)}</small></div>
        <h1>{post.title}</h1>
        <div className="article-body">{post.content}</div>
        {(post.showMode === 'loadstring' ? post.loadstring : post.source) && (
          <CodeBlock
            code={(post.showMode === 'loadstring' ? post.loadstring : post.source)!}
            collapse={post.showMode !== 'loadstring'}
            label={post.showMode === 'loadstring' ? 'Loadstring' : 'Lua'}
            image={post.hasImage && post.scriptId ? `/simg/${post.scriptId}?v=${new Date(post.scriptVersion!).getTime()}` : undefined}
          />
        )}
      </article>
    </SiteShell>
  )
}