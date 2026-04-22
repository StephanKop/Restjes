import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { MainNav } from '@/components/MainNav'
import { Footer } from '@/components/Footer'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('staticPages.notFound')
  return {
    title: t('heading'),
    description: t('body'),
    robots: { index: false, follow: false },
  }
}

export default async function NotFound() {
  const t = await getTranslations('staticPages.notFound')
  return (
    <div className="flex min-h-screen flex-col bg-offwhite">
      <MainNav />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <div className="mx-auto max-w-xl py-16 text-center">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-brand-600">
            404
          </p>
          <h1 className="mb-3 text-4xl font-extrabold text-warm-900">
            {t('heading')}
          </h1>
          <p className="mb-8 text-warm-500">
            {t('body')}
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center rounded-xl bg-brand-500 px-5 py-3 font-bold text-white transition-colors hover:bg-brand-600"
            >
              {t('homeLink')}
            </Link>
            <Link
              href="/browse"
              className="inline-flex items-center rounded-xl border border-warm-200 bg-white px-5 py-3 font-bold text-warm-800 transition-colors hover:border-warm-300"
            >
              {t('browseLink')}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
