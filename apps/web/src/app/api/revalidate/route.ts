import { revalidatePath } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Webhook the admin app calls after editing a kennisbank article so the
 * public site invalidates its cached pages immediately instead of waiting
 * for the 1-hour ISR window.
 *
 * Body:  { slug?: string }            // include to also revalidate the article
 * Auth:  bearer token = REVALIDATE_SECRET
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) {
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 })
  }

  const auth = request.headers.get('authorization') ?? ''
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  let body: { slug?: string } = {}
  try {
    body = await request.json()
  } catch {
    // empty body is fine — just revalidate the index
  }

  // Always revalidate the index, sitemap, and RSS feed so the new article
  // shows up everywhere.
  revalidatePath('/kennisbank', 'page')
  revalidatePath('/sitemap.xml')
  revalidatePath('/kennisbank/feed.xml')
  if (body.slug) {
    // /[locale]/(consumer)/kennisbank/[slug] — `'page'` flushes the static
    // params for that specific slug.
    revalidatePath(`/kennisbank/${body.slug}`, 'page')
  }

  return NextResponse.json({ ok: true, slug: body.slug ?? null })
}
