import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: {
    default: 'Restjes - Deel je restjes, maak iemand blij',
    template: '%s | Restjes',
  },
  description:
    'Restjes verbindt mensen die eten over hebben met mensen die er blij mee zijn. Samen tegen voedselverspilling!',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={nunito.variable}>
      <body className="min-h-screen bg-offwhite text-warm-800 antialiased">{children}</body>
    </html>
  )
}
