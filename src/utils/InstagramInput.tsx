export default function InstagramInput({
  value,
  onChange,
  className = '',
}: {
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  return (
    <div className={`flex items-center overflow-hidden border border-slate-200 focus-within:border-sage ${className}`}>
      <span className="pl-4 text-sm text-slate-400">@</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/^@/, ''))}
        className="w-full border-none px-2 py-2.5 text-sm outline-none"
      />
    </div>
  )
}
