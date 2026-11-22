import { useState } from 'react'

export function useSelection(ids: string[]) {
  const [selected, setSelected] = useState<string[]>([])

  const allSelected = ids.length > 0 && ids.every((id) => selected.includes(id))

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  function toggleAll() {
    setSelected(allSelected ? [] : ids)
  }

  function clear() {
    setSelected([])
  }

  return { selected, allSelected, toggle, toggleAll, clear }
}
