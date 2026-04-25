import type { Metadata } from 'next'
import Link from 'next/link'
import { getLocale } from 'next-intl/server'
import type { Locale } from '@kliekjesclub/i18n'
import { MainNav } from '@/components/MainNav'
import { HowItWorks } from '@/components/HowItWorks'
import { Footer } from '@/components/Footer'
import { JsonLd } from '@/components/JsonLd'
import { getPageContent } from '@/lib/cms'
import { getHomepageDefaults, getHowItWorksDefaults } from '@/lib/cms-defaults'

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  const content = await getPageContent('homepage', getHomepageDefaults(locale))
  return {
    title: content.seo.metaTitle,
    description: content.seo.metaDescription,
    openGraph: {
      title: content.seo.metaTitle,
      description: content.seo.metaDescription,
    },
    alternates: { canonical: '/' },
  }
}

export default async function HomePage() {
  const locale = (await getLocale()) as Locale
  const [content, howItWorksContent] = await Promise.all([
    getPageContent('homepage', getHomepageDefaults(locale)),
    getPageContent('how-it-works', getHowItWorksDefaults(locale)),
  ])

  return (
    <div className="flex min-h-screen flex-col bg-warm-900">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Kliekjesclub',
        url: 'https://kliekjesclub.nl',
        logo: 'https://kliekjesclub.nl/logo.png',
        description: content.seo.metaDescription,
        sameAs: [],
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Kliekjesclub',
        url: 'https://kliekjesclub.nl',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://kliekjesclub.nl/browse?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      }} />
      <MainNav transparent />

      {/* Hero */}
      <main className="relative -mt-[72px] flex min-h-[80dvh] flex-col items-center justify-center px-6 pt-[92px] pb-20 text-center md:min-h-[85dvh]">
        {/* Background video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/hero-poster.jpg"
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        {/* Overlay */}
        <div className="absolute inset-0 bg-warm-900/60" />

        {/* Content */}
        <div className="relative z-10">
          <h1 className="mb-6 max-w-3xl text-5xl font-extrabold leading-tight text-white">
            {content.hero.heading}
            <br />
            <span className="text-brand-300">{content.hero.headingHighlight}</span>
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg text-warm-200">
            {content.hero.subheading}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href={content.hero.primaryCta.href}
              className="rounded-xl bg-brand-500 px-8 py-4 text-lg font-bold text-white shadow-button transition-all duration-150 hover:bg-brand-600 active:scale-[0.97] active:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              {content.hero.primaryCta.label}
            </Link>
            <Link
              href={content.hero.secondaryCta.href}
              className="rounded-xl border-2 border-white/80 px-8 py-4 text-lg font-bold text-white transition-all duration-150 hover:bg-white/10 active:scale-[0.97] active:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              {content.hero.secondaryCta.label}
            </Link>
          </div>
        </div>
      </main>

      <HowItWorks content={howItWorksContent} />

      <Footer />
    </div>
  )
}
