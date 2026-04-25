import type { Article } from './types'
import { article as kliekjesGoed } from './hoe-lang-blijven-kliekjes-goed'
import { article as voedselverspillingCijfers } from './voedselverspilling-cijfers-nederland'
import { article as restjesInvriezen } from './restjes-invriezen'
import { article as opwarmIdeeen } from './restjes-opwarmen-ideeen'
import { article as restjesRecepten } from './recepten-met-restjes'
import { article as duurzaamEten } from './duurzaam-eten-thuis'
import { article as voedselbankVergelijking } from './voedselbank-vs-kliekjesclub'
import { article as studentenGratisEten } from './studenten-gratis-eten'
import { article as horecaOverschot } from './horeca-overgebleven-eten'

export * from './types'

// Newest first (drives /kennisbank ordering and RSS feed).
export const ARTICLES: Article[] = [
  horecaOverschot,
  studentenGratisEten,
  voedselbankVergelijking,
  voedselverspillingCijfers,
  duurzaamEten,
  restjesRecepten,
  restjesInvriezen,
  kliekjesGoed,
  opwarmIdeeen,
]

const articleIndex = new Map(ARTICLES.map((a) => [a.slug, a]))

export function findArticle(slug: string): Article | null {
  return articleIndex.get(slug) ?? null
}

export function relatedArticles(article: Article, n = 3): Article[] {
  const sameCategory = ARTICLES.filter(
    (a) => a.category === article.category && a.slug !== article.slug,
  )
  const others = ARTICLES.filter((a) => a.category !== article.category)
  return [...sameCategory, ...others].slice(0, n)
}
