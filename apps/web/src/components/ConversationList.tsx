import Image from 'next/image'
import Link from 'next/link'
import { formatRelativeDate } from '@/lib/format'

export interface ConversationItem {
  id: string
  otherPartyName: string
  otherPartyAvatar?: string | null
  dishTitle?: string | null
  lastMessage?: string | null
  lastMessageAt?: string | null
  unreadCount: number
}

interface ConversationListProps {
  conversations: ConversationItem[]
  basePath: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '...'
}

export function ConversationList({ conversations, basePath }: ConversationListProps) {
  return (
    <div className="space-y-3">
      {conversations.map((conversation) => (
        <Link
          key={conversation.id}
          href={`${basePath}/${conversation.id}`}
          className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-card transition-colors hover:bg-warm-50"
        >
          {/* Avatar */}
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
            {conversation.otherPartyAvatar ? (
              <Image
                src={conversation.otherPartyAvatar}
                alt={conversation.otherPartyName}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              getInitials(conversation.otherPartyName)
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate font-bold text-warm-800">
                {conversation.otherPartyName}
              </h3>
              {conversation.lastMessageAt && (
                <span className="flex-shrink-0 text-xs text-warm-400">
                  {formatRelativeDate(conversation.lastMessageAt)}
                </span>
              )}
            </div>

            {conversation.dishTitle && (
              <span className="mb-1 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                {conversation.dishTitle}
              </span>
            )}

            {conversation.lastMessage && (
              <p className="truncate text-sm text-warm-500">
                {truncate(conversation.lastMessage, 60)}
              </p>
            )}
          </div>

          {/* Unread badge */}
          {conversation.unreadCount > 0 && (
            <span className="flex h-6 min-w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 px-2 text-xs font-bold text-white">
              {conversation.unreadCount}
            </span>
          )}
        </Link>
      ))}
    </div>
  )
}
