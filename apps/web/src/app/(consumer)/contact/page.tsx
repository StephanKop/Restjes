import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { JsonLd } from '@/components/JsonLd'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('staticPages.contact')
  return {
    title: t('metadataTitle'),
    description: t('metadataDescription'),
    alternates: { canonical: '/contact' },
  }
}

const SUPPORT_EMAIL = 'info@kliekjesclub.nl'

export default async function ContactPage() {
  const t = await getTranslations('staticPages.contact')
  return (
    <div className="mx-auto max-w-3xl">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: `${t('heading')} - Kliekjesclub`,
          description: t('metadataDescription'),
          url: 'https://kliekjesclub.nl/contact',
          isPartOf: {
            '@type': 'WebSite',
            name: 'Kliekjesclub',
            url: 'https://kliekjesclub.nl',
          },
        }}
      />

      <h1 className="mb-2 text-3xl font-extrabold text-warm-900">{t('heading')}</h1>
      <p className="mb-8 text-warm-500">
        {t('subheading')}
      </p>

      <section className="mb-6 rounded-2xl bg-white p-8 shadow-card">
        <h2 className="mb-2 text-xl font-bold text-warm-900">{t('emailHeading')}</h2>
        <p className="mb-4 text-warm-600">
          {t('emailBody')}
        </p>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="inline-flex items-center rounded-xl bg-brand-500 px-5 py-3 font-bold text-white transition-colors hover:bg-brand-600"
        >
          {SUPPORT_EMAIL}
        </a>
      </section>

      <section className="mb-6 rounded-2xl bg-white p-8 shadow-card">
        <h2 className="mb-2 text-xl font-bold text-warm-900">{t('faqHeading')}</h2>
        <p className="mb-4 text-warm-600">
          {t('faqBody')}
        </p>
        <Link
          href="/faq"
          className="inline-flex items-center rounded-xl border border-warm-200 bg-white px-5 py-3 font-bold text-warm-800 transition-colors hover:border-warm-300"
        >
          {t('faqCta')}
        </Link>
      </section>

      <section className="rounded-2xl bg-white p-8 shadow-card">
        <h2 className="mb-2 text-xl font-bold text-warm-900">{t('aboutHeading')}</h2>
        <p className="text-warm-600">
          {t('aboutBody')}
        </p>
      </section>
    </div>
  )
}
