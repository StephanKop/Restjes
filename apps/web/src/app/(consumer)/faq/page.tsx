import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import type { Locale } from '@kliekjesclub/i18n'
import { getPageContent } from '@/lib/cms'
import { getFaqDefaults } from '@/lib/cms-defaults'
import { JsonLd } from '@/components/JsonLd'

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  const content = await getPageContent('faq', getFaqDefaults(locale))
  return {
    title: content.seo.metaTitle,
    description: content.seo.metaDescription,
    openGraph: { title: content.seo.metaTitle, description: content.seo.metaDescription },
    alternates: { canonical: '/faq' },
  }
}

export default async function FaqPage() {
  const locale = (await getLocale()) as Locale
  const content = await getPageContent('faq', getFaqDefaults(locale))

  // Build FAQPage schema from all Q&A items
  const faqSchemaItems = content.sections.flatMap((section) =>
    section.items.map((item) => ({
      '@type': 'Question' as const,
      name: item.question,
      acceptedAnswer: { '@type': 'Answer' as const, text: item.answer },
    })),
  )

  return (
    <div className="mx-auto max-w-3xl">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqSchemaItems,
      }} />
      <h1 className="mb-2 text-3xl font-extrabold text-warm-900">{content.heading}</h1>
      <p className="mb-10 text-lg text-warm-500">{content.subheading}</p>

      <div className="space-y-8">
        {content.sections.map((section) => (
          <div key={section.title}>
            <h2 className="mb-4 text-lg font-bold text-warm-800">{section.title}</h2>
            <div className="space-y-3">
              {section.items.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-2xl bg-white shadow-card"
                >
                  <summary className="flex items-center justify-between px-6 py-4 font-semibold text-warm-800 [&::-webkit-details-marker]:hidden">
                    <span>{item.question}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-5 w-5 flex-shrink-0 text-warm-400 transition-transform group-open:rotate-180"
                    >
                      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                  </summary>
                  <div className="border-t border-warm-100 px-6 py-4">
                    <p className="text-sm leading-relaxed text-warm-600">{item.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="mt-10 rounded-2xl bg-brand-50 p-8 text-center">
        <h2 className="mb-2 text-xl font-bold text-warm-900">{content.contact.heading}</h2>
        <p className="mb-4 text-warm-500">{content.contact.description}</p>
        <a
          href={`mailto:${content.contact.email}`}
          className="inline-block rounded-xl bg-brand-500 px-6 py-3 font-bold text-white transition-colors hover:bg-brand-600"
        >
          {content.contact.buttonLabel}
        </a>
      </div>
    </div>
  )
}
