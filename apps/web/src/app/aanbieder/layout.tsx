import { MainNav } from '@/components/MainNav'
import { Footer } from '@/components/Footer'
import { AanbiederSubNav } from '@/components/AanbiederSubNav'

export default function AanbiederLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-offwhite">
      <MainNav />
      <AanbiederSubNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
      <Footer />
    </div>
  )
}
