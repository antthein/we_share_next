import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'
import Toast from '@/components/Toast'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'we_share — Knowledge Sharing, Legit and Trustworthy',
  description: 'Real knowledge from real people. Community-vetted. No noise.',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth dark`} suppressHydrationWarning>
      <head>
        {/* Apply saved theme before first paint — prevents flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var t = localStorage.getItem('ws-theme') || 'dark';
              document.documentElement.classList.toggle('dark', t === 'dark');
            } catch(e) {
              document.documentElement.classList.add('dark');
            }
          })();
        `}} />
      </head>
      <body className="bg-[#fafaf9] dark:bg-[#111111] text-[#1c1a16] dark:text-[#f0ede8] font-sans antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <Nav />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <Toast />
      </body>
    </html>
  )
}
