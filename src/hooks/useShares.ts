'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { ShareWithAuthor } from '@/types/database'

export function useShares(tag?: string | null) {
  const [shares, setShares]   = useState<ShareWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchShares() {
      let query = supabase
        .from('shares')
        .select(`
          *,
          profiles ( display_name, avatar_url ),
          co_sharer_count:share_reactions(count)
        `)
        .order('created_at', { ascending: false })

      if (tag) {
        query = query.contains('tags', [tag])
      }

      const { data, error } = await query
      if (!error && data) setShares(data as unknown as ShareWithAuthor[])
      setLoading(false)
    }

    fetchShares()

    // realtime — new shares appear live
    const channel = supabase
      .channel('shares-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'shares' }, () => {
        fetchShares()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [tag])

  return { shares, loading }
}
