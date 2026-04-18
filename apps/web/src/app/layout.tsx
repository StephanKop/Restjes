import { Suspense } from 'react'
import type { Metadata } from 'next'
import Script from 'next/script'
import { Nunito } from 'next/font/google'
import { NavigationProgress } from '@/components/NavigationProgress'
import { ScrollReveal } from '@/components/ScrollReveal'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://kliekjesclub.nl'),
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  themeColor: '#22c55e',
  title: {
    default: 'Kliekjesclub - Deel je kliekjes, maak iemand blij',
    template: '%s | Kliekjesclub',
  },
  description:
    'Kliekjesclub verbindt mensen die eten over hebben met mensen die er blij mee zijn. Samen tegen voedselverspilling!',
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    siteName: 'Kliekjesclub',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Kliekjesclub' }],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={nunito.variable}>
      <body suppressHydrationWarning className="min-h-screen bg-offwhite text-warm-800 antialiased">
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "wbotmzule1");`}
        </Script>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-2N6YN3XBRW" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-2N6YN3XBRW');`}
        </Script>
        <Suspense>
          <NavigationProgress />
        </Suspense>
        <ScrollReveal />
        {children}
      </body>
    </html>
  )
}
