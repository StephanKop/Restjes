import type { Metadata } from 'next'
import Image from 'next/image'
import { getLocale, getTranslations } from 'next-intl/server'
import type { Locale } from '@kliekjesclub/i18n'
import { JsonLd } from '@/components/JsonLd'

const APP_STORE_URL = 'https://apps.apple.com/app/id6763632450'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('staticPages.downloadApp')
  return {
    title: t('metadataTitle'),
    description: t('metadataDescription'),
    openGraph: {
      title: t('metadataTitle'),
      description: t('metadataDescription'),
      images: ['/app-screenshot.png'],
    },
    alternates: { canonical: '/app' },
  }
}

export default async function DownloadAppPage() {
  const t = await getTranslations('staticPages.downloadApp')
  const locale = (await getLocale()) as Locale
  const badgeSrc = locale === 'en' ? '/app-store-badge-en.svg' : '/app-store-badge-nl.svg'

  const features = [
    { title: t('feature1Title'), body: t('feature1Body'), icon: <BellIcon /> },
    { title: t('feature2Title'), body: t('feature2Body'), icon: <BoltIcon /> },
    { title: t('feature3Title'), body: t('feature3Body'), icon: <ChatIcon /> },
    { title: t('feature4Title'), body: t('feature4Body'), icon: <CameraIcon /> },
  ]

  return (
    <div className="-mx-6 -my-8 space-y-24 pb-24">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'MobileApplication',
          name: 'Kliekjesclub',
          operatingSystem: 'iOS',
          applicationCategory: 'LifestyleApplication',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
          downloadUrl: APP_STORE_URL,
        }}
      />

      {/* Hero — clean, no card background; sits on the page surface */}
      <section className="mx-auto max-w-7xl px-6 pt-6" data-reveal-stagger>
        <div className="grid gap-12 py-12 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-16 md:py-20">
          <div>
            <p
              data-reveal
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-700"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-500" />
              </span>
              {t('eyebrow')}
            </p>

            <h1
              data-reveal
              className="mb-5 text-4xl font-extrabold leading-tight text-warm-900 sm:text-5xl md:text-6xl"
            >
              {t('headingPart1')}
              <br />
              <span className="text-brand-600">{t('headingHighlight')}</span>
            </h1>

            <p
              data-reveal
              className="mb-10 max-w-xl text-lg leading-relaxed text-warm-600 sm:text-xl"
            >
              {t('subheading')}
            </p>

            <div data-reveal className="flex flex-wrap items-center gap-4">
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('iosBadgeAria')}
                className="inline-block transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Image
                  src={badgeSrc}
                  alt={t('iosBadgeAria')}
                  width={150}
                  height={50}
                  className="h-[50px] w-auto"
                  unoptimized
                />
              </a>
              <a
                href="#features"
                className="rounded-xl border-2 border-warm-300 px-6 py-3 text-base font-bold text-warm-800 transition-all duration-150 hover:border-warm-400 hover:bg-white active:scale-[0.97]"
              >
                {t('learnMore')}
              </a>
            </div>

            <p
              data-reveal
              className="mt-8 flex items-center gap-2 text-sm text-warm-500"
            >
              <CheckCircleIcon className="h-4 w-4 text-brand-600" />
              {t('heroFreeNote')}
            </p>
          </div>

          <div data-reveal="right" className="flex justify-center md:justify-end">
            <div className="relative w-full max-w-[340px] overflow-hidden rounded-3xl shadow-card">
              <Image
                src="/app-screenshot.png"
                alt={t('screenshotAlt')}
                width={1290}
                height={2796}
                priority
                sizes="(max-width: 768px) 70vw, 340px"
                className="block h-auto w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why the app — cream card with feature pillars, mirrors About-page social pillars */}
      <section id="features" className="mx-auto max-w-7xl px-6">
        <div className="rounded-3xl bg-cream p-8 sm:p-12 lg:p-16">
          <div className="mx-auto mb-12 max-w-3xl text-center" data-reveal-stagger>
            <p
              data-reveal
              className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-600"
            >
              {t('featuresEyebrow')}
            </p>
            <h2
              data-reveal
              className="mb-5 text-3xl font-extrabold leading-tight text-warm-900 sm:text-4xl md:text-5xl"
            >
              {t('featuresHeading')}
            </h2>
            <p
              data-reveal
              className="text-lg leading-relaxed text-warm-600"
            >
              {t('featuresSubheading')}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" data-reveal-stagger>
            {features.map((feature, i) => (
              <article
                key={i}
                data-reveal="rise"
                className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 transition-transform duration-300 group-hover:scale-110">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-xl font-bold text-warm-900">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-warm-600">{feature.body}</p>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 -bottom-1 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand-300 via-brand-500 to-brand-700 transition-transform duration-500 group-hover:scale-x-100"
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Steps — three-up grid, like the values grid on About */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center" data-reveal>
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-600">
            {t('stepsEyebrow')}
          </p>
          <h2 className="text-3xl font-extrabold text-warm-900 sm:text-4xl">
            {t('stepsHeading')}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3" data-reveal-stagger>
          <Step num="1" title={t('step1Title')} body={t('step1Body')} />
          <Step num="2" title={t('step2Title')} body={t('step2Body')} />
          <Step num="3" title={t('step3Title')} body={t('step3Body')} />
        </div>
      </section>

      {/* Android notice — simple white card matching the Contact-page card style */}
      <section className="mx-auto max-w-3xl px-6">
        <div
          data-reveal
          className="flex flex-col items-start gap-5 rounded-2xl bg-white p-8 shadow-card sm:flex-row sm:items-center"
        >
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-warm-100 text-warm-700">
            <AndroidIcon />
          </div>
          <div className="flex-1">
            <p className="mb-1 text-sm font-bold uppercase tracking-wide text-warm-500">
              {t('androidEyebrow')}
            </p>
            <h2 className="mb-1 text-xl font-bold text-warm-900">
              {t('androidNoticeHeading')}
            </h2>
            <p className="text-warm-600">{t('androidNoticeBody')}</p>
          </div>
        </div>
      </section>

      {/* Final CTA — same image-with-overlay rounded-3xl pattern as the About CTA */}
      <section className="mx-auto max-w-7xl px-6">
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
          <div className="absolute inset-0 bg-warm-900/75" />
          <div className="relative z-10 mx-auto max-w-3xl px-6 py-24 text-center">
            <h2 className="mb-4 text-3xl font-extrabold text-white sm:text-4xl">
              {t('ctaHeading')}
            </h2>
            <p className="mb-8 text-lg text-warm-100">{t('ctaBody')}</p>
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('iosBadgeAria')}
              className="inline-block transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Image
                src={badgeSrc}
                alt={t('iosBadgeAria')}
                width={180}
                height={60}
                className="h-[60px] w-auto"
                unoptimized
              />
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

function Step({
  num,
  title,
  body,
}: {
  num: string
  title: string
  body: string
}) {
  return (
    <div
      data-reveal="rise"
      className="rounded-2xl border border-warm-200 bg-white p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-card"
    >
      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-xl font-extrabold text-brand-700">
        {num}
      </div>
      <h3 className="mb-2 text-xl font-bold text-warm-900">{title}</h3>
      <p className="leading-relaxed text-warm-500">{body}</p>
    </div>
  )
}

function AndroidIcon() {
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
      <path d="M5 16V9a7 7 0 0 1 14 0v7" />
      <path d="M5 16h14" />
      <path d="M8 20v-4" />
      <path d="M16 20v-4" />
      <path d="m8 5-1-2" />
      <path d="m16 5 1-2" />
      <circle cx="9" cy="12" r=".5" fill="currentColor" />
      <circle cx="15" cy="12" r=".5" fill="currentColor" />
    </svg>
  )
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function BellIcon() {
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
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}

function BoltIcon() {
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
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )
}

function ChatIcon() {
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
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function CameraIcon() {
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
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}
