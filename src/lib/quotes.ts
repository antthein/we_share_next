/**
 * quotes.ts — Daily quote selection + AI generation
 *
 * Strategy:
 *   - 3 quotes per day, keyed by UTC date
 *   - Slots 1-2: curated pool, avoiding last 14 days of repeats
 *   - Slot 3:    Claude-generated (if ANTHROPIC_API_KEY set), else curated
 *   - All selections persisted in daily_quotes table
 */

import Anthropic from '@anthropic-ai/sdk'
import { createServerSupabaseClient } from './supabase-server'

// ── Types ────────────────────────────────────────────────────────────────────

export type Quote = {
  id: string
  text: string
  author: string
  source: string | null
  theme: string
  is_ai_generated: boolean
  created_at: string
}

export type DailyQuote = Quote & {
  display_order: number
  resonance_count: number
  user_resonated: boolean
  user_bookmarked: boolean
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function todayUTC(): string {
  return new Date().toISOString().split('T')[0]
}

function twoWeeksAgoUTC(): string {
  return new Date(Date.now() - 14 * 86_400_000).toISOString().split('T')[0]
}

// ── AI generation ─────────────────────────────────────────────────────────────

async function generateAIQuote(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>
): Promise<Quote | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null

  try {
    const client = new Anthropic({ apiKey })

    const msg = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: `You are a quote curator for an intellectual knowledge-sharing platform.
Generate exactly 1 thought-provoking, real, accurately-attributed quote.

Rules:
- Prefer lesser-known thinkers over famous overused names (avoid: Einstein, Jobs, Churchill, Mandela motivational quotes)
- Zero generic motivational content ("believe in yourself", "chase your dreams", etc.)
- Prioritise: intellectual depth, precise observations, counterintuitive truths, surprising angles
- theme must be exactly one of: philosophy, science, design, technology, creativity, culture, mathematics, language, systems, perception

Return ONLY valid JSON — no markdown fences, no explanation:
{"text":"...","author":"...","source":"...","theme":"..."}`,
        },
      ],
    })

    const raw = msg.content[0]
    if (raw.type !== 'text') return null

    const parsed = JSON.parse(raw.text.trim())
    if (!parsed.text || !parsed.author || !parsed.theme) return null

    const { data } = await supabase
      .from('quotes')
      .insert({
        text: parsed.text,
        author: parsed.author,
        source: parsed.source || null,
        theme: parsed.theme,
        is_ai_generated: true,
      })
      .select()
      .single()

    return (data as Quote) ?? null
  } catch (err) {
    console.error('[quotes] AI generation failed:', err)
    return null
  }
}

// ── Curated pick ──────────────────────────────────────────────────────────────

async function pickCurated(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  excludeIds: string[]
): Promise<Quote | null> {
  let query = supabase.from('quotes').select('*').eq('is_ai_generated', false)

  if (excludeIds.length > 0) {
    query = (query as any).not('id', 'in', `(${excludeIds.join(',')})`)
  }

  const { data } = await (query as any).limit(50)
  if (!data || data.length === 0) return null

  return data[Math.floor(Math.random() * data.length)] as Quote
}

// ── Daily quotes (main export) ────────────────────────────────────────────────

export async function getTodaysQuotes(userId?: string): Promise<DailyQuote[]> {
  const supabase = await createServerSupabaseClient()
  const today = todayUTC()

  // Load whatever is already chosen for today
  const { data: existing } = await supabase
    .from('daily_quotes')
    .select('display_order, quote_id, quotes(*)')
    .eq('date', today)
    .order('display_order')

  if (existing && existing.length >= 3) {
    const quotes = existing.map((e: any) => ({
      ...(e.quotes as Quote),
      display_order: e.display_order as number,
    }))
    return enrichWithUserData(supabase, quotes, userId)
  }

  // Find which slots still need filling
  const takenOrders = (existing ?? []).map((e: any) => e.display_order as number)
  const takenIds    = (existing ?? []).map((e: any) => e.quote_id as string)
  const neededOrders = [1, 2, 3].filter(n => !takenOrders.includes(n))

  // Collect IDs used recently to avoid repetition
  const { data: recent } = await supabase
    .from('daily_quotes')
    .select('quote_id')
    .gte('date', twoWeeksAgoUTC())

  const excludeIds = [
    ...new Set([...(recent ?? []).map((r: any) => r.quote_id as string), ...takenIds]),
  ]

  const newQuotes: (Quote & { display_order: number })[] = []

  for (let i = 0; i < neededOrders.length; i++) {
    const order = neededOrders[i]
    const usedSoFar = [...excludeIds, ...newQuotes.map(q => q.id)]
    const isLastSlot = i === neededOrders.length - 1

    let quote: Quote | null = null

    // Last slot → try AI generation
    if (isLastSlot) {
      quote = await generateAIQuote(supabase)
    }

    // Primary curated pick (excluding recent + today's picks)
    if (!quote) {
      quote = await pickCurated(supabase, usedSoFar)
    }

    // Final fallback: any curated not already shown today
    if (!quote) {
      quote = await pickCurated(supabase, takenIds)
    }

    if (!quote) continue
    newQuotes.push({ ...quote, display_order: order })
  }

  // Persist new selections (ignore duplicate conflicts)
  if (newQuotes.length > 0) {
    await supabase.from('daily_quotes').upsert(
      newQuotes.map(q => ({ quote_id: q.id, date: today, display_order: q.display_order })),
      { onConflict: 'date,display_order', ignoreDuplicates: true }
    )
  }

  // Combine and sort
  const all = [
    ...(existing ?? []).map((e: any) => ({
      ...(e.quotes as Quote),
      display_order: e.display_order as number,
    })),
    ...newQuotes,
  ].sort((a, b) => a.display_order - b.display_order)

  return enrichWithUserData(supabase, all, userId)
}

// ── Enrich with user-specific data ───────────────────────────────────────────

async function enrichWithUserData(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  quotes: (Quote & { display_order: number })[],
  userId?: string
): Promise<DailyQuote[]> {
  if (quotes.length === 0) return []

  const ids = quotes.map(q => q.id)

  // Resonance counts
  const { data: reactions } = await supabase
    .from('quote_reactions')
    .select('quote_id')
    .in('quote_id', ids)

  const resonanceMap: Record<string, number> = {}
  ;(reactions ?? []).forEach((r: any) => {
    resonanceMap[r.quote_id] = (resonanceMap[r.quote_id] ?? 0) + 1
  })

  let userReacted:   string[] = []
  let userBookmarked: string[] = []

  if (userId) {
    const [{ data: ur }, { data: ub }] = await Promise.all([
      supabase.from('quote_reactions').select('quote_id').in('quote_id', ids).eq('user_id', userId),
      supabase.from('quote_bookmarks').select('quote_id').in('quote_id', ids).eq('user_id', userId),
    ])
    userReacted    = (ur ?? []).map((r: any) => r.quote_id as string)
    userBookmarked = (ub ?? []).map((b: any) => b.quote_id as string)
  }

  return quotes.map(q => ({
    ...q,
    resonance_count: resonanceMap[q.id] ?? 0,
    user_resonated:  userReacted.includes(q.id),
    user_bookmarked: userBookmarked.includes(q.id),
  }))
}
