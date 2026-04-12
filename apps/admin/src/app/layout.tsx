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
    default: 'Kliekjesclub Admin',
    template: '%s | Kliekjesclub Admin',
  },
  description: 'Beheerportaal voor het Kliekjesclub platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={nunito.variable}>
      <body className="min-h-screen bg-offwhite text-warm-800 antialiased">
        {children}
      </body>
    </html>
  )
}
