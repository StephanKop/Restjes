import type { Metadata } from 'next'
import Image from 'next/image'
import { getLocale } from 'next-intl/server'
import type { Locale } from '@kliekjesclub/i18n'
import { getPageContent } from '@/lib/cms'
import { getAboutDefaults } from '@/lib/cms-defaults'
import { JsonLd } from '@/components/JsonLd'

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  const content = await getPageContent('about', getAboutDefaults(locale))
  return {
    title: content.seo.metaTitle,
    description: content.seo.metaDescription,
    openGraph: { title: content.seo.metaTitle, description: content.seo.metaDescription },
    alternates: { canonical: '/about' },
  }
}

export default async function AboutPage() {
  const locale = (await getLocale()) as Locale
  const content = await getPageContent('about', getAboutDefaults(locale))

  return (
    <div className="-mx-6 -my-8 space-y-24 pb-24">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: content.heading,
        description: content.seo.metaDescription,
        url: 'https://kliekjesclub.nl/about',
        mainEntity: {
          '@type': 'Organization',
          name: 'Kliekjesclub',
          url: 'https://kliekjesclub.nl',
        },
      }} />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-6">
        <div
          data-reveal-stagger
          className="relative h-[65vh] min-h-[440px] overflow-hidden rounded-3xl shadow-card"
        >
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
          <div className="absolute inset-0 bg-gradient-to-b from-warm-900/70 via-warm-900/50 to-warm-900/80" />
          <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-6 text-center">
            <h1 data-reveal className="mb-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
              {content.heading}
            </h1>
            <p data-reveal className="max-w-2xl text-lg text-warm-100 sm:text-xl">
              {content.subheading}
            </p>
          </div>
        </div>
      </section>

      {/* Mission with image */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-16" data-reveal-stagger>
          <div data-reveal="left" className="relative aspect-[5/4] overflow-hidden rounded-3xl shadow-card">
            <Image
              src="/community.jpg"
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div data-reveal="right">
            <h2 className="mb-6 text-3xl font-extrabold text-warm-900 sm:text-4xl">
              {content.mission.heading}
            </h2>
            {content.mission.paragraphs.map((paragraph, i) => (
              <p key={i} className="mb-4 text-lg leading-relaxed text-warm-600 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Video banner */}
      <section className="mx-auto max-w-6xl px-6">
        <div
          data-reveal="scale"
          className="relative aspect-[21/9] overflow-hidden rounded-3xl shadow-card"
        >
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
            <source src="/auth-bg.mp4" type="video/mp4" />
          </video>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center" data-reveal>
          <h2 className="text-3xl font-extrabold text-warm-900 sm:text-4xl">
            {content.howItWorks.heading}
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" data-reveal-stagger>
          {content.howItWorks.steps.map((step, i) => (
            <div
              key={i}
              data-reveal
              className="relative rounded-2xl bg-white p-6 shadow-card transition-shadow duration-200 hover:shadow-card-hover"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-xl font-extrabold text-brand-700">
                {i + 1}
              </div>
              <h3 className="mb-2 text-lg font-bold text-warm-900">{step.title}</h3>
              <p className="text-sm leading-relaxed text-warm-500">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center" data-reveal>
          <h2 className="text-3xl font-extrabold text-warm-900 sm:text-4xl">
            {content.values.heading}
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3" data-reveal-stagger>
          {content.values.items.map((value, i) => (
            <div
              key={i}
              data-reveal
              className="rounded-2xl border border-warm-200 bg-white p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-card"
            >
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                <ValueIcon index={i} />
              </div>
              <h3 className="mb-2 text-xl font-bold text-warm-900">{value.title}</h3>
              <p className="leading-relaxed text-warm-500">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6">
        <div
          data-reveal="scale"
          className="relative overflow-hidden rounded-3xl shadow-card"
        >
          <Image
            src="/cta-section.png"
            alt=""
            fill
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-warm-900/70" />
          <div className="relative z-10 mx-auto max-w-3xl px-6 py-24 text-center">
            <h2 className="mb-4 text-3xl font-extrabold text-white sm:text-4xl">
              {content.contact.heading}
            </h2>
            <p className="mb-8 text-lg text-warm-100">{content.contact.description}</p>
            <a
              href={`mailto:${content.contact.email}`}
              className="inline-flex rounded-xl bg-brand-500 px-8 py-4 text-lg font-bold text-white shadow-button transition-all duration-150 hover:bg-brand-600 active:scale-[0.97]"
            >
              {content.contact.email}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

function ValueIcon({ index }: { index: number }) {
  const svgProps = {
    className: 'h-7 w-7',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    viewBox: '0 0 24 24',
  }
  if (index === 0) {
    return (
      <svg {...svgProps} aria-hidden="true">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.8 2c1 5 .5 10-2 13.4C16.1 18 13 20 11 20Z" />
        <path d="M2 22s.5-7 6-8" />
      </svg>
    )
  }
  if (index === 1) {
    return (
      <svg {...svgProps} aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  }
  return (
    <svg {...svgProps} aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}
