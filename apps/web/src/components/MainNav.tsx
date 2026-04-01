import Link from 'next/link'
import { createServerComponentClient } from '@/lib/supabase-server'

export async function MainNav() {
  const supabase = await createServerComponentClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let unreadCount = 0
  if (user) {
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .eq('consumer_id', user.id)

    if (conversations && conversations.length > 0) {
      const conversationIds = conversations.map((c) => c.id)
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .eq('is_read', false)
        .neq('sender_id', user.id)

      unreadCount = count ?? 0
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-warm-100 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-extrabold text-brand-600">
          Restjes
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/browse"
            className="font-semibold text-warm-600 transition-colors hover:text-brand-600"
          >
            Ontdekken
          </Link>
          {user ? (
            <>
              <Link
                href="/aanbieder/dishes"
                className="font-semibold text-warm-600 transition-colors hover:text-brand-600"
              >
                Mijn aanbod
              </Link>
              <Link
                href="/reservations"
                className="font-semibold text-warm-600 transition-colors hover:text-brand-600"
              >
                Reserveringen
              </Link>
              <Link
                href="/messages"
                className="relative font-semibold text-warm-600 transition-colors hover:text-brand-600"
              >
                Berichten
                {unreadCount > 0 && (
                  <span className="absolute -right-4 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl px-5 py-2.5 font-bold text-warm-700 transition-colors hover:bg-warm-100"
              >
                Inloggen
              </Link>
              <Link
                href="/signup"
                className="rounded-xl bg-brand-500 px-5 py-2.5 font-bold text-white shadow-button transition-colors hover:bg-brand-600"
              >
                Aanmelden
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
