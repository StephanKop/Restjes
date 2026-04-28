'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { HowItWorksContent } from '@kliekjesclub/types'
import { localeMeta, type Locale } from '@kliekjesclub/i18n'
import { HowItWorksTimeline } from './HowItWorksTimeline'

function AnimatedNumber({
  target,
  prefix,
  suffix,
}: {
  target: number
  prefix: string
  suffix: string
}) {
  const locale = useLocale() as Locale
  const [value, setValue] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  const startAnimation = useCallback(() => {
    if (hasStarted) return
    setHasStarted(true)

    if (target === 0) {
      setValue(0)
      return
    }

    const duration = 2000
    const start = performance.now()
    const step = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out quart — fast start, long gentle tail
      const eased = 1 - Math.pow(1 - progress, 4)
      setValue(Math.round(eased * target))
      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }
    requestAnimationFrame(step)
  }, [target, hasStarted])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startAnimation()
          observer.disconnect()
        }
      },
      { threshold: 0.5 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [startAnimation])

  return (
    <span ref={ref}>
      {prefix}{value.toLocaleString(localeMeta[locale]?.htmlLang ?? 'nl-NL')}{suffix}
    </span>
  )
}

export function HowItWorks({ content }: { content: HowItWorksContent }) {
  const t = useTranslations('howItWorks')
  const STATS = content.stats.map((s) => ({ target: s.value, prefix: s.prefix, suffix: s.suffix, label: s.label }))
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    )

    const elements = section.querySelectorAll('[data-animate]')
    for (const el of elements) {
      observer.observe(el)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="overflow-hidden">
      {/* Stats bar */}
      <div className="bg-brand-600 px-6 py-12">
        <div className="mx-auto grid max-w-4xl gap-8 text-center sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-4xl font-extrabold text-white sm:text-5xl">
                <AnimatedNumber
                  target={stat.target}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
              </p>
              <p className="mt-2 text-sm font-medium text-brand-100">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works — steps timeline */}
      <div className="bg-cream px-6 py-20">
        <HowItWorksTimeline
          steps={content.steps}
          subtitle={content.section.subtitle}
          heading={content.section.heading}
        />
      </div>

      {/* Community section */}
      <div className="overflow-hidden bg-cream px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
            {/* Image */}
            <div
              className="community-image w-full lg:w-1/2"
              data-animate
            >
              <div className="animate-target relative overflow-hidden rounded-3xl shadow-lg">
                <img
                  src="/community.jpg"
                  alt={t('communityImageAlt')}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/10" />
              </div>
            </div>

            {/* Text */}
            <div className="w-full lg:w-1/2" data-animate>
              <p className="animate-target mb-3 text-sm font-bold uppercase tracking-widest text-brand-600">
                {content.community.subtitle}
              </p>
              <h2 className="animate-target mb-6 text-3xl font-extrabold text-warm-900 lg:text-4xl">
                {content.community.heading}
              </h2>
              <p className="animate-target mb-6 text-lg leading-relaxed text-warm-600">
                {content.community.description}
              </p>
              <div className="animate-target space-y-4">
                {content.community.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-warm-900">{feature.title}</h3>
                      <p className="text-sm text-warm-500">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA banner */}
      <div className="bg-brand-600 px-6 py-16">
        <div
          className="mx-auto max-w-2xl text-center"
          data-animate
        >
          <h2 className="animate-target mb-4 text-3xl font-extrabold text-white">
            {content.cta.heading}
          </h2>
          <p className="animate-target mb-8 text-lg text-brand-100">
            {content.cta.subheading}
          </p>
          <div className="animate-target flex flex-wrap items-center justify-center gap-4">
            <a
              href={content.cta.primaryCta.href}
              className="rounded-xl bg-white px-8 py-4 text-lg font-bold text-brand-600 shadow-button transition-all duration-150 hover:bg-brand-50 active:scale-[0.97] active:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              {content.cta.primaryCta.label}
            </a>
            <a
              href={content.cta.secondaryCta.href}
              className="rounded-xl border-2 border-white/80 px-8 py-4 text-lg font-bold text-white transition-all duration-150 hover:bg-white/10 active:scale-[0.97] active:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              {content.cta.secondaryCta.label}
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .animate-target {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .animate-in .animate-target,
        .animate-in.animate-target {
          opacity: 1;
          transform: translateY(0);
        }
        .community-image .animate-target {
          opacity: 0;
          transform: translateX(-40px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        .community-image.animate-in .animate-target {
          opacity: 1;
          transform: translateX(0);
        }
      `}</style>
    </section>
  )
}
