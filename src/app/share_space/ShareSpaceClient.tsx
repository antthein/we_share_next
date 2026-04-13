'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { showToast } from '@/components/Toast'
import type { ShareWithAuthor } from '@/types/database'

function timeAgo(iso: string) {
  const diff  = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  < 7)  return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isURL(str: string) {
  return /^(https?:\/\/|www\.)/i.test(str.trim())
}

function extractDomain(url: string) {
  try {
    const u = new URL(url.startsWith('http') ? url : 'https://' + url)
    return u.hostname.replace(/^www\./, '')
  } catch { return url }
}

function ShareCard({ share, activeTag, onTagClick }: {
  share: ShareWithAuthor
  activeTag: string | null
  onTagClick: (t: string) => void
}) {
  const url    = isURL(share.content)
  const domain = url ? extractDomain(share.content) : null
  const coCount = typeof share.co_sharer_count === 'number'
    ? share.co_sharer_count
    : (share.co_sharer_count as any)?.[0]?.count ?? 0

  return (
    <article className="share-card flex flex-col gap-0 p-5 rounded-xl border transition-all duration-200
                        bg-[#e8e5e0] border-black/[0.08] dark:bg-[#1e1e1e] dark:border-[#f0ede8]/[0.08]
                        hover:border-[#4a9ebb]/25 hover:-translate-y-0.5">
      {domain && (
        <div className="flex items-center gap-1.5 mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://www.google.com/s2/favicons?sz=16&domain=${domain}`}
               width={14} height={14} alt="" className="rounded-sm opacity-70"
               onError={e => (e.currentTarget.style.display = 'none')} />
          <span className="text-[0.6rem] font-semibold tracking-wide text-[#787068]">{domain}</span>
        </div>
      )}

      {url ? (
        <a href={share.content} target="_blank" rel="noopener"
           className="text-sm font-medium text-[#1c1a16] dark:text-[#f0ede8] hover:text-[#4a9ebb] transition-colors leading-snug break-all">
          {share.content}
        </a>
      ) : (
        <p className="text-sm text-[#1c1a16] dark:text-[#f0ede8] leading-relaxed line-clamp-4">
          {share.content}
        </p>
      )}

      {share.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {share.tags.map(t => (
            <button key={t} onClick={() => onTagClick(t)}
                    className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full transition-colors
                                ${t === activeTag
                                  ? 'bg-[rgba(74,158,187,0.18)] text-[#4a9ebb]'
                                  : 'bg-[rgba(74,158,187,0.07)] text-[#787068] hover:text-[#4a9ebb] hover:bg-[rgba(74,158,187,0.14)]'}`}>
              {t}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mt-4 pt-3.5 border-t border-black/[0.06] dark:border-[#f0ede8]/[0.05]">
        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[0.6rem] font-bold
                        bg-[#1c1a16]/[0.08] text-[#1c1a16] dark:bg-[#f0ede8]/[0.08] dark:text-[#f0ede8]">
          {(share.profiles?.display_name ?? 'A').slice(0, 2).toUpperCase()}
        </div>
        <span className="text-xs text-[#787068] truncate">{share.profiles?.display_name ?? 'anonymous'}</span>
        <span className="text-xs text-[#787068] ml-auto shrink-0">{timeAgo(share.created_at)}</span>
        {coCount > 0 && (
          <span className="flex items-center gap-1 text-[0.6rem] text-[#787068]" title={`${coCount} others shared this`}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {coCount + 1}
          </span>
        )}
      </div>
    </article>
  )
}

export default function ShareSpaceClient({ initialShares }: { initialShares: ShareWithAuthor[] }) {
  const { user } = useAuth()
  const supabase = createClient()

  const [shares, setShares]     = useState<ShareWithAuthor[]>(initialShares)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [content, setContent]   = useState('')
  const [tags, setTags]         = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('shares-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'shares' }, async () => {
        const { data } = await supabase
          .from('shares')
          .select('*, profiles(display_name, avatar_url), co_sharer_count:share_reactions(count)')
          .order('created_at', { ascending: false })
        if (data) setShares(data as unknown as ShareWithAuthor[])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (!tag || tags.includes(tag) || tags.length >= 6) return
    setTags(prev => [...prev, tag])
  }

  function handleTagKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault()
      addTag(tagInput.replace(',', ''))
      setTagInput('')
    } else if (e.key === 'Backspace' && !tagInput && tags.length) {
      setTags(prev => prev.slice(0, -1))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) { showToast('log in to share'); return }
    const text = content.trim()
    if (!text) return

    const finalTags = tagInput.trim() ? [...tags, tagInput.trim().toLowerCase()] : tags

    setSubmitting(true)
    const { error } = await supabase.from('shares').insert({
      content: text,
      tags: finalTags,
      user_id: user.id,
    })

    if (error) {
      showToast('something went wrong')
    } else {
      setContent('')
      setTags([])
      setTagInput('')
      showToast('shared!')
    }
    setSubmitting(false)
  }

  function handleTagClick(t: string) {
    setActiveTag(prev => prev === t ? null : t)
  }

  const filtered = useMemo(() =>
    activeTag ? shares.filter(s => s.tags.includes(activeTag)) : shares,
    [shares, activeTag]
  )

  const allTags = useMemo(() => {
    const freq: Record<string, number> = {}
    shares.forEach(s => s.tags.forEach(t => { freq[t] = (freq[t] || 0) + 1 }))
    return Object.entries(freq).sort((a, b) => b[1] - a[1])
  }, [shares])

  return (
    <div className="max-w-[1100px] mx-auto px-6 pb-24">
      {/* Header */}
      <div className="pt-14 pb-10">
        <p className="text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-[#4a9ebb] mb-3">community</p>
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1c1a16] dark:text-[#f0ede8] mb-2">share_space</h1>
        <p className="text-[#787068] text-sm">drop a link or a thought. quick and public.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_248px] gap-8 items-start">

        {/* Feed column */}
        <div>
          {/* Submit form */}
          <form onSubmit={handleSubmit}
                className="mb-8 p-5 rounded-xl border bg-[#f0ede8] border-black/[0.08] dark:bg-[#1e1e1e] dark:border-[#f0ede8]/[0.08]">
            <textarea value={content} onChange={e => setContent(e.target.value)}
                      rows={2} placeholder="drop a link or a thought…"
                      className="w-full bg-transparent resize-none outline-none text-sm text-[#1c1a16] dark:text-[#f0ede8] placeholder:text-[#787068] mb-4 leading-relaxed block" />

            {/* Tag input */}
            <div className="flex gap-2 items-start mb-4">
              <div className="flex flex-wrap gap-2 items-center flex-1 min-h-[36px] px-3 py-2 rounded-lg
                              bg-[#fafaf9] border border-black/[0.08] dark:bg-[#111111] dark:border-[#f0ede8]/[0.08]
                              cursor-text transition-colors focus-within:border-[#4a9ebb]/40">
                {tags.map(t => (
                  <span key={t} className="inline-flex items-center gap-1 text-[0.65rem] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(74,158,187,0.14)', color: '#4a9ebb' }}>
                    {t}
                    <button type="button" onClick={() => setTags(prev => prev.filter(x => x !== t))}
                            className="hover:opacity-70 transition-opacity leading-none">&times;</button>
                  </span>
                ))}
                <input value={tagInput}
                       onChange={e => setTagInput(e.target.value)}
                       onKeyDown={handleTagKey}
                       onBlur={() => { if (tagInput.trim()) { addTag(tagInput); setTagInput('') }}}
                       type="text" placeholder={tags.length ? '' : 'add tags…'} autoComplete="off"
                       className="bg-transparent outline-none text-xs text-[#1c1a16] dark:text-[#f0ede8] placeholder:text-[#787068] flex-1 min-w-[80px] h-5" />
              </div>
              <button type="button"
                      onClick={() => { if (tagInput.trim()) { addTag(tagInput); setTagInput('') }}}
                      className="shrink-0 h-[36px] px-3 rounded-lg border text-xs font-semibold transition-colors
                                 border-black/[0.1] text-[#787068] hover:border-[#4a9ebb]/40 hover:text-[#4a9ebb]
                                 dark:border-[#f0ede8]/[0.1] bg-[#fafaf9] dark:bg-[#111111]">
                + tag
              </button>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-[0.65rem] text-[#787068]">
                sharing as{' '}
                <span style={{ color: '#4a9ebb' }} className="font-medium">
                  {user ? (user.email?.split('@')[0]) : 'guest'}
                </span>
              </span>
              <button type="submit" disabled={submitting || !content.trim()}
                      className="ws-btn-primary shrink-0 disabled:opacity-50"
                      style={{ padding: '0.4rem 1.1rem', fontSize: '0.8rem' }}>
                {submitting ? 'sharing…' : 'share'}
              </button>
            </div>
          </form>

          {/* Mobile tag filters */}
          {allTags.length > 0 && (
            <div className="lg:hidden flex gap-2 flex-wrap mb-4">
              {allTags.map(([t]) => (
                <button key={t} onClick={() => handleTagClick(t)}
                        className={`topic-filter ${activeTag === t ? 'active' : ''}`}>{t}</button>
              ))}
              {activeTag && (
                <button onClick={() => setActiveTag(null)}
                        className="text-[0.65rem] text-[#787068] hover:text-[#4a9ebb] transition-colors">&times; clear</button>
              )}
            </div>
          )}

          {/* Count */}
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs text-[#787068]">{filtered.length} share{filtered.length !== 1 ? 's' : ''}</span>
            <span className="text-[0.6rem] font-semibold tracking-wider uppercase text-[#787068]">recent first</span>
          </div>

          {/* Feed */}
          {filtered.length > 0 ? (
            <div className="flex flex-col gap-4">
              {filtered.map(s => (
                <ShareCard key={s.id} share={s} activeTag={activeTag} onTagClick={handleTagClick} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-2xl mb-3">📭</p>
              <p className="text-[#787068] text-sm">
                {activeTag ? `no shares tagged "${activeTag}"` : 'nothing here yet — be the first to share.'}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="sticky top-[80px] hidden lg:block">
          <p className="text-[0.6rem] font-semibold tracking-[0.15em] uppercase text-[#787068] mb-3">filter by tag</p>
          <div className="flex flex-col gap-1.5">
            {allTags.map(([t, count]) => (
              <button key={t} onClick={() => handleTagClick(t)}
                      className={`flex items-center justify-between gap-2 w-full text-left px-3 py-2 rounded-lg text-xs transition-colors
                                  ${activeTag === t
                                    ? 'font-semibold text-[#4a9ebb] bg-[rgba(74,158,187,0.1)]'
                                    : 'text-[#787068] hover:text-[#4a9ebb] hover:bg-[rgba(74,158,187,0.06)]'}`}>
                <span>{t}</span>
                <span className="text-[0.6rem] tabular-nums opacity-60">{count}</span>
              </button>
            ))}
          </div>
          {activeTag && (
            <button onClick={() => setActiveTag(null)}
                    className="mt-4 text-[0.65rem] text-[#787068] hover:text-[#4a9ebb] transition-colors">
              &times; clear filter
            </button>
          )}
        </aside>
      </div>
    </div>
  )
}
