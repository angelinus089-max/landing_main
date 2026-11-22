import { useState } from 'react'
import { useAppState } from '../../state/AppState'
import InstagramInput from '../../utils/InstagramInput'

export default function SettingsPanel() {
  return (
    <div>
      <h2 className="mb-6 text-lg font-medium text-slate-900">설정</h2>
      <div className="flex flex-col gap-10">
        <SiteSettings />
        <TagGroup title="무드 태그 (공간/전시)" useTags={useMoodTags} />
        <TagGroup title="장르 태그 (작가/전시)" useTags={useGenreTags} />
      </div>
    </div>
  )
}

function SiteSettings() {
  const { siteInstagram, updateSiteInstagram } = useAppState()
  const [value, setValue] = useState(siteInstagram)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await updateSiteInstagram(value)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-slate-700">사이트 정보</h3>
      <label className="mb-1.5 block text-sm text-slate-600">하단바에 노출할 인스타그램 아이디</label>
      <div className="flex max-w-sm gap-2">
        <InstagramInput value={value} onChange={setValue} />
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="shrink-0 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
        >
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  )
}

function useMoodTags() {
  const { moodTags, addMoodTag, removeMoodTag } = useAppState()
  return { tags: moodTags, addTag: addMoodTag, removeTag: removeMoodTag }
}

function useGenreTags() {
  const { genreTags, addGenreTag, removeGenreTag } = useAppState()
  return { tags: genreTags, addTag: addGenreTag, removeTag: removeGenreTag }
}

function TagGroup({
  title,
  useTags,
}: {
  title: string
  useTags: () => { tags: string[]; addTag: (label: string) => Promise<void>; removeTag: (label: string) => Promise<void> }
}) {
  const { tags, addTag, removeTag } = useTags()
  const [input, setInput] = useState('')

  function handleAdd() {
    const value = input.trim()
    if (!value || tags.includes(value)) return
    addTag(value)
    setInput('')
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-slate-700">{title}</h3>
      <div className="mb-3 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="flex items-center gap-1.5 bg-sage-light px-3 py-1 text-xs text-sage-dark">
            #{tag}
            <button type="button" onClick={() => removeTag(tag)} className="text-sage-dark hover:text-rose-500">✕</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="input max-w-xs"
          placeholder="새 태그 입력 후 Enter"
        />
        <button type="button" onClick={handleAdd} className="bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
          추가
        </button>
      </div>
    </div>
  )
}
