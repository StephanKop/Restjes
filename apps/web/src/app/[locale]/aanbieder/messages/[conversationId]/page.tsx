import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { redirect } from '@/i18n/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { createServerComponentClient, getUser } from '@/lib/supabase-server'
import { ChatThread } from '@/components/ChatThread'

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>
}

export async function generateMetadata({
  params,
}: ConversationPageProps): Promise<Metadata> {
  const { conversationId } = await params
  const supabase = await createServerComponentClient()

  const { data: conversation } = await supabase
    .from('conversations')
    .select('consumer:profiles!conversations_consumer_id_fkey(display_name)')
    .eq('id', conversationId)
    .single()

  const t = await getTranslations('messages.web')
  if (!conversation) {
    return { title: t('conversationMetadataNotFound') }
  }

  const consumer = conversation.consumer as unknown as {
    display_name: string | null
  }

  return {
    title: t('merchantConvoMetadataTitle', { name: consumer?.display_name ?? t('customerFallback') }),
  }
}

export default async function MerchantConversationPage({
  params,
}: ConversationPageProps) {
  const { conversationId } = await params
  const t = await getTranslations('messages.web')
  const locale = await getLocale()
  const supabase = await createServerComponentClient()

  const user = await getUser()

  if (!user) {
    redirect('/login', locale)
  }

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!merchant) {
    redirect('/aanbieder/profile?setup=aanbieder', locale)
  }

  const { data: conversation } = await supabase
    .from('conversations')
    .select(
      `
      id,
      merchant_id,
      consumer:profiles!conversations_consumer_id_fkey (
        id,
        display_name,
        avatar_url
      )
    `,
    )
    .eq('id', conversationId)
    .single()

  if (!conversation || conversation.merchant_id !== merchant.id) {
    notFound()
  }

  const consumer = conversation.consumer as unknown as {
    id: string
    display_name: string | null
    avatar_url: string | null
  }

  const consumerName = consumer?.display_name ?? t('unknownUser')
  const initials = consumerName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const { data: messages } = await supabase
    .from('messages')
    .select('id, content, sender_id, created_at, is_read')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(50)

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-warm-100 px-4 py-3">
        <Link
          href="/aanbieder/messages"
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
        {consumer?.avatar_url ? (
          <Image
            src={consumer.avatar_url}
            alt={consumerName}
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
            {initials}
          </div>
        )}
        <h1 className="font-bold text-warm-800">{consumerName}</h1>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-hidden bg-offwhite">
        <ChatThread
          conversationId={conversationId}
          currentUserId={user.id}
          otherPartyName={consumerName}
          initialMessages={messages ?? []}
        />
      </div>
    </div>
  )
}
