'use client'

import { useState, useMemo } from 'react'
import PostCard from '@/components/PostCard'
import type { PostWithAuthor } from '@/types/database'

const TOPICS = ['all', 'Development', 'Productivity', 'Business', 'Health', 'Finance']

export default function BrowseClient({ initialPosts }: { initialPosts: PostWithAuthor[] }) {
  const [query, setQuery]   = useState('')
  const [topic, setTopic]   = useState('all')

  const filtered = useMemo(() => {
    return initialPosts.filter(p => {
      const topicOk  = topic === 'all' || p.topic === topic
      const q        = query.toLowerCase()
      const searchOk = !q
        || p.title.toLowerCase().includes(q)
        || (p.excerpt ?? '').toLowerCase().includes(q)
        || p.topic.toLowerCase().includes(q)
        || p.tags.some(t => t.toLowerCase().includes(q))
        || (p.profiles?.display_name ?? '').toLowerCase().includes(q)
      return topicOk && searchOk
    })
  }, [initialPosts, query, topic])

  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = { all: initialPosts.length }
    TOPICS.slice(1).forEach(t => {
      counts[t] = initialPosts.filter(p => p.topic === t).length
    })
    return counts
  }, [initialPosts])

  const verified = initialPosts.filter(p => p.verified).length
  const avgTrust = initialPosts.length
    ? Math.round(initialPosts.reduce((s, p) => s + p.trust_score, 0) / initialPosts.length)
    : 0

  return (
    <div className="max-w-[1100px] mx-auto px-6 pb-24">
      {/* Header */}
      <div className="pt-14 pb-10">
        <p className="text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-[#4a9ebb] mb-3">discover</p>
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1c1a16] dark:text-[#f0ede8] mb-2">browse posts</h1>
        <p className="text-[#787068] text-sm">all posts from the community, vetted and trustworthy.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-8 items-start">

        {/* Feed column */}
        <div>
          {/* Search */}
          <div className="relative mb-5">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[#787068] w-4 h-4 pointer-events-none"
                 viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={query} onChange={e => setQuery(e.target.value)}
                   type="text" placeholder="search posts, topics, authors…"
                   className="w-full pl-11 pr-4 py-3 bg-[#e8e5e0] dark:bg-[#1e1e1e] rounded-xl border
                              border-black/[0.08] dark:border-[#f0ede8]/[0.08]
                              text-[#1c1a16] dark:text-[#f0ede8] placeholder:text-[#787068]
                              text-sm outline-none focus:border-[#4a9ebb]/40 transition-colors" />
          </div>

          {/* Mobile topic pills */}
          <div className="flex gap-2 flex-wrap mb-6 lg:hidden">
            {TOPICS.map(t => (
              <button key={t} onClick={() => setTopic(t)}
                      className={`topic-filter ${topic === t ? 'active' : ''}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Count */}
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs text-[#787068]">{filtered.length} post{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map(post => <PostCard key={post.id} post={post} />)}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-3xl mb-3">🔍</p>
              <p className="text-[#787068] text-sm">no posts match your search.</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="sticky top-[80px] hidden lg:block">
          <p className="text-[0.6rem] font-semibold tracking-[0.15em] uppercase text-[#787068] mb-3">topics</p>
          <div className="flex flex-col gap-1.5 mb-8">
            {TOPICS.map(t => (
              <button key={t} onClick={() => setTopic(t)}
                      className={`flex items-center justify-between gap-2 w-full text-left px-3 py-2 rounded-lg text-xs transition-colors
                                  ${topic === t
                                    ? 'font-semibold text-[#4a9ebb] bg-[rgba(74,158,187,0.1)]'
                                    : 'text-[#787068] hover:text-[#4a9ebb] hover:bg-[rgba(74,158,187,0.06)]'}`}>
                <span>{t === 'all' ? 'all posts' : t.toLowerCase()}</span>
                <span className="text-[0.6rem] tabular-nums opacity-60">{topicCounts[t] ?? 0}</span>
              </button>
            ))}
          </div>

          <p className="text-[0.6rem] font-semibold tracking-[0.15em] uppercase text-[#787068] mb-3">stats</p>
          <div className="flex flex-col gap-3">
            {[
              ['total posts',  initialPosts.length],
              ['verified',     `${verified} / ${initialPosts.length}`],
              ['avg trust',    `${avgTrust}%`],
            ].map(([label, value]) => (
              <div key={label as string} className="flex items-center justify-between">
                <span className="text-xs text-[#787068]">{label}</span>
                <span className="text-xs font-semibold text-[#1c1a16] dark:text-[#f0ede8]">{value}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
