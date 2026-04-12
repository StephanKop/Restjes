import { Suspense } from 'react'
import { AdminSidebar } from '@/components/AdminSidebar'
import { AdminHeader } from '@/components/AdminHeader'

// All admin pages are dynamic — they always need fresh data and a valid session
export const dynamic = 'force-dynamic'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-offwhite">
      <AdminSidebar />
      <div className="ml-60">
        <Suspense fallback={<div className="h-16 border-b border-warm-100 bg-white" />}>
          <AdminHeader />
        </Suspense>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
