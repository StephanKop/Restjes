import { Suspense } from 'react'
import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Nunito } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { localeMeta, type Locale } from '@kliekjesclub/i18n'
import { NavigationProgress } from '@/components/NavigationProgress'
import { ScrollReveal } from '@/components/ScrollReveal'
import { AuthRefresh } from '@/components/AuthRefresh'
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
  title: {
    default: 'Kliekjesclub - Deel je restjes, red eten en help mee tegen voedselverspilling',
    template: '%s | Kliekjesclub',
  },
  description:
    'Deel of vind kliekjes en restjes bij jou in de buurt. Kliekjesclub verbindt mensen en horeca met overgebleven eten — samen tegen voedselverspilling. Gratis aanbieden, makkelijk reserveren.',
  applicationName: 'Kliekjesclub',
  authors: [{ name: 'Kliekjesclub' }],
  category: 'food',
  keywords: [
    'kliekjes delen',
    'restjes delen',
    'voedselverspilling tegengaan',
    'eten redden',
    'overgebleven eten',
    'duurzaam eten',
    'gratis eten',
    'kliekjesclub',
  ],
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    alternateLocale: ['en_US'],
    siteName: 'Kliekjesclub',
    title: 'Kliekjesclub - Deel je restjes, red eten en help mee tegen voedselverspilling',
    description:
      'Deel of vind kliekjes en restjes bij jou in de buurt. Samen tegen voedselverspilling.',
    url: 'https://kliekjesclub.nl',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Kliekjesclub - Deel je restjes' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kliekjesclub - Deel je restjes',
    description: 'Verbind met mensen en horeca die eten over hebben. Samen tegen voedselverspilling.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  verification: {
    // TODO: Replace with the verification token from Google Search Console
    // (Search Console → Property → Settings → Ownership verification → HTML tag)
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
  },
}

export const viewport: Viewport = {
  themeColor: '#22c55e',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = (await getLocale()) as Locale
  const messages = await getMessages()
  return (
    <html lang={localeMeta[locale]?.htmlLang ?? 'nl-NL'} className={nunito.variable}>
      <body suppressHydrationWarning className="min-h-screen bg-offwhite text-warm-800 antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
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
        <AuthRefresh />
        {children}
        <Analytics />
        <SpeedInsights />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
