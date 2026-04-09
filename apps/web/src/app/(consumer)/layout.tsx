import { MainNav } from '@/components/MainNav'

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-offwhite">
      <MainNav />
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  )
}
