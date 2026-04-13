'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { PostWithAuthor } from '@/types/database'

export function usePosts(topic?: string) {
  const [posts, setPosts]     = useState<PostWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchPosts() {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles ( display_name, avatar_url, expertise ),
          upvote_count:votes(count).filter(type.eq.upvote),
          vouch_count:votes(count).filter(type.eq.vouch)
        `)
        .order('created_at', { ascending: false })

      if (topic && topic !== 'all') {
        query = query.eq('topic', topic)
      }

      const { data, error } = await query
      if (!error && data) setPosts(data as unknown as PostWithAuthor[])
      setLoading(false)
    }

    fetchPosts()
  }, [topic])

  return { posts, loading }
}
