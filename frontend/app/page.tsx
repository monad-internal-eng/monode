import BlockSpawner from '../components/block-spawner'

export default function Home() {
  return (
    <div className="h-screen overflow-hidden text-white font-sans sm:min-h-screen sm:h-auto sm:overflow-visible">
      <main className="h-full flex flex-col py-4 px-4 max-w-6xl mx-auto sm:block sm:h-auto sm:py-8 sm:px-6 md:py-12">
        <h1 className="text-2xl font-bold mb-4 text-center shrink-0 md:mb-8">
          Execution Events SDK Showcase
        </h1>
        <BlockSpawner />
      </main>
    </div>
  )
}
