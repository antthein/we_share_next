'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[380px]">

        <Link href="/" className="text-[1.2rem] font-extrabold tracking-tight text-[#1c1a16] dark:text-[#f0ede8] block mb-10">
          we<span style={{ color: '#4a9ebb' }}>_</span>share
        </Link>

        <h1 className="text-2xl font-extrabold text-[#1c1a16] dark:text-[#f0ede8] mb-1 tracking-tight">welcome back</h1>
        <p className="text-sm text-[#787068] mb-8">log in to your account</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#787068]">email</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg border bg-[#e8e5e0] dark:bg-[#1e1e1e]
                         border-black/[0.08] dark:border-[#f0ede8]/[0.08]
                         text-[#1c1a16] dark:text-[#f0ede8] placeholder:text-[#787068]
                         text-sm outline-none focus:border-[#4a9ebb]/50 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#787068]">password</label>
            <input
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border bg-[#e8e5e0] dark:bg-[#1e1e1e]
                         border-black/[0.08] dark:border-[#f0ede8]/[0.08]
                         text-[#1c1a16] dark:text-[#f0ede8] placeholder:text-[#787068]
                         text-sm outline-none focus:border-[#4a9ebb]/50 transition-colors"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button type="submit" disabled={loading}
                  className="ws-btn-primary w-full justify-center mt-2 disabled:opacity-50">
            {loading ? 'logging in…' : 'log in'}
          </button>
        </form>

        <p className="text-sm text-[#787068] mt-6 text-center">
          no account?{' '}
          <Link href="/auth/signup" className="text-[#4a9ebb] font-semibold hover:underline">join we_share</Link>
        </p>
      </div>
    </main>
  )
}
