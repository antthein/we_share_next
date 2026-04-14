'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { DailyQuote } from '@/lib/quotes'

// ── Carousel root ─────────────────────────────────────────────────────────────

export default function QuotesClient({
  quotes,
  userId,
}: {
  quotes: DailyQuote[]
  userId?: string
}) {
  const [index, setIndex] = useState(0)
  const [dir,   setDir]   = useState<'left' | 'right' | null>(null)
  const [animKey, setAnimKey] = useState(0)

  function go(next: number) {
    if (next === index) return
    setDir(next > index ? 'right' : 'left')
    setAnimKey(k => k + 1)
    setIndex(next)
  }

  function prev() { go((index - 1 + quotes.length) % quotes.length) }
  function next() { go((index + 1) % quotes.length) }

  return (
    <div className="select-none">

      {/* Card + arrows */}
      <div className="relative flex items-center gap-4">

        {/* Prev arrow */}
        <button
          onClick={prev}
          aria-label="Previous quote"
          className="hidden sm:flex shrink-0 w-9 h-9 items-center justify-center rounded-full
                     border border-black/[0.08] dark:border-[#f0ede8]/[0.1]
                     text-[#787068] hover:text-[#4a9ebb] hover:border-[#4a9ebb]/30
                     transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Card viewport — clips the slide animation */}
        <div className="flex-1 overflow-hidden rounded-2xl">
          <div
            key={animKey}
            style={{ animation: dir ? `slideIn${dir === 'right' ? 'Right' : 'Left'} 0.32s cubic-bezier(0.25,0.46,0.45,0.94) both` : undefined }}
          >
            <QuoteCard
              quote={quotes[index]}
              userId={userId}
            />
          </div>
        </div>

        {/* Next arrow */}
        <button
          onClick={next}
          aria-label="Next quote"
          className="hidden sm:flex shrink-0 w-9 h-9 items-center justify-center rounded-full
                     border border-black/[0.08] dark:border-[#f0ede8]/[0.1]
                     text-[#787068] hover:text-[#4a9ebb] hover:border-[#4a9ebb]/30
                     transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Dot indicators + mobile arrows */}
      <div className="flex items-center justify-center gap-6 mt-7">

        {/* Mobile prev */}
        <button onClick={prev} aria-label="Previous quote"
          className="sm:hidden text-[#787068] hover:text-[#4a9ebb] transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Dots */}
        <div className="flex items-center gap-2">
          {quotes.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Quote ${i + 1}`}
              className="transition-all duration-200"
              style={{
                width:  i === index ? '20px' : '6px',
                height: '6px',
                borderRadius: '9999px',
                background: i === index ? '#4a9ebb' : 'rgba(120,112,104,0.35)',
              }}
            />
          ))}
        </div>

        {/* Mobile next */}
        <button onClick={next} aria-label="Next quote"
          className="sm:hidden text-[#787068] hover:text-[#4a9ebb] transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Slide keyframes */}
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(48px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-48px); }
          to   { opacity: 1; transform: translateX(0);     }
        }
      `}</style>
    </div>
  )
}

// ── Single quote card ─────────────────────────────────────────────────────────

function QuoteCard({ quote, userId }: { quote: DailyQuote; userId?: string }) {
  const [resonated,      setResonated]      = useState(quote.user_resonated)
  const [resonanceCount, setResonanceCount] = useState(quote.resonance_count)
  const [bookmarked,     setBookmarked]     = useState(quote.user_bookmarked)
  const [showSignIn,     setShowSignIn]     = useState(false)
  const [loading,        setLoading]        = useState(false)

  const supabase = createClient()

  async function handleResonate() {
    if (!userId) { setShowSignIn(true); return }
    if (loading) return
    setLoading(true)
    if (resonated) {
      setResonated(false)
      setResonanceCount(c => Math.max(0, c - 1))
      await supabase.from('quote_reactions').delete().eq('quote_id', quote.id).eq('user_id', userId)
    } else {
      setResonated(true)
      setResonanceCount(c => c + 1)
      await supabase.from('quote_reactions').insert({ quote_id: quote.id, user_id: userId })
    }
    setLoading(false)
  }

  async function handleBookmark() {
    if (!userId) { setShowSignIn(true); return }
    if (loading) return
    setLoading(true)
    if (bookmarked) {
      setBookmarked(false)
      await supabase.from('quote_bookmarks').delete().eq('quote_id', quote.id).eq('user_id', userId)
    } else {
      setBookmarked(true)
      await supabase.from('quote_bookmarks').insert({ quote_id: quote.id, user_id: userId })
    }
    setLoading(false)
  }

  return (
    <article className="p-10 sm:p-12 bg-[#f0ede8] dark:bg-[#1e1e1e]
                        border border-black/[0.07] dark:border-[#f0ede8]/[0.07]">

      {/* Theme + ai pick */}
      <div className="flex items-center justify-between mb-10">
        <span className="text-[0.58rem] font-bold tracking-[0.12em] uppercase px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(74,158,187,0.1)', color: '#4a9ebb' }}>
          #{quote.theme}
        </span>
        {quote.is_ai_generated && (
          <span className="text-[0.55rem] font-semibold tracking-[0.1em] uppercase px-2 py-0.5 rounded-full border select-none"
                style={{ borderColor: 'rgba(120,112,104,0.22)', color: '#787068' }}>
            ai pick
          </span>
        )}
      </div>

      {/* Quote text */}
      <blockquote className="text-[1.45rem] sm:text-[1.65rem] font-light leading-[1.7] tracking-[-0.01em]
                              text-[#1c1a16] dark:text-[#f0ede8] mb-7">
        &ldquo;{quote.text}&rdquo;
      </blockquote>

      {/* Attribution */}
      <p className="text-sm text-[#787068] mb-10 leading-relaxed">
        &mdash;&thinsp;{quote.author}
        {quote.source && <span className="opacity-60">, <em>{quote.source}</em></span>}
      </p>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleResonate}
          className={`flex items-center gap-2 text-xs font-semibold transition-colors ${
            resonated ? 'text-[#4a9ebb]' : 'text-[#787068] hover:text-[#4a9ebb]'
          }`}
          aria-label="Resonate with this quote"
        >
          <ResonateIcon filled={resonated} />
          {resonanceCount > 0 && <span className="tabular-nums opacity-80">{resonanceCount}</span>}
        </button>

        <button
          onClick={handleBookmark}
          className={`transition-colors ${bookmarked ? 'text-[#4a9ebb]' : 'text-[#787068] hover:text-[#4a9ebb]'}`}
          aria-label={bookmarked ? 'Remove bookmark' : 'Save quote'}
        >
          <BookmarkIcon filled={bookmarked} />
        </button>
      </div>

      {/* Sign-in nudge */}
      {showSignIn && (
        <p className="mt-5 text-xs text-[#787068] flex items-center gap-2">
          <Link href="/auth/login" className="text-[#4a9ebb] hover:underline font-medium">sign in</Link>
          to resonate or save quotes.
          <button onClick={() => setShowSignIn(false)}
                  className="ml-auto opacity-40 hover:opacity-80 transition-opacity text-base leading-none">✕</button>
        </p>
      )}
    </article>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function ResonateIcon({ filled }: { filled: boolean }) {
  return filled ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" fill="currentColor" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
    </svg>
  )
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24"
         fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}
