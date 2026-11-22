import { useEffect, useState } from 'react'
import { useModalState } from '../../state/ModalState'
import { useAppState } from '../../state/AppState'
import { checkEmail, checkInstagram } from '../../utils/validate'
import InstagramInput from '../../utils/InstagramInput'
import RequiredBadge from '../../utils/RequiredBadge'
import { useBodyScrollLock } from '../../utils/useBodyScrollLock'
import type { InquiryType } from '../../types'

export default function InquiryModal() {
  const { inquiryOpen, closeInquiry } = useModalState()
  const { addInquiry } = useAppState()
  useBodyScrollLock(inquiryOpen)

  const [type, setType] = useState<InquiryType | ''>('')
  const [email, setEmail] = useState('')
  const [detail1, setDetail1] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!inquiryOpen) return
    setType('')
    setEmail('')
    setDetail1('')
    setMessage('')
    setErrors({})
    setSubmitted(false)
  }, [inquiryOpen])

  if (!inquiryOpen) return null

  function detail1Label() {
    if (type === '작가 문의') return '인스타그램 아이디'
    if (type === '공간주 문의') return '가게명 및 주소'
    return ''
  }

  async function handleSubmit() {
    const nextErrors: Record<string, string> = {}
    if (!type) nextErrors.type = '문의 유형을 선택해주세요.'
    const emailCheck = checkEmail(email)
    if (!emailCheck.valid) nextErrors.email = emailCheck.message ?? '이메일을 확인해주세요.'
    if (type === '작가 문의') {
      const instaCheck = checkInstagram(detail1, true)
      if (!instaCheck.valid) nextErrors.detail1 = instaCheck.message ?? '인스타그램 아이디를 확인해주세요.'
    } else if (type === '공간주 문의' && !detail1.trim()) {
      nextErrors.detail1 = `${detail1Label()}을 입력해주세요.`
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      await addInquiry({
        type: type as InquiryType,
        email,
        detail1: detail1 || undefined,
        message,
      })
      setSubmitted(true)
    } catch {
      setErrors({ submit: '접수 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 animate-fade-in">
      <div className="relative w-full max-w-md border border-slate-200 bg-white p-8 animate-scale-in">
        <button
          type="button"
          onClick={closeInquiry}
          className="absolute right-6 top-6 text-slate-400 transition hover:text-slate-900"
        >
          ✕
        </button>

        {submitted ? (
          <div className="py-10 text-center">
            <p className="text-lg font-medium text-slate-900">문의가 접수되었어요.</p>
            <p className="mt-2 text-sm text-slate-500">빠르게 확인 후 답변드릴게요.</p>
            <button
              type="button"
              onClick={closeInquiry}
              className="mt-8 bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              확인
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-medium text-slate-900">📩 무엇을 도와드릴까요?</h2>
            <div className="mt-6 flex flex-col gap-4">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm text-slate-600">
                  문의 유형 <RequiredBadge />
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as InquiryType)}
                  className="input"
                >
                  <option value="">선택해주세요</option>
                  <option value="작가 문의">작가 문의</option>
                  <option value="공간주 문의">공간주 문의</option>
                  <option value="일반 문의">일반 문의</option>
                </select>
                {errors.type && <p className="mt-1 text-xs text-rose-500">{errors.type}</p>}
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm text-slate-600">
                  답변 받을 이메일 주소 <RequiredBadge />
                </label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="name@example.com" />
                {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
              </div>

              {(type === '작가 문의' || type === '공간주 문의') && (
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm text-slate-600">
                    {detail1Label()} <RequiredBadge />
                  </label>
                  {type === '작가 문의' ? (
                    <InstagramInput value={detail1} onChange={setDetail1} />
                  ) : (
                    <input value={detail1} onChange={(e) => setDetail1(e.target.value)} className="input" />
                  )}
                  {errors.detail1 && <p className="mt-1 text-xs text-rose-500">{errors.detail1}</p>}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm text-slate-600">문의 내용</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="input resize-none"
                />
              </div>
            </div>
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="mt-8 w-full bg-slate-900 py-3.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
            >
              {submitting ? '등록 처리 중...' : '문의 등록'}
            </button>
            {errors.submit && <p className="mt-2 text-xs text-rose-500">{errors.submit}</p>}
          </>
        )}
      </div>
    </div>
  )
}
