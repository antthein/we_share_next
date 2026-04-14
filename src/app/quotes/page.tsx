import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getTodaysQuotes } from '@/lib/quotes'
import QuotesClient from './QuotesClient'

export const metadata: Metadata = {
  title: 'Quotes — we_share',
  description: 'Three thought-provoking quotes, refreshed daily.',
}

// Revalidate once per day so the server re-generates daily quotes at midnight UTC
export const revalidate = 3600

export default async function QuotesPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const quotes = await getTodaysQuotes(user?.id)

  const today = new Date()
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month:   'long',
    day:     'numeric',
  })

  return (
    <main className="max-w-[720px] mx-auto px-6 py-16">

      {/* Subtle date — no heading */}
      <p className="text-[0.62rem] font-semibold tracking-[0.14em] uppercase text-[#787068] mb-14">
        {dateStr}
      </p>

      {quotes.length === 0 ? (
        <p className="text-sm text-[#787068]">no quotes today — check back soon.</p>
      ) : (
        <QuotesClient quotes={quotes} userId={user?.id} />
      )}
    </main>
  )
}
