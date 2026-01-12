export default function PageHeader() {
  return (
    <div className="pb-8 md:pb-12 border-b border-zinc-500/50">
      <h1 className="w-fit font-britti-sans text-3xl sm:text-4xl md:text-5xl font-medium leading-none tracking-[-0.04rem] text-white underline-glow">
        Execution Events SDK Showcase
      </h1>
      <p className="mt-4 text-base font-normal text-text-secondary">
        Live visualization of parallel EVM execution events streamed directly
        from Monad&apos;s execution engine.
      </p>
    </div>
  )
}
