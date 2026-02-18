import { ContentionTracker } from '@/components/contention-tracker'
import { DashboardHeader } from '@/components/contention-tracker/dashboard-header'
import { CornerDecorationsContainer } from '@/components/ui/corner-decorations-container'

export default function Home() {
  return (
    <div className="min-h-screen text-white font-sans">
      <main className="py-6 px-4 max-w-7xl mx-auto sm:py-8 sm:px-6 md:py-12 flex flex-col">
        <CornerDecorationsContainer className="flex flex-col gap-16 border-zinc-800">
          <div className="px-6 md:px-10 pt-6 md:pt-10">
            <DashboardHeader />
          </div>

          <ContentionTracker />
        </CornerDecorationsContainer>
      </main>
    </div>
  )
}
