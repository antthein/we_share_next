import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} dark scroll-smooth`} suppressHydrationWarning>
      <body className="bg-[#fafaf9] dark:bg-[#111111] text-[#1c1a16] dark:text-[#f0ede8] font-sans antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  )
}
