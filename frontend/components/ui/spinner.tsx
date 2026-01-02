import { Loader2 } from 'lucide-react'

interface SpinnerProps {
  text?: string
}

export function Spinner({ text }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 w-full py-8">
      <Loader2 className="text-[#6a6a7a] animate-spin size-12" />
      {text && <p className="text-[#6a6a7a] text-sm">{text}</p>}
    </div>
  )
}
