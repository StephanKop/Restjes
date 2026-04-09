'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { formatRelativeDate } from '@/lib/format'

interface Notification {
  id: string
  type: 'message' | 'reservation' | 'review'
  title: string
  body: string
  href: string
  time: string
  read: boolean
}

interface NotificationBellProps {
  userId: string
  initialCount: number
  initialItems: Notification[]
}

export function NotificationBell({ userId, initialCount, initialItems }: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [items] = useState(initialItems)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Listen for new messages via realtime
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const handleNewMessage = useCallback(() => {
    setCount((c) => c + 1)
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('nav-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=neq.${userId}`,
        },
        handleNewMessage,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase, handleNewMessage])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o)
          if (!open) setCount(0)
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-warm-500 transition-all duration-150 hover:bg-warm-100 hover:text-warm-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2"
        aria-label="Meldingen"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="fixed inset-x-3 top-14 z-50 mx-auto max-w-sm overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-warm-100 sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-80">
          <div className="border-b border-warm-100 px-4 py-3">
            <h3 className="text-sm font-bold text-warm-800">Meldingen</h3>
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-warm-400">
              Geen meldingen
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block border-b border-warm-50 px-4 py-3 transition-colors hover:bg-warm-50 active:bg-warm-100 focus-visible:outline-none focus-visible:bg-warm-50 ${
                    !item.read ? 'bg-brand-50/40' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
                      item.type === 'message'
                        ? 'bg-blue-100 text-blue-600'
                        : item.type === 'reservation'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {item.type === 'message' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                          <path fillRule="evenodd" d="M3.43 2.524A41.29 41.29 0 0 1 10 2c2.236 0 4.43.18 6.57.524 1.437.231 2.43 1.49 2.43 2.902v5.148c0 1.413-.993 2.67-2.43 2.902a41.202 41.202 0 0 1-5.183.501l-2.9 2.9a.75.75 0 0 1-1.28-.53v-2.42a41.087 41.087 0 0 1-1.777-.288C4.993 13.245 4 11.986 4 10.574V5.426c0-1.413.993-2.67 2.43-2.902Z" clipRule="evenodd" />
                        </svg>
                      ) : item.type === 'reservation' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                          <path fillRule="evenodd" d="M15.988 3.012A2.25 2.25 0 0 1 18 5.25v6.5A2.25 2.25 0 0 1 15.75 14H13.5V7A2.5 2.5 0 0 0 11 4.5H8.128a2.252 2.252 0 0 1 1.884-1.488A2.25 2.25 0 0 1 12.25 1h1.5a2.25 2.25 0 0 1 2.238 2.012ZM11.5 3.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v.25h-3v-.25Z" clipRule="evenodd" />
                          <path fillRule="evenodd" d="M2 7a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7Zm2 3.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Zm0 3.5a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                          <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-warm-800">{item.title}</p>
                      <p className="truncate text-xs text-warm-500">{item.body}</p>
                      <p className="mt-1 text-[11px] text-warm-400">{formatRelativeDate(item.time)}</p>
                    </div>
                    {!item.read && (
                      <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
