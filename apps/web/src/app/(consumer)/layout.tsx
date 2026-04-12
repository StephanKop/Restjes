import { MainNav } from '@/components/MainNav'
import { Footer } from '@/components/Footer'
import { ReviewPromptBanner } from '@/components/ReviewPromptBanner'

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-offwhite">
      <MainNav />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <ReviewPromptBanner />
        {children}
      </main>
      <Footer />
    </div>
  )
}
