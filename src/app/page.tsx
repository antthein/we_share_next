import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import PostCard from '@/components/PostCard'
import type { PostWithAuthor } from '@/types/database'

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()

  const { data: postsData } = await supabase
    .from('posts')
    .select('*, profiles(display_name, avatar_url, expertise)')
    .order('created_at', { ascending: false })
    .limit(3)

  const posts = (postsData ?? []) as unknown as PostWithAuthor[]

  return (
    <>
      {/* HERO */}
      <section className="max-w-[1100px] mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 items-center gap-16 min-h-[calc(100vh-65px)]">
        <div className="min-w-0">
          <p className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-[#4a9ebb] mb-5">
            Knowledge &rsaquo; Shared honestly
          </p>
          <h1 className="text-[2.8rem] sm:text-[4rem] md:text-[5rem] lg:text-[5.5rem] font-extrabold leading-none tracking-normal text-[#1c1a16] dark:text-[#f0ede8] mb-6">
            we<span style={{ color: '#4a9ebb' }}>_</span>share
          </h1>
          <p className="text-lg text-[#787068] mb-10 max-w-[42ch] leading-relaxed">
            Real knowledge from real people.<br />
            Community-vetted. No noise.
          </p>
          <div className="flex items-center gap-6 flex-wrap">
            <Link href="/auth/signup" className="ws-btn-primary">Start Sharing</Link>
            <Link href="/browse" className="text-sm text-[#787068] font-semibold hover:text-[#4a9ebb] transition-colors">
              Browse posts &darr;
            </Link>
          </div>
        </div>

        {/* Orbit visual */}
        <div className="hidden lg:flex justify-center items-center" aria-hidden="true">
          <div className="orbit relative w-[320px] h-[320px]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] rounded-full border border-black/[0.06] dark:border-[#f0ede8]/[0.06]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-black/[0.06] dark:border-[#f0ede8]/[0.06]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-black/[0.06] dark:border-[#f0ede8]/[0.06]" />
            <div className="orbit__dot orbit__dot--1" />
            <div className="orbit__dot orbit__dot--2" />
            <div className="orbit__dot orbit__dot--3" />
            <div className="orbit__dot orbit__dot--4" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-[#e8e5e0] dark:bg-[#1e1e1e] border border-[#4a9ebb]/30 flex items-center justify-center text-xl font-extrabold text-[#4a9ebb]">K</div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden border-t border-b border-black/[0.06] dark:border-[#f0ede8]/[0.06] py-3 bg-[#f0ede8] dark:bg-[#181818]" aria-hidden="true">
        <div className="marquee-track">
          {['Design','Development','Science','Finance','Health','Philosophy','Engineering','Art','Business','Education',
            'Design','Development','Science','Finance','Health','Philosophy','Engineering','Art','Business','Education'].map((t, i) => (
            <span key={i}>
              <span className="text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-[#787068]">{t}</span>
              <span className="text-[#787068] mx-4">&bull;</span>
            </span>
          ))}
        </div>
      </div>

      {/* RECENT POSTS */}
      <section className="py-20" id="browse">
        <div className="max-w-[1100px] mx-auto px-6">
          <p className="text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-[#4a9ebb] mb-3">fresh picks</p>
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-3xl lg:text-[2.5rem] font-bold tracking-tight text-[#1c1a16] dark:text-[#f0ede8]">recent posts</h2>
            <Link href="/browse" className="text-sm font-semibold text-[#787068] hover:text-[#4a9ebb] transition-colors shrink-0">
              view all &rarr;
            </Link>
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map(post => <PostCard key={post.id} post={post} />)}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-3xl mb-3">📭</p>
              <p className="text-[#787068] text-sm">no posts yet — be the first to share.</p>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link href="/browse" className="ws-btn-primary">browse all posts</Link>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-24 bg-[#f0ede8] dark:bg-[#181818]" id="about">
        <div className="max-w-[1100px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <p className="text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-[#4a9ebb] mb-3">what we believe</p>
            <h2 className="text-3xl lg:text-[2.8rem] font-bold tracking-tight text-[#1c1a16] dark:text-[#f0ede8] leading-tight mb-6">
              Real knowledge comes<br className="hidden lg:block" /> from real people.
            </h2>
            <p className="text-[#787068] mb-4 leading-relaxed">
              we_share is a community platform where individuals share genuine insights,
              practical wisdom, and everyday experiences — without the noise, ads, or algorithmic distortion.
            </p>
            <p className="text-[#787068] leading-relaxed">
              Every post is human-authored, community-vetted, and built around a single
              promise: <strong className="text-[#4a9ebb] font-semibold">what you read here is legit.</strong>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[['12k+','Contributors'],['48k+','Posts shared'],['200+','Topics covered'],['98%','Trust rating']].map(([n, l]) => (
              <div key={l} className="p-6 bg-[#e8e5e0] dark:bg-[#1e1e1e] rounded-xl border border-black/[0.08] dark:border-[#f0ede8]/[0.07]">
                <span className="block text-[2rem] font-black text-[#1c1a16] dark:text-[#f0ede8] tracking-tight mb-1">{n}</span>
                <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-[#787068]">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#f0ede8] dark:bg-[#181818] border-t border-black/[0.06] dark:border-[#f0ede8]/[0.06]">
        <div className="max-w-[1100px] mx-auto px-6 flex flex-col items-center text-center">
          <p className="text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-[#4a9ebb] mb-3">ready?</p>
          <h2 className="text-3xl lg:text-[2.8rem] font-bold tracking-tight text-[#1c1a16] dark:text-[#f0ede8] leading-tight mb-4">
            Join the community.<br />Share what you know.
          </h2>
          <p className="text-[#787068] mb-10 max-w-[46ch] leading-relaxed">
            It takes 60 seconds to sign up. No noise, no ads, just knowledge.
          </p>
          <Link href="/auth/signup" className="ws-btn-primary">get started</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#f0ede8] dark:bg-[#181818] border-t border-black/[0.06] dark:border-[#f0ede8]/[0.06] pt-16 pb-8">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 pb-12 border-b border-black/[0.06] dark:border-[#f0ede8]/[0.06] mb-8">
            <div>
              <span className="text-[1.2rem] font-extrabold tracking-tight text-[#1c1a16] dark:text-[#f0ede8] block mb-3">
                we<span style={{ color: '#4a9ebb' }}>_</span>share
              </span>
              <p className="text-sm text-[#787068] leading-relaxed max-w-[28ch]">Knowledge sharing as we see in everyday.<br />Legit and trustworthy.</p>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-[0.65rem] font-bold tracking-[0.12em] uppercase text-[#1c1a16] dark:text-[#f0ede8] mb-1">Product</p>
              <Link href="/browse"      className="text-sm text-[#787068] hover:text-[#4a9ebb] transition-colors">Browse</Link>
              <Link href="/share_space" className="text-sm text-[#787068] hover:text-[#4a9ebb] transition-colors">Share Space</Link>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-[0.65rem] font-bold tracking-[0.12em] uppercase text-[#1c1a16] dark:text-[#f0ede8] mb-1">Company</p>
              <a href="#about" className="text-sm text-[#787068] hover:text-[#4a9ebb] transition-colors">About</a>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-[0.65rem] font-bold tracking-[0.12em] uppercase text-[#1c1a16] dark:text-[#f0ede8] mb-1">Legal</p>
              <a href="#" className="text-sm text-[#787068] hover:text-[#4a9ebb] transition-colors">Privacy</a>
              <a href="#" className="text-sm text-[#787068] hover:text-[#4a9ebb] transition-colors">Terms</a>
            </div>
          </div>
          <p className="text-xs text-[#787068]">&copy; 2026 we_share. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}
