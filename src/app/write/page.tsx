import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import WriteClient from './WriteClient'

export const metadata: Metadata = {
  title: 'Write — we_share',
}

export default async function WritePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  return (
    <main className="max-w-[760px] mx-auto px-6 py-14">
      <WriteClient userId={user.id} />
    </main>
  )
}
