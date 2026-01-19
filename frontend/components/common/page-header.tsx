import Image from 'next/image'

export function PageHeader() {
  return (
    <div className="flex flex-col items-center gap-20 pt-10">
      <Image src="/logo.svg" alt="Monad Logo" width={125} height={25} />
      <div className="flex flex-col items-center px-10 gap-4 w-full">
        <div className="flex flex-row items-center">
          <Image
            src="/live-dot.svg"
            alt="Monad Rings"
            width={60}
            height={60}
            className="-mr-1.5"
          />
          <h1 className="w-fit font-britti-sans text-4xl sm:text-5xl md:text-6xl font-medium leading-none tracking-[-0.08rem] text-white text-center">
            Live Blockchain Execution
          </h1>
        </div>
        <p className="font-britti-sans text-lg sm:text-xl md:text-2xl font-medium text-text-secondary sm:w-2/3 text-center">
          Live visualization of parallel EVM execution events, streamed directly
          from Monad&apos;s execution engine.
        </p>
      </div>
    </div>
  )
}
