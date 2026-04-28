'use client'

import { useEffect, useRef, type ReactNode } from 'react'

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

const STEP_ICONS: ReactNode[] = [
  <CameraIcon key="camera" className="h-8 w-8" />,
  <MagnifyingGlassIcon key="search" className="h-8 w-8" />,
  <ChatBubbleIcon key="chat" className="h-8 w-8" />,
  <HandThumbUpIcon key="thumbup" className="h-8 w-8" />,
]

export interface HowItWorksTimelineStep {
  title: string
  description: string
  detail?: string
}

interface HowItWorksTimelineProps {
  steps: HowItWorksTimelineStep[]
  heading?: string
  subtitle?: string
}

/**
 * Vertical timeline with alternating left/right cards, used on both the
 * homepage and the about page. Each step gets a themed icon and the cards
 * fade/slide into view as the section enters the viewport.
 */
export function HowItWorksTimeline({ steps, heading, subtitle }: HowItWorksTimelineProps) {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('hiwt-in')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    )

    const elements = section.querySelectorAll('[data-hiwt]')
    for (const el of elements) {
      observer.observe(el)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={sectionRef} className="overflow-hidden">
      {(subtitle || heading) && (
        <div className="mb-16 text-center" data-hiwt>
          {subtitle && (
            <p className="hiwt-target mb-3 text-sm font-bold uppercase tracking-widest text-brand-600">
              {subtitle}
            </p>
          )}
          {heading && (
            <h2 className="hiwt-target text-3xl font-extrabold text-warm-900 sm:text-4xl">
              {heading}
            </h2>
          )}
        </div>
      )}

      <div className="relative mx-auto max-w-4xl">
        {/* Vertical line — desktop only */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-brand-200 md:block"
        />

        <div className="space-y-12 md:space-y-0">
          {steps.map((step, i) => {
            const isEven = i % 2 === 0
            const icon = STEP_ICONS[i] ?? STEP_ICONS[0]
            return (
              <div
                key={i}
                data-hiwt
                className="hiwt-target relative md:flex md:items-center md:py-8"
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                {/* Card side */}
                <div
                  className={`md:w-1/2 ${isEven ? 'md:pr-16 md:text-right' : 'md:order-2 md:pl-16'}`}
                >
                  <div
                    className={`max-w-sm rounded-2xl bg-white p-6 shadow-card transition-shadow hover:shadow-card-hover ${
                      isEven ? 'md:ml-auto md:mr-0' : ''
                    }`}
                  >
                    <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      {icon}
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-warm-900">{step.title}</h3>
                    <p className="text-warm-600">{step.description}</p>
                    {step.detail && (
                      <p className="mt-3 text-sm font-semibold text-brand-600">
                        {step.detail}
                      </p>
                    )}
                  </div>
                </div>

                {/* Center dot */}
                <div className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:flex">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-sm font-extrabold text-white shadow-button ring-4 ring-cream">
                    {i + 1}
                  </div>
                </div>

                {/* Empty other side (desktop) */}
                <div className={`hidden md:block md:w-1/2 ${isEven ? 'md:order-2' : ''}`} />
              </div>
            )
          })}
        </div>
      </div>

      <style>{`
        [data-hiwt] .hiwt-target,
        [data-hiwt].hiwt-target {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .hiwt-in .hiwt-target,
        .hiwt-in.hiwt-target {
          opacity: 1;
          transform: translateY(0);
        }
        @media (prefers-reduced-motion: reduce) {
          [data-hiwt] .hiwt-target,
          [data-hiwt].hiwt-target {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>
    </div>
  )
}
