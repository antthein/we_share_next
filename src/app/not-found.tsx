import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center px-6">
      <div className="text-center max-w-[420px]">
        <p className="text-[5rem] font-black leading-none text-[#1c1a16]/[0.05] dark:text-[#f0ede8]/[0.05] mb-2 select-none">404</p>
        <p className="text-2xl font-bold text-[#1c1a16] dark:text-[#f0ede8] mb-3">page not found</p>
        <p className="text-sm text-[#787068] leading-relaxed mb-10">
          this page doesn&apos;t exist — or it did once and someone dropped it.<br />
          either way, nothing to read here.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/" className="ws-btn-primary">go home</Link>
          <Link href="/browse" className="text-sm font-semibold text-[#787068] hover:text-[#4a9ebb] transition-colors">
            browse posts &rarr;
          </Link>
        </div>
      </div>
    </main>
  )
}
