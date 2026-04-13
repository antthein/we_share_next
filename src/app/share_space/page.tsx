import { createServerSupabaseClient } from '@/lib/supabase-server'
import ShareSpaceClient from './ShareSpaceClient'
import type { ShareWithAuthor } from '@/types/database'

export const metadata = { title: 'share_space — we_share' }

export default async function ShareSpacePage() {
  const supabase = await createServerSupabaseClient()

  const { data: shares } = await supabase
    .from('shares')
    .select('*, profiles(display_name, avatar_url), co_sharer_count:share_reactions(count)')
    .order('created_at', { ascending: false })

  return <ShareSpaceClient initialShares={(shares ?? []) as unknown as ShareWithAuthor[]} />
}
