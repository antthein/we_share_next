'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function SignupPage() {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-[360px]">
          <p className="text-3xl mb-4">📬</p>
          <h2 className="text-xl font-extrabold text-[#1c1a16] dark:text-[#f0ede8] mb-2">check your email</h2>
          <p className="text-sm text-[#787068] leading-relaxed">
            we sent a confirmation link to <strong className="text-[#4a9ebb]">{email}</strong>.
            click it to activate your account.
          </p>
          <Link href="/" className="ws-btn-primary mt-8 inline-flex justify-center">back to home</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[380px]">

        <Link href="/" className="text-[1.2rem] font-extrabold tracking-tight text-[#1c1a16] dark:text-[#f0ede8] block mb-10">
          we<span style={{ color: '#4a9ebb' }}>_</span>share
        </Link>

        <h1 className="text-2xl font-extrabold text-[#1c1a16] dark:text-[#f0ede8] mb-1 tracking-tight">join we_share</h1>
        <p className="text-sm text-[#787068] mb-8">share what you know. build trust.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#787068]">display name</label>
            <input
              type="text" required value={name} onChange={e => setName(e.target.value)}
              placeholder="your name"
              className="w-full px-4 py-3 rounded-lg border bg-[#e8e5e0] dark:bg-[#1e1e1e]
                         border-black/[0.08] dark:border-[#f0ede8]/[0.08]
                         text-[#1c1a16] dark:text-[#f0ede8] placeholder:text-[#787068]
                         text-sm outline-none focus:border-[#4a9ebb]/50 transition-colors"
            />
          </div>

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
              type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="min. 8 characters"
              className="w-full px-4 py-3 rounded-lg border bg-[#e8e5e0] dark:bg-[#1e1e1e]
                         border-black/[0.08] dark:border-[#f0ede8]/[0.08]
                         text-[#1c1a16] dark:text-[#f0ede8] placeholder:text-[#787068]
                         text-sm outline-none focus:border-[#4a9ebb]/50 transition-colors"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button type="submit" disabled={loading}
                  className="ws-btn-primary w-full justify-center mt-2 disabled:opacity-50">
            {loading ? 'creating account…' : 'create account'}
          </button>
        </form>

        <p className="text-sm text-[#787068] mt-6 text-center">
          already have an account?{' '}
          <Link href="/auth/login" className="text-[#4a9ebb] font-semibold hover:underline">log in</Link>
        </p>
      </div>
    </main>
  )
}
