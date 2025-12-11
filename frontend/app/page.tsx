import BlockStateTracker from '@/components/block-state-tracker'

export default function Home() {
  return (
    <div className="min-h-screen text-white font-sans">
      <main className="py-6 px-4 max-w-5xl mx-auto sm:py-8 sm:px-6 md:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center md:mb-8 bg-linear-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
          Execution Events SDK Showcase
        </h1>
        <BlockStateTracker />
      </main>
    </div>
  )
}
