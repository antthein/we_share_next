import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — we_share',
  description: 'Real knowledge from real people. Community-vetted. No noise.',
}

export default function AboutPage() {
  return (
    <main>

      {/* HERO */}
      <section className="py-28 bg-[#f0ede8] dark:bg-[#181818] border-b border-black/[0.06] dark:border-[#f0ede8]/[0.06]">
        <div className="max-w-[780px] mx-auto px-6 text-center">
          <p className="text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-[#4a9ebb] mb-4">
            what we believe
          </p>
          <h1 className="text-[2.8rem] sm:text-[3.5rem] font-extrabold tracking-tight text-[#1c1a16] dark:text-[#f0ede8] leading-tight mb-6">
            Real knowledge comes<br className="hidden sm:block" /> from real people.
          </h1>
          <p className="text-lg text-[#787068] max-w-[52ch] mx-auto leading-relaxed">
            we_share is a community platform where individuals share genuine insights,
            practical wisdom, and everyday experiences — without the noise, ads, or algorithmic distortion.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 border-b border-black/[0.06] dark:border-[#f0ede8]/[0.06]">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ['12k+', 'Contributors'],
              ['48k+', 'Posts shared'],
              ['200+', 'Topics covered'],
              ['98%',  'Trust rating'],
            ].map(([n, l]) => (
              <div key={l} className="p-6 bg-[#f0ede8] dark:bg-[#1e1e1e] rounded-xl border border-black/[0.08] dark:border-[#f0ede8]/[0.07] text-center">
                <span className="block text-[2.2rem] font-black text-[#1c1a16] dark:text-[#f0ede8] tracking-tight mb-1">{n}</span>
                <span className="text-[0.68rem] font-semibold uppercase tracking-wider text-[#787068]">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="py-24">
        <div className="max-w-[780px] mx-auto px-6">
          <p className="text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-[#4a9ebb] mb-3">our mission</p>
          <h2 className="text-2xl lg:text-[2rem] font-bold tracking-tight text-[#1c1a16] dark:text-[#f0ede8] mb-6">
            Cut the noise. Keep the knowledge.
          </h2>
          <div className="space-y-5 text-[#787068] leading-relaxed text-[1.0625rem]">
            <p>
              The internet is flooded with content optimised for clicks, not clarity. Algorithms reward
              outrage and engagement over accuracy. Ads distort what gets surfaced. The result: it&rsquo;s
              harder than ever to find information you can actually trust.
            </p>
            <p>
              we_share was built as a counter to that. Every post is human-authored. Every piece of content
              is community-vetted through upvotes and peer vouching. There are no ads, no engagement traps,
              and no algorithmic feed pushing content you didn&rsquo;t ask for.
            </p>
            <p>
              What you read here is{' '}
              <strong className="text-[#4a9ebb] font-semibold">legit</strong> — shared by people with
              real experience, reviewed by a community that cares about quality.
            </p>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-24 bg-[#f0ede8] dark:bg-[#181818] border-t border-b border-black/[0.06] dark:border-[#f0ede8]/[0.06]">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-[#4a9ebb] mb-3">what drives us</p>
            <h2 className="text-2xl lg:text-[2rem] font-bold tracking-tight text-[#1c1a16] dark:text-[#f0ede8]">
              our values
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🧠',
                title: 'Genuine knowledge',
                body: 'We only want content that actually helps someone. No hot takes for clicks, no keyword-stuffed fluff — just real insights from real experience.',
              },
              {
                icon: '🤝',
                title: 'Community trust',
                body: 'Our vouch system lets the community signal what\'s legit. Peer verification builds a reputation layer that algorithms can\'t fake.',
              },
              {
                icon: '🔇',
                title: 'Zero noise',
                body: 'No ads. No recommendation rabbit holes. No dark patterns. You come here to read and share knowledge — that\'s exactly what you get.',
              },
            ].map(({ icon, title, body }) => (
              <div key={title} className="p-8 bg-[#e8e5e0] dark:bg-[#1e1e1e] rounded-xl border border-black/[0.08] dark:border-[#f0ede8]/[0.07]">
                <span className="text-3xl block mb-4">{icon}</span>
                <h3 className="text-base font-bold text-[#1c1a16] dark:text-[#f0ede8] mb-2">{title}</h3>
                <p className="text-sm text-[#787068] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-[780px] mx-auto px-6 text-center">
          <p className="text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-[#4a9ebb] mb-3">ready?</p>
          <h2 className="text-2xl lg:text-[2rem] font-bold tracking-tight text-[#1c1a16] dark:text-[#f0ede8] mb-4">
            Join the community.<br />Share what you know.
          </h2>
          <p className="text-[#787068] mb-10 max-w-[44ch] mx-auto leading-relaxed">
            It takes 60 seconds to sign up. No noise, no ads, just knowledge.
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <Link href="/auth/signup" className="ws-btn-primary">get started</Link>
            <Link href="/browse" className="text-sm font-semibold text-[#787068] hover:text-[#4a9ebb] transition-colors">
              browse posts &rarr;
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
