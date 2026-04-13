import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import PostActions from './PostActions'

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: rawPost } = await supabase
    .from('posts')
    .select('*, profiles(display_name, avatar_url, expertise)')
    .eq('id', id)
    .single()

  if (!rawPost) notFound()
  const post = rawPost as any

  const { count: upvotes } = await supabase
    .from('votes').select('*', { count: 'exact', head: true })
    .eq('post_id', id).eq('type', 'upvote')

  const { count: vouches } = await supabase
    .from('votes').select('*', { count: 'exact', head: true })
    .eq('post_id', id).eq('type', 'vouch')

  const { data: comments } = await supabase
    .from('comments')
    .select('*, profiles(display_name)')
    .eq('post_id', id)
    .order('created_at', { ascending: true })

  const author = (post as any).profiles

  return (
    <main className="max-w-[740px] mx-auto px-6 py-12">

      {/* Back */}
      <Link href="/browse"
            className="inline-flex items-center gap-2 text-sm text-[#787068] hover:text-[#4a9ebb] transition-colors mb-10 group ws-muted">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             className="group-hover:-translate-x-0.5 transition-transform">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        back to posts
      </Link>

      {/* Header */}
      <header className="mb-10">
        <span className="text-[0.6rem] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full mb-4 inline-block"
              style={{ background: 'rgba(74,158,187,0.1)', color: '#4a9ebb' }}>
          {post.topic}
        </span>

        <h1 className="text-[1.9rem] font-extrabold text-[#1c1a16] dark:text-[#f0ede8] leading-tight tracking-tight mb-4">
          {post.title}
        </h1>

        <div className="flex items-center gap-3 flex-wrap mb-4">
          <span className="text-xs text-[#787068]">
            {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
          <span className="text-[#787068] text-xs">·</span>
          <span className="text-xs text-[#787068]">{post.read_time} min read</span>
          {post.verified && (
            <span className="text-[0.65rem] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(74,158,187,0.1)', color: '#4a9ebb' }}>
              ✓ peer verified · {post.trust_score}% legit
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-black/[0.07] dark:border-[#f0ede8]/[0.07]">
          <div className="w-9 h-9 rounded-full bg-[#e8e5e0] dark:bg-[#1e1e1e] border border-black/[0.08] dark:border-[#f0ede8]/[0.1]
                          flex items-center justify-center text-xs font-bold text-[#1c1a16] dark:text-[#f0ede8]">
            {(author?.display_name ?? 'A').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1c1a16] dark:text-[#f0ede8]">{author?.display_name ?? 'anonymous'}</p>
            {author?.expertise && <p className="text-xs text-[#787068]">{author.expertise}</p>}
          </div>
        </div>
      </header>

      {/* Article body */}
      <div className="prose mb-12"
           dangerouslySetInnerHTML={{ __html: post.content ?? '' }} />

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-12">
          {post.tags.map((t: string) => (
            <span key={t} className="text-xs font-medium px-3 py-1 rounded-full border"
                  style={{ background: 'rgba(74,158,187,0.08)', color: '#4a9ebb', borderColor: 'rgba(74,158,187,0.2)' }}>
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Interactive: votes, bookmark, comments */}
      <PostActions
        postId={post.id}
        initialUpvotes={upvotes ?? 0}
        initialVouches={vouches ?? 0}
        initialComments={comments ?? []}
      />
    </main>
  )
}
