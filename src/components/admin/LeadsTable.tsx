import { useState } from 'react'
import { useAppState } from '../../state/AppState'
import { useSelection } from '../../utils/useSelection'
import type { LeadData, MatchTarget } from '../../types'

const STATUS_OPTIONS: LeadData['status'][] = ['대기 중', '연락 완료', '매칭 진행 중', '거절']

type FilterTab = 'all' | MatchTarget

export default function LeadsTable() {
  const { leads, updateLeadStatus, updateLeadMemo, deleteLeads } = useAppState()
  const [filter, setFilter] = useState<FilterTab>('all')

  const filteredLeads = filter === 'all' ? leads : leads.filter((l) => l.type === filter)
  const { selected, allSelected, toggle, toggleAll, clear } = useSelection(filteredLeads.map((l) => l.id))

  function handleDeleteSelected() {
    if (selected.length === 0) return
    if (!window.confirm(`선택한 ${selected.length}건을 삭제할까요?`)) return
    deleteLeads(selected)
    clear()
  }

  return (
    <div>
      <h2 className="mb-6 text-lg font-medium text-slate-900">신규등록 (매칭 접수 리드)</h2>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>전체</FilterButton>
          <FilterButton active={filter === 'artist'} onClick={() => setFilter('artist')}>작가</FilterButton>
          <FilterButton active={filter === 'space'} onClick={() => setFilter('space')}>공간주</FilterButton>
        </div>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={handleDeleteSelected}
            className="border border-rose-200 px-3 py-1.5 text-xs text-rose-500 transition hover:bg-rose-50"
          >
            선택 삭제 ({selected.length})
          </button>
        )}
      </div>

      {filteredLeads.length === 0 ? (
        <p className="text-sm text-slate-400">해당하는 매칭 리드가 없어요.</p>
      ) : (
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2 px-4 text-xs text-slate-500">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} />
            전체 선택
          </label>
          {filteredLeads.map((lead) => (
            <LeadRow
              key={lead.id}
              lead={lead}
              checked={selected.includes(lead.id)}
              onToggle={() => toggle(lead.id)}
              onStatus={updateLeadStatus}
              onMemo={updateLeadMemo}
              onDelete={() => {
                if (window.confirm('이 리드를 삭제할까요?')) deleteLeads([lead.id])
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-4 py-1.5 text-sm transition ${active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-900'}`}
    >
      {children}
    </button>
  )
}

function identifierSummary(lead: LeadData) {
  if (lead.type === 'space') {
    return [lead.contact, lead.address, lead.instagram ? `@${lead.instagram}` : null].filter(Boolean).join(' / ')
  }
  return [lead.email, lead.instagram ? `@${lead.instagram}` : null].filter(Boolean).join(' / ')
}

function LeadRow({
  lead,
  checked,
  onToggle,
  onStatus,
  onMemo,
  onDelete,
}: {
  lead: LeadData
  checked: boolean
  onToggle: () => void
  onStatus: (id: string, status: LeadData['status']) => void
  onMemo: (id: string, memo: string) => void
  onDelete: () => void
}) {
  const [memo, setMemo] = useState(lead.memo)
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-slate-200">
      <div className="flex flex-wrap items-center gap-4 px-4 py-3 text-sm">
        <input type="checkbox" checked={checked} onChange={onToggle} />
        <span className="w-24 break-words font-medium text-slate-900">{lead.name}</span>
        <span className="w-14 text-slate-600">{lead.type === 'space' ? '공간' : '작가'}</span>
        <span className="min-w-[160px] flex-1 break-words text-slate-600">{identifierSummary(lead)}</span>
        <select
          value={lead.status}
          onChange={(e) => onStatus(lead.id, e.target.value as LeadData['status'])}
          className="border border-slate-200 px-2 py-1.5 text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <input
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-36 border border-slate-200 px-2 py-1.5 text-sm"
            placeholder="메모 입력"
          />
          <button
            type="button"
            onClick={() => onMemo(lead.id, memo)}
            className="bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700"
          >
            저장
          </button>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="border border-slate-200 px-3 py-1.5 text-xs text-slate-600 transition hover:border-sage"
        >
          {expanded ? '접기' : '자세히 보기'}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="border border-rose-200 px-3 py-1.5 text-xs text-rose-500 transition hover:bg-rose-50"
        >
          삭제
        </button>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-4">
          <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            {lead.type === 'space' ? (
              <>
                <DetailItem label="가게명" value={lead.name} />
                <DetailItem label="가게 주소" value={lead.address} />
                <DetailItem label="연락받을 연락처" value={lead.contact} />
                <DetailItem label="인스타그램" value={lead.instagram ? `@${lead.instagram}` : '-'} />
              </>
            ) : (
              <>
                <DetailItem label="작가명" value={lead.name} />
                <DetailItem label="이메일" value={lead.email} />
                <DetailItem label="인스타그램" value={lead.instagram ? `@${lead.instagram}` : '-'} />
                <DetailItem
                  label="참여 형태"
                  value={lead.participation === '단체' ? `단체 (${lead.groupSize}명)` : '개인'}
                />
              </>
            )}
          </dl>
          <p className="mt-4 mb-2 text-xs font-medium text-slate-500">온보딩 응답</p>
          <ol className="flex flex-col gap-1.5">
            {lead.answers.map((qa, index) => (
              <li key={index} className="text-sm text-slate-600">
                <span className="text-slate-400">Q{index + 1}. {qa.question}</span>
                <br />
                <span className="text-slate-900">→ {qa.answer}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="break-words text-slate-900">{value || '-'}</dd>
    </div>
  )
}
