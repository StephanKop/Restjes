import { useTranslations } from 'next-intl'
import { ChatBubbleIcon } from '@/components/icons'

export default function MerchantMessagesPage() {
  const t = useTranslations('messages.web')
  return (
    <div className="flex h-full items-center justify-center text-center">
      <div>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-warm-50 text-warm-300">
          <ChatBubbleIcon className="h-8 w-8" />
        </div>
        <p className="text-sm text-warm-400">{t('selectConversation')}</p>
      </div>
    </div>
  )
}
