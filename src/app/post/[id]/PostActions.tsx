'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { showToast } from '@/components/Toast'

type Comment = {
  id: string
  text: string
  created_at: string
  profiles: { display_name: string | null } | null
}

export default function PostActions({
  postId,
  initialUpvotes,
  initialVouches,
  initialComments,
}: {
  postId: string
  initialUpvotes: number
  initialVouches: number
  initialComments: Comment[]
}) {
  const { user } = useAuth()
  const supabase = createClient()

  const [upvotes, setUpvotes]   = useState(initialUpvotes)
  const [vouches, setVouches]   = useState(initialVouches)
  const [upvoted, setUpvoted]   = useState(false)
  const [vouched, setVouched]   = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [name, setName]         = useState('')
  const [text, setText]         = useState('')

  async function handleUpvote() {
    if (!user) { showToast('log in to upvote'); return }
    if (upvoted) {
      await supabase.from('votes').delete().eq('post_id', postId).eq('user_id', user.id).eq('type', 'upvote')
      setUpvotes(v => v - 1); setUpvoted(false); showToast('upvote removed')
    } else {
      await supabase.from('votes').insert({ post_id: postId, user_id: user.id, type: 'upvote' })
      setUpvotes(v => v + 1); setUpvoted(true); showToast('upvoted!')
    }
  }

  async function handleVouch() {
    if (!user) { showToast('log in to vouch'); return }
    if (vouched) {
      await supabase.from('votes').delete().eq('post_id', postId).eq('user_id', user.id).eq('type', 'vouch')
      setVouches(v => v - 1); setVouched(false); showToast('vouch removed')
    } else {
      await supabase.from('votes').insert({ post_id: postId, user_id: user.id, type: 'vouch' })
      setVouches(v => v + 1); setVouched(true); showToast('vouched!')
    }
  }

  async function handleBookmark() {
    if (!user) { showToast('log in to bookmark'); return }
    if (bookmarked) {
      await supabase.from('bookmarks').delete().eq('post_id', postId).eq('user_id', user.id)
      setBookmarked(false); showToast('removed from bookmarks')
    } else {
      await supabase.from('bookmarks').insert({ post_id: postId, user_id: user.id })
      setBookmarked(true); showToast('saved to bookmarks')
    }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!user) { showToast('log in to comment'); return }
    const t = text.trim()
    if (!t) return

    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: user.id, text: t })
      .select('*, profiles(display_name)')
      .single()

    if (!error && data) {
      setComments(prev => [...prev, data as unknown as Comment])
      setText('')
      showToast('comment posted!')
    }
  }

  return (
    <div>
      {/* Vote / bookmark bar */}
      <div className="flex items-center gap-3 flex-wrap mb-14 pt-4 border-t border-black/[0.07] dark:border-[#f0ede8]/[0.07]">
        <button onClick={handleUpvote} className={`vote-btn ${upvoted ? 'voted' : ''}`}>
          ▲ <span>{upvotes}</span> upvotes
        </button>
        <button onClick={handleVouch} className={`vote-btn ${vouched ? 'voted' : ''}`}>
          ✓ <span>{vouches}</span> vouches
        </button>
        <button onClick={handleBookmark}
                className={`bookmark-btn ml-auto flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-all
                            ${bookmarked
                              ? 'border-[#4a9ebb]/40 text-[#4a9ebb] bg-[rgba(74,158,187,0.08)]'
                              : 'border-black/[0.08] dark:border-[#f0ede8]/[0.08] text-[#787068] hover:border-[#4a9ebb]/40 hover:text-[#4a9ebb]'}`}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          {bookmarked ? 'saved' : 'save'}
        </button>
      </div>

      {/* Comments */}
      <section>
        <h2 className="text-base font-bold text-[#1c1a16] dark:text-[#f0ede8] mb-6">
          comments {comments.length > 0 && <span className="text-[#787068] font-normal text-sm">({comments.length})</span>}
        </h2>

        {comments.length === 0 && (
          <p className="text-sm text-[#787068] mb-8">no comments yet — be the first to start the discussion.</p>
        )}

        <div className="flex flex-col gap-4 mb-8">
          {comments.map(c => (
            <div key={c.id} className="comment-item">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-black/[0.1] dark:bg-white/[0.1] flex items-center justify-center text-[0.6rem] font-bold text-[#1c1a16] dark:text-[#f0ede8]">
                  {(c.profiles?.display_name ?? 'A').slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-[#1c1a16] dark:text-[#f0ede8]">{c.profiles?.display_name ?? 'anonymous'}</span>
                <span className="text-xs text-[#787068] ml-auto">
                  {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="text-sm text-[#787068] leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>

        {/* Comment form */}
        <form onSubmit={handleComment} className="flex flex-col gap-3">
          {!user && (
            <input value={name} onChange={e => setName(e.target.value)}
                   type="text" placeholder="your name"
                   className="w-full px-4 py-3 rounded-lg border bg-[#e8e5e0] dark:bg-[#1e1e1e]
                              border-black/[0.08] dark:border-[#f0ede8]/[0.08]
                              text-[#1c1a16] dark:text-[#f0ede8] placeholder:text-[#787068]
                              text-sm outline-none focus:border-[#4a9ebb]/40 transition-colors" />
          )}
          <textarea value={text} onChange={e => setText(e.target.value)}
                    rows={3} placeholder="add to the discussion…"
                    className="w-full px-4 py-3 rounded-lg border bg-[#e8e5e0] dark:bg-[#1e1e1e]
                               border-black/[0.08] dark:border-[#f0ede8]/[0.08]
                               text-[#1c1a16] dark:text-[#f0ede8] placeholder:text-[#787068]
                               text-sm outline-none focus:border-[#4a9ebb]/40 transition-colors resize-none" />
          <div className="flex justify-end">
            <button type="submit" disabled={!text.trim()} className="ws-btn-primary disabled:opacity-50">
              post comment
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
