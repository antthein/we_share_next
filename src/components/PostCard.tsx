'use client'

import { useRouter } from 'next/navigation'
import type { PostWithAuthor } from '@/types/database'

function initials(name: string | null) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function PostCard({ post }: { post: PostWithAuthor }) {
  const router = useRouter()

  return (
    <article
      onClick={() => router.push(`/post/${post.id}`)}
      className="flex flex-col gap-3 p-5 rounded-xl border transition-all duration-200 cursor-pointer
                 bg-[#e8e5e0] border-black/[0.08] dark:bg-[#1e1e1e] dark:border-[#f0ede8]/[0.08]
                 hover:border-[#4a9ebb]/30 hover:-translate-y-0.5"
    >
      {/* Topic + bookmark row */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-[0.6rem] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(74,158,187,0.1)', color: '#4a9ebb' }}>
          {post.topic}
        </span>
        {post.verified && (
          <span className="text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ml-auto"
                style={{ background: 'rgba(74,158,187,0.1)', color: '#4a9ebb' }}>
            ✓ {post.trust_score}%
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-[0.9rem] font-bold leading-snug text-[#1c1a16] dark:text-[#f0ede8]">
        {post.title}
      </h3>

      {/* Excerpt */}
      <p className="text-sm text-[#787068] leading-relaxed line-clamp-2">
        {post.excerpt}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-black/[0.06] dark:border-[#f0ede8]/[0.05]">
        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[0.6rem] font-bold
                        bg-[#1c1a16]/[0.08] text-[#1c1a16] dark:bg-[#f0ede8]/[0.08] dark:text-[#f0ede8]">
          {initials(post.profiles?.display_name ?? null)}
        </div>
        <span className="text-xs text-[#787068] truncate">{post.profiles?.display_name ?? 'anonymous'}</span>
        <span className="text-xs text-[#787068] ml-auto shrink-0">{post.read_time} min</span>
      </div>
    </article>
  )
}
