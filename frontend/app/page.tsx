import BlockSpawner from '../components/block-spawner'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white font-sans">
      <main className="max-w-6xl mx-auto py-12 px-6">
        <h1 className="text-2xl font-bold mb-8 text-center">
          Execution Events SDK Showcase
        </h1>
        <BlockSpawner />
      </main>
    </div>
  )
}
