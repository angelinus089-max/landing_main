import { useRef, useState } from 'react'
import { uploadImage } from '../../lib/api'

export default function ImageUploadList({ images, onChange }: { images: string[]; onChange: (next: string[]) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  function remove(index: number) {
    onChange(images.filter((_, i) => i !== index))
  }
  function moveUp(index: number) {
    if (index === 0) return
    const next = [...images]
    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
    onChange(next)
  }
  function moveDown(index: number) {
    if (index === images.length - 1) return
    const next = [...images]
    ;[next[index + 1], next[index]] = [next[index], next[index + 1]]
    onChange(next)
  }
  function setCover(index: number) {
    if (index === 0) return
    const next = [...images]
    const [picked] = next.splice(index, 1)
    next.unshift(picked)
    onChange(next)
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setError('')
    setUploading(true)
    try {
      const uploaded: string[] = []
      for (const file of Array.from(files)) {
        uploaded.push(await uploadImage(file))
      }
      onChange([...images, ...uploaded])
    } catch {
      setError('이미지 업로드에 실패했어요. 잠시 후 다시 시도해주세요.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {images.map((img, index) => (
        <div key={img + index} className="flex items-center gap-2 border border-slate-200 p-2">
          <div className="h-14 w-14 shrink-0 overflow-hidden bg-slate-100">
            {img && <img src={img} alt="" className="h-full w-full object-cover" />}
          </div>
          <span className="flex-1 truncate text-xs text-slate-400">{img}</span>
          {index === 0 ? (
            <span className="shrink-0 bg-sage-light px-2 py-1 text-[11px] text-sage-dark">대표 이미지</span>
          ) : (
            <button type="button" onClick={() => setCover(index)} className="shrink-0 border border-slate-200 px-2 py-1 text-[11px] text-slate-500 hover:border-sage">
              대표로 설정
            </button>
          )}
          <button type="button" onClick={() => moveUp(index)} disabled={index === 0} className="shrink-0 border border-slate-200 px-2 py-1 text-xs text-slate-500 disabled:opacity-30">↑</button>
          <button type="button" onClick={() => moveDown(index)} disabled={index === images.length - 1} className="shrink-0 border border-slate-200 px-2 py-1 text-xs text-slate-500 disabled:opacity-30">↓</button>
          <button type="button" onClick={() => remove(index)} className="shrink-0 border border-rose-200 px-2 py-1 text-xs text-rose-500 hover:bg-rose-50">삭제</button>
        </div>
      ))}
      <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleFileSelect} />
      <button
        type="button"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
        className="border border-dashed border-slate-300 px-4 py-2 text-sm text-slate-500 transition hover:border-sage hover:text-sage-dark disabled:opacity-50"
      >
        {uploading ? '업로드 중...' : '+ 내 PC에서 이미지 업로드'}
      </button>
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  )
}
