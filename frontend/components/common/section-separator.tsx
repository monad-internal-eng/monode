export function SectionSeparator() {
  return (
    <div
      className="w-full my-10 h-12 border border-zinc-800"
      style={{
        background: `repeating-linear-gradient(
          -45deg,
          transparent,
          transparent 11px,
          #27272A 11px,
          #27272A 12px
        )`,
      }}
    />
  )
}
