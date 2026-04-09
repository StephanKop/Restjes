'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { formatRelativeDate } from '@/lib/format'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

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
  currentUserId?: string
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

export function ConversationList({ conversations: initial, basePath, currentUserId }: ConversationListProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [conversations, setConversations] = useState(initial)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => {
    setConversations(initial)
  }, [initial])

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  )

  const handleDeleteClick = useCallback((e: React.MouseEvent, convId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setConfirmDeleteId(convId)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    const convId = confirmDeleteId
    if (!convId) return

    setDeletingId(convId)
    setConfirmDeleteId(null)

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', convId)

    if (error) {
      setDeletingId(null)
      return
    }

    setConversations((prev) => prev.filter((c) => c.id !== convId))
    setDeletingId(null)

    if (pathname === `${basePath}/${convId}`) {
      router.push(basePath)
    }
  }, [confirmDeleteId, supabase, pathname, basePath, router])

  // Subscribe to new messages across all conversations
  useEffect(() => {
    if (!currentUserId) return

    const convIds = conversations.map((c) => c.id)
    if (convIds.length === 0) return

    const channel = supabase
      .channel('conversation-list-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const msg = payload.new as {
            id: string
            conversation_id: string
            sender_id: string
            content: string
            created_at: string
          }

          if (!convIds.includes(msg.conversation_id)) return

          setConversations((prev) => {
            const updated = prev.map((conv) => {
              if (conv.id !== msg.conversation_id) return conv
              const isFromOther = msg.sender_id !== currentUserId
              const isViewing = pathname === `${basePath}/${conv.id}`
              return {
                ...conv,
                lastMessage: msg.content,
                lastMessageAt: msg.created_at,
                unreadCount: isFromOther && !isViewing ? conv.unreadCount + 1 : conv.unreadCount,
              }
            })
            return updated.sort((a, b) => {
              const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
              const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
              return timeB - timeA
            })
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, supabase, basePath, pathname, conversations])

  // Clear unread count when viewing a conversation
  useEffect(() => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (pathname === `${basePath}/${conv.id}` && conv.unreadCount > 0) {
          return { ...conv, unreadCount: 0 }
        }
        return conv
      }),
    )
  }, [pathname, basePath])

  return (
    <div className="space-y-1">
      {conversations.map((conversation) => {
        const href = `${basePath}/${conversation.id}`
        const isActive = pathname === href
        const isDeleting = deletingId === conversation.id

        return (
          <div key={conversation.id} className="group relative">
            <Link
              href={href}
              className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                isActive
                  ? 'bg-brand-50 ring-1 ring-brand-200'
                  : 'hover:bg-warm-50'
              } ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {/* Avatar */}
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                {conversation.otherPartyAvatar ? (
                  <Image
                    src={conversation.otherPartyAvatar}
                    alt={conversation.otherPartyName}
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                ) : (
                  getInitials(conversation.otherPartyName)
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-sm font-bold text-warm-800">
                    {conversation.otherPartyName}
                  </h3>
                  {conversation.lastMessageAt && (
                    <span className="flex-shrink-0 text-[11px] text-warm-400">
                      {formatRelativeDate(conversation.lastMessageAt)}
                    </span>
                  )}
                </div>

                {conversation.lastMessage && (
                  <p className="truncate text-xs text-warm-500">
                    {truncate(conversation.lastMessage, 50)}
                  </p>
                )}
              </div>

              {/* Unread badge */}
              {conversation.unreadCount > 0 && (
                <span className="flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[10px] font-bold text-white">
                  {conversation.unreadCount}
                </span>
              )}
            </Link>

            {/* Delete button — visible on hover */}
            <button
              type="button"
              onClick={(e) => handleDeleteClick(e, conversation.id)}
              disabled={isDeleting}
              className="absolute right-2 top-2 hidden rounded-lg p-1.5 text-warm-400 transition-colors hover:bg-red-50 hover:text-red-500 group-hover:block"
              title="Gesprek verwijderen"
              aria-label="Gesprek verwijderen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )
      })}

      <ConfirmModal
        open={confirmDeleteId !== null}
        title="Gesprek verwijderen?"
        description="Alle berichten in dit gesprek worden permanent verwijderd."
        confirmLabel="Verwijderen"
        cancelLabel="Annuleren"
        variant="danger"
        loading={deletingId !== null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  )
}
