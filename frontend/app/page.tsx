import BlockSpawner from '../components/block-spawner'

export default function Home() {
  return (
    <div className="min-h-screen text-white font-sans max-sm:h-screen max-sm:overflow-hidden">
      <main className="max-w-6xl mx-auto py-12 px-6 max-md:py-8 max-md:px-6 max-sm:h-full max-sm:flex max-sm:flex-col max-sm:py-4 max-sm:px-4">
        <h1 className="text-2xl font-bold mb-8 text-center max-md:mb-4 max-sm:shrink-0">
          Execution Events SDK Showcase
        </h1>
        <BlockSpawner />
      </main>
    </div>
  )
}
