export interface PageSeo {
  metaTitle: string
  metaDescription: string
}

export interface CtaButton {
  label: string
  href: string
}

export interface HomepageContent {
  seo: PageSeo
  hero: {
    heading: string
    headingHighlight: string
    subheading: string
    primaryCta: CtaButton
    secondaryCta: CtaButton
  }
}

export interface HowItWorksContent {
  seo: PageSeo
  section: {
    subtitle: string
    heading: string
  }
  stats: Array<{
    value: number
    prefix: string
    suffix: string
    label: string
  }>
  steps: Array<{
    title: string
    description: string
    detail: string
  }>
  community: {
    subtitle: string
    heading: string
    description: string
    features: Array<{ title: string; description: string }>
  }
  cta: {
    heading: string
    subheading: string
    primaryCta: CtaButton
    secondaryCta: CtaButton
  }
}

export interface AboutContent {
  seo: PageSeo
  heading: string
  subheading: string
  mission: {
    heading: string
    paragraphs: string[]
  }
  howItWorks: {
    heading: string
    steps: Array<{ title: string; description: string }>
  }
  values: {
    heading: string
    items: Array<{ emoji: string; title: string; description: string }>
  }
  contact: {
    heading: string
    description: string
    email: string
  }
}

export interface FaqContent {
  seo: PageSeo
  heading: string
  subheading: string
  sections: Array<{
    title: string
    items: Array<{ question: string; answer: string }>
  }>
  contact: {
    heading: string
    description: string
    buttonLabel: string
    email: string
  }
}

export type PageSlug = 'homepage' | 'how-it-works' | 'about' | 'faq'

export type PageContentMap = {
  homepage: HomepageContent
  'how-it-works': HowItWorksContent
  about: AboutContent
  faq: FaqContent
}
