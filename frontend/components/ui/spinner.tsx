import { Loader2 } from 'lucide-react'

interface SpinnerProps {
  text?: string
}

export function Spinner({ text }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 w-full py-8">
      <Loader2 className="text-zinc-500 animate-spin size-12" />
      {text && <p className="text-zinc-500 text-sm">{text}</p>}
    </div>
  )
}
