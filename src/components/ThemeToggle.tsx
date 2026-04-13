'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('ws-theme') || 'dark'
    setIsDark(saved === 'dark')
    document.documentElement.classList.toggle('dark', saved === 'dark')
  }, [])

  function applyTheme(dark: boolean) {
    setIsDark(dark)
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('ws-theme', dark ? 'dark' : 'light')
  }

  function handleClick() {
    if (isDark && !localStorage.getItem('ws-no-brightness-warn')) {
      setShowWarning(true)
    } else {
      applyTheme(!isDark)
    }
  }

  return (
    <>
      <button onClick={handleClick} aria-label="Toggle theme"
              className="p-2 rounded-lg text-[#787068] hover:text-[#4a9ebb] transition-all">
        {isDark ? (
          // Sun — shown in dark mode
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        ) : (
          // Moon — shown in light mode
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        )}
      </button>

      {/* Brightness warning modal */}
      {showWarning && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowWarning(false) }}
        >
          <div className="bg-[#1a1a1a] border border-[#f0ede8]/10 rounded-2xl p-8 max-w-[320px] w-[90%]
                          shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
               style={{ animation: 'popIn 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <div className="text-[2.2rem] mb-3">🕶️</div>
            <h3 className="text-[#f0ede8] font-extrabold text-[0.95rem] mb-2 tracking-tight">
              warning: extreme brightness ahead
            </h3>
            <p className="text-[#787068] text-[0.78rem] leading-relaxed mb-5">
              you&apos;re switching to light mode.<br />your eyes called. they said no.
            </p>
            <label className="flex items-center gap-2 mb-5 cursor-pointer select-none">
              <input type="checkbox" id="no-warn"
                     className="accent-[#4a9ebb] w-3.5 h-3.5 cursor-pointer"
                     onChange={e => {
                       if (e.target.checked) localStorage.setItem('ws-no-brightness-warn', '1')
                       else localStorage.removeItem('ws-no-brightness-warn')
                     }} />
              <span className="text-[#787068] text-[0.72rem]">i have sunglasses — don&apos;t ask again</span>
            </label>
            <div className="flex gap-2">
              <button onClick={() => setShowWarning(false)}
                      className="flex-1 py-2.5 rounded-lg border border-[#f0ede8]/10 bg-transparent
                                 text-[#787068] text-xs font-semibold hover:border-[#f0ede8]/30 hover:text-[#f0ede8] transition-all">
                stay dark 🌑
              </button>
              <button onClick={() => { setShowWarning(false); applyTheme(false) }}
                      className="flex-1 py-2.5 rounded-lg border-none bg-[#4a9ebb]
                                 text-[#111] text-xs font-bold hover:opacity-85 transition-opacity">
                i&apos;m ready 🌞
              </button>
            </div>
          </div>
          <style>{`@keyframes popIn { from { opacity:0; transform:scale(0.88) translateY(12px) } to { opacity:1; transform:scale(1) translateY(0) } }`}</style>
        </div>
      )}
    </>
  )
}
