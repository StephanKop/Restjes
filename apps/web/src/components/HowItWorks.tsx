'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
    </svg>
  )
}

function MagnifyingGlassIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  )
}

function ChatBubbleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  )
}

function HandThumbUpIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
    </svg>
  )
}

const STEPS: { step: string; icon: ReactNode; title: string; description: string; detail: string }[] = [
  {
    step: '1',
    icon: <CameraIcon className="h-8 w-8" />,
    title: 'Restje plaatsen',
    description:
      'Heb je eten over? Maak een foto, voeg een beschrijving toe en plaats het in een paar seconden.',
    detail: 'Gratis en zonder verplichtingen',
  },
  {
    step: '2',
    icon: <MagnifyingGlassIcon className="h-8 w-8" />,
    title: 'Ontdekken & reserveren',
    description:
      'Mensen in de buurt zien jouw restje op de kaart en kunnen het met een tik reserveren.',
    detail: 'Filter op afstand, dieet en allergenen',
  },
  {
    step: '3',
    icon: <ChatBubbleIcon className="h-8 w-8" />,
    title: 'Even overleggen',
    description:
      'Chat direct met de aanbieder om een ophaaltijd af te spreken die voor jullie allebei werkt.',
    detail: 'Ingebouwde chat, geen telefoonnummer nodig',
  },
  {
    step: '4',
    icon: <HandThumbUpIcon className="h-8 w-8" />,
    title: 'Ophalen & genieten',
    description:
      'Loop even langs om de hoek, haal je maaltijd op en geniet! Laat daarna een beoordeling achter.',
    detail: 'Samen tegen voedselverspilling',
  },
]

const STATS = [
  { target: 40, prefix: '', suffix: '%', label: 'van voedsel wordt verspild in Nederland' },
  { target: 800, prefix: '€', suffix: '', label: 'gooit een gemiddeld huishouden per jaar weg' },
  { target: 0, prefix: '', suffix: ',-', label: 'het kost je niks om mee te doen' },
]

function AnimatedNumber({
  target,
  prefix,
  suffix,
}: {
  target: number
  prefix: string
  suffix: string
}) {
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
      {prefix}{value.toLocaleString('nl-NL')}{suffix}
    </span>
  )
}

export function HowItWorks() {
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

      {/* How it works */}
      <div className="bg-cream px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center" data-animate>
            <p
              className="animate-target mb-3 text-sm font-bold uppercase tracking-widest text-brand-600"
            >
              Zo simpel is het
            </p>
            <h2 className="animate-target text-4xl font-extrabold text-warm-900">
              Hoe werkt Kliekjesclub?
            </h2>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line (desktop) */}
            <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-brand-200 md:block" />

            <div className="space-y-12 md:space-y-0">
              {STEPS.map((step, i) => {
                const isEven = i % 2 === 0
                return (
                  <div
                    key={step.step}
                    data-animate
                    className="animate-target relative md:flex md:items-center md:py-8"
                    style={{ transitionDelay: `${i * 150}ms` }}
                  >
                    {/* Desktop: alternating left/right */}
                    <div
                      className={`md:w-1/2 ${isEven ? 'md:pr-16 md:text-right' : 'md:order-2 md:pl-16'}`}
                    >
                      <div
                        className={`rounded-2xl bg-white p-6 shadow-card transition-shadow hover:shadow-card-hover ${
                          isEven ? 'md:ml-auto md:mr-0' : ''
                        } max-w-sm`}
                      >
                        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                          {step.icon}
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-warm-900">
                          {step.title}
                        </h3>
                        <p className="text-warm-600">{step.description}</p>
                        <p className="mt-3 text-sm font-semibold text-brand-600">
                          {step.detail}
                        </p>
                      </div>
                    </div>

                    {/* Center dot */}
                    <div className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:flex">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-sm font-extrabold text-white shadow-lg ring-4 ring-cream">
                        {step.step}
                      </div>
                    </div>

                    {/* Empty other side (desktop) */}
                    <div
                      className={`hidden md:block md:w-1/2 ${isEven ? 'md:order-2' : ''}`}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
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
                  alt="Buren die eten delen"
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/10" />
              </div>
            </div>

            {/* Text */}
            <div className="w-full lg:w-1/2" data-animate>
              <p className="animate-target mb-3 text-sm font-bold uppercase tracking-widest text-brand-600">
                Meer dan eten delen
              </p>
              <h2 className="animate-target mb-6 text-3xl font-extrabold text-warm-900 lg:text-4xl">
                Verbind met je buren
              </h2>
              <p className="animate-target mb-6 text-lg leading-relaxed text-warm-600">
                Kliekjesclub gaat verder dan alleen voedselverspilling tegengaan. Het is een manier om
                je buren te leren kennen, een praatje te maken aan de deur en samen te zorgen
                voor een hechte buurt.
              </p>
              <div className="animate-target space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-warm-900">Leer je buren kennen</h3>
                    <p className="text-sm text-warm-500">Een bakje eten is het begin van een nieuw contact om de hoek.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-warm-900">Maak iemand blij</h3>
                    <p className="text-sm text-warm-500">Een warme maaltijd kan iemands dag helemaal goed maken.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 0 1-1.161.886l-.143.048a1.107 1.107 0 0 0-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 0 1-1.652.928l-.679-.906a1.125 1.125 0 0 0-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 1 0 6.69 14.036m-6.69-14.036a8.963 8.963 0 0 1 2.555-.568A9 9 0 0 1 21 12c0 .778-.099 1.533-.284 2.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-warm-900">Beter voor de planeet</h3>
                    <p className="text-sm text-warm-500">Elke portie die gedeeld wordt is voedsel dat niet verspild wordt.</p>
                  </div>
                </div>
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
            Klaar om mee te doen?
          </h2>
          <p className="animate-target mb-8 text-lg text-brand-100">
            Samen zorgen we ervoor dat minder eten in de prullenbak belandt.
          </p>
          <div className="animate-target flex flex-wrap items-center justify-center gap-4">
            <a
              href="/browse"
              className="rounded-xl bg-white px-8 py-4 text-lg font-bold text-brand-600 shadow-button transition-all duration-150 hover:bg-brand-50 active:scale-[0.97] active:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              Bekijk het aanbod
            </a>
            <a
              href="/signup"
              className="rounded-xl border-2 border-white/80 px-8 py-4 text-lg font-bold text-white transition-all duration-150 hover:bg-white/10 active:scale-[0.97] active:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              Maak een account
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
