import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound, redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createServerComponentClient, getUser } from '@/lib/supabase-server'
import { ChatThread } from '@/components/ChatThread'
import { ChatReserveBanner } from '@/components/ChatReserveBanner'

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>
}

export async function generateMetadata({
  params,
}: ConversationPageProps): Promise<Metadata> {
  const { conversationId } = await params
  const supabase = await createServerComponentClient()
  const t = await getTranslations('messages.web')

  const { data: conversation } = await supabase
    .from('conversations')
    .select(`
      merchant:merchants!inner(business_name),
      consumer:profiles!conversations_consumer_id_fkey(display_name)
    `)
    .eq('id', conversationId)
    .single()

  if (!conversation) {
    return { title: t('conversationMetadataNotFound') }
  }

  const merchant = conversation.merchant as unknown as { business_name: string }
  return {
    title: t('conversationMetadataTitle', { name: merchant.business_name }),
  }
}

export default async function ConsumerConversationPage({
  params,
}: ConversationPageProps) {
  const { conversationId } = await params
  const t = await getTranslations('messages.web')
  const supabase = await createServerComponentClient()

  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: conversation } = await supabase
    .from('conversations')
    .select(
      `
      id,
      consumer_id,
      dish_id,
      merchant:merchants!inner (
        id,
        business_name,
        logo_url,
        profile_id
      ),
      consumer:profiles!conversations_consumer_id_fkey (
        id,
        display_name,
        avatar_url
      )
    `,
    )
    .eq('id', conversationId)
    .single()

  if (!conversation) {
    notFound()
  }

  const merchant = conversation.merchant as unknown as {
    id: string
    business_name: string
    logo_url: string | null
    profile_id: string
  }
  const consumer = conversation.consumer as unknown as {
    id: string
    display_name: string | null
    avatar_url: string | null
  }

  // User must be either the consumer or the merchant
  const isConsumer = conversation.consumer_id === user.id
  const isMerchant = merchant.profile_id === user.id
  if (!isConsumer && !isMerchant) {
    notFound()
  }

  // The "other party" is whoever the user is NOT
  const otherName = isConsumer
    ? merchant.business_name
    : (consumer?.display_name ?? t('unknownUser'))
  const otherAvatar = isConsumer ? merchant.logo_url : (consumer?.avatar_url ?? null)

  const initials = otherName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Fetch dish if conversation is tied to one (and user is the consumer)
  let dish: { id: string; title: string; quantity_available: number; status: string; image_url: string | null } | null = null
  if (isConsumer && conversation.dish_id) {
    const { data } = await supabase
      .from('dishes')
      .select('id, title, quantity_available, status, image_url')
      .eq('id', conversation.dish_id)
      .single()
    dish = data
  }

  const { data: messages } = await supabase
    .from('messages')
    .select('id, content, sender_id, created_at, is_read')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(50)

  const showReserveBanner = dish && dish.status === 'available' && dish.quantity_available > 0

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-warm-100 px-4 py-3">
        {/* Back button — mobile only */}
        <Link
          href="/messages"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-warm-500 transition-colors hover:bg-warm-50 hover:text-warm-700 lg:hidden"
          aria-label={t('backAria')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
        {otherAvatar ? (
          <Image
            src={otherAvatar}
            alt={otherName}
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
            {initials}
          </div>
        )}
        <h1 className="font-bold text-warm-800">{otherName}</h1>
      </div>

      {/* Reserve banner */}
      {showReserveBanner && dish && (
        <ChatReserveBanner
          dishId={dish.id}
          dishTitle={dish.title}
          dishImageUrl={dish.image_url}
          merchantId={merchant.id}
          maxQuantity={dish.quantity_available}
        />
      )}

      {/* Chat */}
      <div className="flex-1 overflow-hidden bg-offwhite">
        <ChatThread
          conversationId={conversationId}
          currentUserId={user.id}
          otherPartyName={otherName}
          initialMessages={messages ?? []}
        />
      </div>
    </div>
  )
}
