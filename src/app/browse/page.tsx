import { createServerSupabaseClient } from '@/lib/supabase-server'
import BrowseClient from './BrowseClient'
import type { PostWithAuthor } from '@/types/database'

export const metadata = { title: 'browse posts — we_share' }

export default async function BrowsePage() {
  const supabase = await createServerSupabaseClient()

  const { data: posts } = await supabase
    .from('posts')
    .select('*, profiles(display_name, avatar_url, expertise)')
    .order('created_at', { ascending: false })

  return <BrowseClient initialPosts={(posts ?? []) as PostWithAuthor[]} />
}
