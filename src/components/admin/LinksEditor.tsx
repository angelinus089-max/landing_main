import type { LinkItem } from '../../types'

export default function LinksEditor({ links, onChange }: { links: LinkItem[]; onChange: (next: LinkItem[]) => void }) {
  function update(index: number, patch: Partial<LinkItem>) {
    onChange(links.map((link, i) => (i === index ? { ...link, ...patch } : link)))
  }
  function remove(index: number) {
    onChange(links.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="flex flex-col gap-2">
        {links.map((link, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              value={link.label}
              onChange={(e) => update(index, { label: e.target.value })}
              className="input w-32"
              placeholder="이름 (예: 스토어)"
            />
            <input
              value={link.url}
              onChange={(e) => update(index, { url: e.target.value })}
              className="input flex-1"
              placeholder="https://..."
            />
            <button
              type="button"
              onClick={() => update(index, { public: !link.public })}
              className="shrink-0 text-xs text-slate-500"
              title="홈페이지 공개 여부"
            >
              {link.public ? '👁 공개' : '🙈 비공개'}
            </button>
            <button type="button" onClick={() => remove(index)} className="shrink-0 border border-rose-200 px-2 py-1.5 text-xs text-rose-500 hover:bg-rose-50">
              삭제
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...links, { label: '', url: '', public: false }])}
        className="mt-2 border border-dashed border-slate-300 px-4 py-2 text-sm text-slate-500 transition hover:border-sage hover:text-sage-dark"
      >
        + 링크 추가
      </button>
      <p className="mt-1.5 text-xs text-slate-400">기본은 비공개(관리자 전용)예요. 👁를 눌러 홈페이지 공개로 바꿀 수 있어요.</p>
    </div>
  )
}
