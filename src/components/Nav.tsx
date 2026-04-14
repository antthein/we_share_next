'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import ThemeToggle from './ThemeToggle'
import { APP_VERSION } from '@/lib/version'

const links = [
  { href: '/',            label: 'home' },
  { href: '/share_space', label: 'share_space' },
  { href: '/browse',      label: 'browse' },
]

export default function Nav() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4
                      bg-[#fafaf9]/90 dark:bg-[#111111]/90 backdrop-blur-md
                      border-b border-black/[0.08] dark:border-[#f0ede8]/[0.07]">

        {/* Wordmark */}
        <div className="flex items-center gap-2">
          <Link href="/" className="text-[1.2rem] font-extrabold tracking-tight text-[#1c1a16] dark:text-[#f0ede8]">
            we<span style={{ color: '#4a9ebb' }}>_</span>share
          </Link>
          <span className="text-[0.6rem] font-semibold px-1.5 py-0.5 rounded-full tabular-nums select-none"
                style={{ background: 'rgba(74,158,187,0.1)', color: '#4a9ebb' }}>
            {APP_VERSION}
          </span>
        </div>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`text-sm transition-colors ${
                  pathname === href
                    ? 'font-semibold text-[#4a9ebb]'
                    : 'text-[#787068] hover:text-[#4a9ebb]'
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
          <li><a href="#about"  className="text-sm text-[#787068] hover:text-[#4a9ebb] transition-colors">about</a></li>
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <span className="text-xs text-[#787068] truncate max-w-[120px]">{user.email}</span>
              <button
                onClick={signOut}
                className="text-sm font-semibold px-4 py-2 rounded-lg border border-black/[0.12] dark:border-[#f0ede8]/[0.12]
                           text-[#787068] hover:border-[#4a9ebb]/40 hover:text-[#4a9ebb] transition-all"
              >
                sign out
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/auth/login"
                className="text-sm text-[#787068] hover:text-[#4a9ebb] transition-colors px-3 py-2">
                log in
              </Link>
              <Link href="/auth/signup"
                className="text-sm font-semibold px-4 py-2 rounded-lg border border-black/[0.12] dark:border-[#f0ede8]/[0.12]
                           text-[#1c1a16] dark:text-[#f0ede8] hover:border-[#4a9ebb]/40 hover:text-[#4a9ebb] transition-all">
                join
              </Link>
            </div>
          )}

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
            className="md:hidden flex flex-col gap-[5px] p-1"
          >
            <span className="block w-5 h-0.5 bg-[#1c1a16] dark:bg-[#f0ede8] rounded" />
            <span className="block w-5 h-0.5 bg-[#1c1a16] dark:bg-[#f0ede8] rounded" />
            <span className="block w-5 h-0.5 bg-[#1c1a16] dark:bg-[#f0ede8] rounded" />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed top-[65px] left-0 right-0 z-40 bg-[#fafaf9] dark:bg-[#111111]
                        border-b border-black/[0.08] dark:border-[#f0ede8]/[0.07]
                        px-8 py-6 flex flex-col gap-5">
          {links.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)}
              className={`text-sm transition-colors ${pathname === href ? 'font-semibold text-[#4a9ebb]' : 'text-[#787068] hover:text-[#4a9ebb]'}`}>
              {label}
            </Link>
          ))}
          {user ? (
            <button onClick={() => { signOut(); setMenuOpen(false) }}
              className="text-sm font-semibold text-[#787068] text-left">sign out</button>
          ) : (
            <>
              <Link href="/auth/login"  onClick={() => setMenuOpen(false)} className="text-sm text-[#787068] hover:text-[#4a9ebb]">log in</Link>
              <Link href="/auth/signup" onClick={() => setMenuOpen(false)} className="text-sm font-semibold text-[#4a9ebb]">join &rarr;</Link>
            </>
          )}
        </div>
      )}
    </>
  )
}
