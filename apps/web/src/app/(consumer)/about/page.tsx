import type { Metadata } from 'next'
import { getPageContent } from '@/lib/cms'
import { ABOUT_DEFAULTS } from '@/lib/cms-defaults'
import { JsonLd } from '@/components/JsonLd'

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageContent('about', ABOUT_DEFAULTS)
  return {
    title: content.seo.metaTitle,
    description: content.seo.metaDescription,
    openGraph: { title: content.seo.metaTitle, description: content.seo.metaDescription },
    alternates: { canonical: '/about' },
  }
}

export default async function AboutPage() {
  const content = await getPageContent('about', ABOUT_DEFAULTS)

  return (
    <div className="mx-auto max-w-3xl">
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
      <h1 className="mb-2 text-3xl font-extrabold text-warm-900">{content.heading}</h1>
      <p className="mb-10 text-lg text-warm-500">{content.subheading}</p>

      <div className="space-y-10">
        {/* Mission */}
        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2 className="mb-4 text-xl font-bold text-warm-900">{content.mission.heading}</h2>
          {content.mission.paragraphs.map((paragraph, i) => (
            <p key={i} className="mb-4 leading-relaxed text-warm-600 last:mb-0">
              {paragraph}
            </p>
          ))}
        </section>

        {/* How it works */}
        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2 className="mb-4 text-xl font-bold text-warm-900">{content.howItWorks.heading}</h2>
          <div className="space-y-4">
            {content.howItWorks.steps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-bold text-warm-800">{step.title}</h3>
                  <p className="text-sm text-warm-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2 className="mb-4 text-xl font-bold text-warm-900">{content.values.heading}</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {content.values.items.map((value, i) => (
              <div key={i}>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-lg">
                  {value.emoji}
                </div>
                <h3 className="mb-1 font-bold text-warm-800">{value.title}</h3>
                <p className="text-sm text-warm-500">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="rounded-2xl bg-brand-50 p-8 text-center">
          <h2 className="mb-2 text-xl font-bold text-warm-900">{content.contact.heading}</h2>
          <p className="mb-4 text-warm-500">{content.contact.description}</p>
          <a
            href={`mailto:${content.contact.email}`}
            className="inline-block rounded-xl bg-brand-500 px-6 py-3 font-bold text-white transition-colors hover:bg-brand-600"
          >
            {content.contact.email}
          </a>
        </section>
      </div>
    </div>
  )
}
