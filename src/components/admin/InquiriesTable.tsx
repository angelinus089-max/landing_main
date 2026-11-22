import { useState } from 'react'
import { useAppState } from '../../state/AppState'
import { useSelection } from '../../utils/useSelection'
import type { InquiryData } from '../../types'

const STATUS_OPTIONS: InquiryData['status'][] = ['대기 중', '답변 완료']

export default function InquiriesTable() {
  const { inquiries, updateInquiryStatus, updateInquiryMemo, deleteInquiries } = useAppState()
  const { selected, allSelected, toggle, toggleAll, clear } = useSelection(inquiries.map((i) => i.id))

  function handleDeleteSelected() {
    if (selected.length === 0) return
    if (!window.confirm(`선택한 ${selected.length}건을 삭제할까요?`)) return
    deleteInquiries(selected)
    clear()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-medium text-slate-900">문의내역</h2>
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
      {inquiries.length === 0 ? (
        <p className="text-sm text-slate-400">아직 접수된 문의가 없어요.</p>
      ) : (
        <div className="overflow-x-auto border border-slate-200">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                </th>
                <th className="px-4 py-3 font-medium">유형</th>
                <th className="px-4 py-3 font-medium">이메일</th>
                <th className="px-4 py-3 font-medium">추가 정보</th>
                <th className="px-4 py-3 font-medium">내용</th>
                <th className="px-4 py-3 font-medium">응대 상태</th>
                <th className="px-4 py-3 font-medium">관리자 메모</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry) => (
                <InquiryRow
                  key={inquiry.id}
                  inquiry={inquiry}
                  checked={selected.includes(inquiry.id)}
                  onToggle={() => toggle(inquiry.id)}
                  onStatus={updateInquiryStatus}
                  onMemo={updateInquiryMemo}
                  onDelete={() => {
                    if (window.confirm('이 문의를 삭제할까요?')) deleteInquiries([inquiry.id])
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function InquiryRow({
  inquiry,
  checked,
  onToggle,
  onStatus,
  onMemo,
  onDelete,
}: {
  inquiry: InquiryData
  checked: boolean
  onToggle: () => void
  onStatus: (id: string, status: InquiryData['status']) => void
  onMemo: (id: string, memo: string) => void
  onDelete: () => void
}) {
  const [memo, setMemo] = useState(inquiry.memo)

  return (
    <tr className="border-t border-slate-100">
      <td className="px-4 py-3">
        <input type="checkbox" checked={checked} onChange={onToggle} />
      </td>
      <td className="break-words px-4 py-3 text-slate-900">{inquiry.type}</td>
      <td className="break-words px-4 py-3 text-slate-600">{inquiry.email}</td>
      <td className="break-words px-4 py-3 text-slate-600">{inquiry.detail1 ?? '-'}</td>
      <td className="break-words px-4 py-3 text-slate-600">{inquiry.message || '-'}</td>
      <td className="px-4 py-3">
        <select
          value={inquiry.status}
          onChange={(e) => onStatus(inquiry.id, e.target.value as InquiryData['status'])}
          className="border border-slate-200 px-2 py-1.5 text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-36 border border-slate-200 px-2 py-1.5 text-sm"
            placeholder="메모 입력"
          />
          <button
            type="button"
            onClick={() => onMemo(inquiry.id, memo)}
            className="bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700"
          >
            저장
          </button>
        </div>
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={onDelete}
          className="border border-rose-200 px-3 py-1.5 text-xs text-rose-500 transition hover:bg-rose-50"
        >
          삭제
        </button>
      </td>
    </tr>
  )
}
