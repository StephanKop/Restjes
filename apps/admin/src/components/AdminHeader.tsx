import { getUser } from '@/lib/supabase-server'
import { LogoutButton } from './LogoutButton'

export async function AdminHeader() {
  const user = await getUser()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-warm-100 bg-white px-6">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-warm-500">{user?.email}</span>
        <LogoutButton />
      </div>
    </header>
  )
}
