import { useState } from 'react'

export default function ExpandableTextarea({
  value,
  onChange,
  rows = 3,
}: {
  value: string
  onChange: (value: string) => void
  rows?: number
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="input resize-none pr-9"
        />
        <button
          type="button"
          onClick={() => setExpanded(true)}
          title="크게 보기"
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center border border-slate-200 bg-white text-xs text-slate-500 transition hover:border-slate-900 hover:text-slate-900"
        >
          ⤢
        </button>
      </div>

      {expanded && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 animate-fade-in">
          <div className="flex w-full max-w-2xl flex-col border border-slate-200 bg-white p-6 animate-scale-in">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900">전체 내용 보기 / 편집</p>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="text-slate-400 transition hover:text-slate-900"
              >
                ✕
              </button>
            </div>
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              rows={16}
              autoFocus
              className="input resize-none"
            />
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="mt-4 self-end bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              완료
            </button>
          </div>
        </div>
      )}
    </>
  )
}
