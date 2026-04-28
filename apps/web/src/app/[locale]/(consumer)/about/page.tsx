import type { Metadata } from 'next'
import Image from 'next/image'
import { getLocale } from 'next-intl/server'
import type { Locale } from '@kliekjesclub/i18n'
import { getPageContent } from '@/lib/cms'
import { getAboutDefaults } from '@/lib/cms-defaults'
import { JsonLd } from '@/components/JsonLd'
import { HowItWorksTimeline } from '@/components/HowItWorksTimeline'

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
          className="relative h-[65vh] min-h-[440px] overflow-hidden rounded-3xl shadow-card isolate"
        >
          {/* `rounded-3xl` repeated on the absolutely-positioned children
              because GPU-composited <video> can escape the parent's
              border-radius clip in Safari/Chrome — applying the radius
              directly avoids the squared-corner bug. */}
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster="/hero-poster.jpg"
            className="absolute inset-0 h-full w-full rounded-3xl object-cover"
            aria-hidden="true"
          >
            <source src="/hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-warm-900/70 via-warm-900/50 to-warm-900/80" />
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

      {/* Social aspect — Kliekjesclub is more than waste reduction */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="rounded-3xl bg-cream p-8 sm:p-12 lg:p-16">
          <div className="mx-auto mb-12 max-w-3xl text-center" data-reveal-stagger>
            <p
              data-reveal
              className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-600"
            >
              {locale === 'en' ? 'The human side' : 'Het sociale stuk'}
            </p>
            <h2
              data-reveal
              className="mb-5 text-3xl font-extrabold leading-tight text-warm-900 sm:text-4xl md:text-5xl"
            >
              {locale === 'en'
                ? 'Food brings people together'
                : 'Eten verbindt mensen'}
            </h2>
            <p data-reveal className="text-lg leading-relaxed text-warm-600">
              {locale === 'en'
                ? 'Kliekjesclub is more than fighting food waste — it’s meeting your neighbours, sharing a story over the doorstep, and quietly building a local network of care.'
                : 'Kliekjesclub is meer dan voedselverspilling tegengaan — het is buren leren kennen, een verhaal delen op de stoep, en stilletjes een lokaal netwerk van zorg opbouwen.'}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3" data-reveal-stagger>
            <SocialPillar
              data-reveal="rise"
              icon={<UsersGroupIcon />}
              title={locale === 'en' ? 'Meet your neighbours' : 'Ontmoet je buren'}
              body={
                locale === 'en'
                  ? 'Behind every leftover is a story. A neighbour who cooked too much, a student who just moved in, a parent winding down a busy week. Sharing a meal turns strangers into faces.'
                  : 'Achter elke kliek zit een verhaal. Een buur die te veel heeft gemaakt, een student die net is komen wonen, een ouder die een drukke week afsluit. Eén gedeelde maaltijd maakt van onbekenden gezichten.'
              }
            />
            <SocialPillar
              data-reveal="rise"
              icon={<HandHeartIcon />}
              title={locale === 'en' ? 'Built on trust' : 'Gebouwd op vertrouwen'}
              body={
                locale === 'en'
                  ? 'Reviews, friendly chats, and verified hosts make sharing feel personal — not transactional. Every interaction is between people, not accounts.'
                  : 'Beoordelingen, vriendelijke chats en geverifieerde aanbieders maken delen persoonlijk — niet zakelijk. Elke interactie is tussen mensen, niet tussen accounts.'
              }
            />
            <SocialPillar
              data-reveal="rise"
              icon={<SparklesIcon />}
              title={
                locale === 'en' ? 'A movement, together' : 'Samen een beweging'
              }
              body={
                locale === 'en'
                  ? 'One shared portion is a small gesture. A street full of them is a movement — and that’s exactly what we’re building, household by household, in cities across the country.'
                  : 'Eén gedeelde portie is een klein gebaar. Een hele straat vol is een beweging — en dat is precies wat we bouwen, huishouden voor huishouden, in steden door heel het land.'
              }
            />
          </div>
        </div>
      </section>

      {/* How it works — same timeline component used on the homepage */}
      <section className="mx-auto max-w-6xl px-6">
        <HowItWorksTimeline
          steps={content.howItWorks.steps}
          heading={content.howItWorks.heading}
        />
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

function SocialPillar({
  icon,
  title,
  body,
  ...rest
}: {
  icon: React.ReactNode
  title: string
  body: string
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <article
      {...rest}
      className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold text-warm-900">{title}</h3>
      <p className="leading-relaxed text-warm-600">{body}</p>
      {/* Subtle brand wash on hover so the cards feel responsive without looking
          busy at rest. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-1 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand-300 via-brand-500 to-brand-700 transition-transform duration-500 group-hover:scale-x-100"
      />
    </article>
  )
}

function UsersGroupIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function HandHeartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <path d="M11 14h2a2 2 0 1 0 0-4h-3.4a4 4 0 0 0-2.8 1.17L2 16" />
      <path d="m7 17 2-2h5l4-3.5a2.62 2.62 0 0 1 3.7 3.7L15 21H5l-3-3" />
      <path d="M18 4a3.5 3.5 0 0 0-5 0l-.5.5L12 4a3.5 3.5 0 0 0-5 0 3.51 3.51 0 0 0 0 5l.5.5 5 5 5-5 .5-.5a3.51 3.51 0 0 0 0-5z" />
    </svg>
  )
}

function SparklesIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <path d="M12 3v3" />
      <path d="M12 18v3" />
      <path d="M5.6 5.6l2.1 2.1" />
      <path d="M16.3 16.3l2.1 2.1" />
      <path d="M3 12h3" />
      <path d="M18 12h3" />
      <path d="M5.6 18.4l2.1-2.1" />
      <path d="M16.3 7.7l2.1-2.1" />
      <circle cx="12" cy="12" r="3" />
    </svg>
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
