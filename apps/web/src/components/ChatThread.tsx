'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { formatRelativeDate } from '@/lib/format'

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  is_read: boolean
}

interface ChatThreadProps {
  conversationId: string
  currentUserId: string
  otherPartyName: string
  initialMessages: Message[]
}

export function ChatThread({
  conversationId,
  currentUserId,
  otherPartyName,
  initialMessages,
}: ChatThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef(messages)
  messagesRef.current = messages

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  )

  // Reset messages when conversation changes (split-pane navigation)
  useEffect(() => {
    setMessages(initialMessages)
    setNewMessage('')
  }, [conversationId, initialMessages])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom()
  }, [messages.length, scrollToBottom])

  // Mark unread messages as read
  useEffect(() => {
    const unreadIds = messagesRef.current
      .filter((m) => m.sender_id !== currentUserId && !m.is_read)
      .map((m) => m.id)

    if (unreadIds.length === 0) return

    supabase
      .from('messages')
      .update({ is_read: true })
      .in('id', unreadIds)
      .then(() => {
        setMessages((prev) =>
          prev.map((m) =>
            unreadIds.includes(m.id) ? { ...m, is_read: true } : m,
          ),
        )
      })
  }, [messages.length, currentUserId, supabase])

  // Realtime subscription — stable deps, no re-subscribe on message changes
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages((prev) => {
            // Skip if already present (by real ID or as optimistic message from same sender)
            if (prev.some((m) => m.id === newMsg.id)) return prev
            // Replace optimistic message if this is our own message coming back via realtime
            const optimisticIndex = prev.findIndex(
              (m) => m.id.startsWith('optimistic-') && m.sender_id === newMsg.sender_id && m.content === newMsg.content
            )
            if (optimisticIndex !== -1) {
              const updated = [...prev]
              updated[optimisticIndex] = newMsg
              return updated
            }
            return [...prev, newMsg]
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, supabase])

  const handleSend = async () => {
    const content = newMessage.trim()
    if (!content || sending) return

    setSending(true)
    setNewMessage('')

    // Optimistic: show the message immediately
    const optimisticId = `optimistic-${Date.now()}`
    const optimisticMsg: Message = {
      id: optimisticId,
      content,
      sender_id: currentUserId,
      created_at: new Date().toISOString(),
      is_read: true,
    }
    setMessages((prev) => [...prev, optimisticMsg])

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content,
        })
        .select('id')
        .single()

      if (!error && data) {
        // Replace optimistic message with the real one
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticId ? { ...m, id: data.id } : m))
        )
        await supabase
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversationId)
      } else {
        // Remove optimistic message on failure
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
        setNewMessage(content)
      }
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const shouldShowTimestamp = (index: number): boolean => {
    if (index === 0) return true
    const prev = new Date(messages[index - 1].created_at)
    const curr = new Date(messages[index].created_at)
    return curr.getTime() - prev.getTime() > 30 * 60 * 1000
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-warm-400">
              Begin het gesprek! Stuur je eerste bericht.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message, index) => {
              const isOwn = message.sender_id === currentUserId
              return (
                <div key={message.id}>
                  {shouldShowTimestamp(index) && (
                    <div className="my-4 text-center">
                      <span className="rounded-full bg-warm-100 px-3 py-1 text-xs text-warm-400">
                        {formatRelativeDate(message.created_at)}
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2.5 ${
                        isOwn
                          ? 'rounded-2xl rounded-br-sm bg-brand-500 text-white'
                          : 'rounded-2xl rounded-bl-sm bg-white text-warm-800 shadow-card'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="border-t border-warm-100 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Bericht aan ${otherPartyName}...`}
            className="flex-1 rounded-xl border border-warm-200 bg-offwhite px-4 py-2.5 text-sm text-warm-800 placeholder:text-warm-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Verstuur bericht"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M3.105 2.29a.75.75 0 0 0-.826.95l1.414 4.925A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086L2.28 16.76a.75.75 0 0 0 .826.95l15.5-4.5a.75.75 0 0 0 0-1.42l-15.5-4.5Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
