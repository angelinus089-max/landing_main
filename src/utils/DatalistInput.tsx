export default function DatalistInput({
  value,
  onChange,
  options,
  listId,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  options: string[]
  listId: string
  placeholder?: string
}) {
  return (
    <>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        list={listId}
        placeholder={placeholder}
        className="input"
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </>
  )
}
