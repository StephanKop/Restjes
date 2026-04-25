'use client'

import { usePathname } from 'next/navigation'

interface MessagesShellProps {
  sidebar: React.ReactNode
  children: React.ReactNode
  basePath: string
}

export function MessagesShell({ sidebar, children, basePath }: MessagesShellProps) {
  const pathname = usePathname() ?? ''
  const hasConversation = pathname !== basePath

  return (
    <div
      className="overflow-hidden rounded-2xl bg-white shadow-card"
      style={{ height: 'calc(100vh - 12rem)' }}
    >
      <div className="flex h-full">
        {/* Sidebar */}
        <div
          className={`h-full flex-shrink-0 overflow-y-auto border-r border-warm-100 p-3 ${
            hasConversation ? 'hidden lg:flex' : 'flex'
          } w-full flex-col lg:w-80`}
        >
          <h2 className="mb-3 px-2 text-lg font-extrabold text-warm-900">Berichten</h2>
          {sidebar}
        </div>

        {/* Chat pane */}
        <div
          className={`h-full min-w-0 flex-1 flex-col ${
            hasConversation ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
