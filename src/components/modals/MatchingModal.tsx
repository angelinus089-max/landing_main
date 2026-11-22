import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useModalState } from '../../state/ModalState'
import { useAppState } from '../../state/AppState'
import { OTHER_OPTION, artistQuestions, spaceQuestions } from '../../data/questions'
import { checkAddress, checkEmail, checkInstagram } from '../../utils/validate'
import InstagramInput from '../../utils/InstagramInput'
import RequiredBadge from '../../utils/RequiredBadge'
import { useBodyScrollLock } from '../../utils/useBodyScrollLock'
import type { MatchTarget } from '../../types'

type Step = 'select' | number | 'loading' | 'form' | 'success'

export default function MatchingModal() {
  const { matchingOpen, matchingInitialTarget, closeMatching } = useModalState()
  const { addLead } = useAppState()
  const navigate = useNavigate()
  useBodyScrollLock(matchingOpen)

  const [target, setTarget] = useState<MatchTarget | null>(null)
  const [step, setStep] = useState<Step>('select')
  const [answers, setAnswers] = useState<string[]>([])
  const [otherText, setOtherText] = useState('')

  const [storeName, setStoreName] = useState('')
  const [storeAddress, setStoreAddress] = useState('')
  const [storeContact, setStoreContact] = useState('')
  const [storeInsta, setStoreInsta] = useState('')

  const [artistName, setArtistName] = useState('')
  const [artistEmail, setArtistEmail] = useState('')
  const [artistInsta, setArtistInsta] = useState('')
  const [participation, setParticipation] = useState<'individual' | 'group'>('individual')
  const [groupSize, setGroupSize] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!matchingOpen) return
    if (matchingInitialTarget) {
      setTarget(matchingInitialTarget)
      setStep(0)
    } else {
      setTarget(null)
      setStep('select')
    }
    setAnswers([])
    setOtherText('')
    setStoreName('')
    setStoreAddress('')
    setStoreContact('')
    setStoreInsta('')
    setArtistName('')
    setArtistEmail('')
    setArtistInsta('')
    setParticipation('individual')
    setGroupSize('')
    setErrors({})
  }, [matchingOpen, matchingInitialTarget])

  if (!matchingOpen) return null

  const questions = target === 'artist' ? artistQuestions : spaceQuestions

  function selectTarget(t: MatchTarget) {
    setTarget(t)
    setStep(0)
  }

  function advanceWithAnswer(option: string) {
    const currentIndex = typeof step === 'number' ? step : 0
    const nextAnswers = [...answers.slice(0, currentIndex), option]
    setAnswers(nextAnswers)
    setOtherText('')
    if (currentIndex + 1 < questions.length) {
      setStep(currentIndex + 1)
    } else {
      setStep('loading')
      setTimeout(() => setStep('form'), 2000)
    }
  }

  function selectAnswer(option: string) {
    if (option === OTHER_OPTION) {
      setOtherText('')
      const currentIndex = typeof step === 'number' ? step : 0
      setAnswers((prev) => [...prev.slice(0, currentIndex), OTHER_OPTION])
      return
    }
    advanceWithAnswer(option)
  }

  function goBack() {
    if (typeof step === 'number') {
      if (step === 0) {
        if (matchingInitialTarget) return
        setTarget(null)
        setAnswers([])
        setStep('select')
      } else {
        setStep(step - 1)
      }
    } else if (step === 'form') {
      setStep(questions.length - 1)
    }
  }

  const showBack = typeof step === 'number' ? step > 0 || !matchingInitialTarget : step === 'form'
  const isOtherSelected = typeof step === 'number' && answers[step] === OTHER_OPTION

  async function handleSubmit() {
    const nextErrors: Record<string, string> = {}
    if (target === 'space') {
      if (!storeName.trim()) nextErrors.storeName = '가게명을 입력해주세요.'
      const addressCheck = checkAddress(storeAddress)
      if (!addressCheck.valid) nextErrors.storeAddress = addressCheck.message ?? '주소를 확인해주세요.'
      if (!storeContact.trim()) nextErrors.storeContact = '연락받을 연락처를 입력해주세요.'
      const instaCheck = checkInstagram(storeInsta, false)
      if (!instaCheck.valid) nextErrors.storeInsta = instaCheck.message ?? '인스타그램 아이디를 확인해주세요.'
    } else if (target === 'artist') {
      if (!artistName.trim()) nextErrors.artistName = '작가명을 입력해주세요.'
      const emailCheck = checkEmail(artistEmail)
      if (!emailCheck.valid) nextErrors.artistEmail = emailCheck.message ?? '이메일을 확인해주세요.'
      const instaCheck = checkInstagram(artistInsta, true)
      if (!instaCheck.valid) nextErrors.artistInsta = instaCheck.message ?? '인스타그램 아이디를 확인해주세요.'
      if (participation === 'group' && !groupSize.trim()) nextErrors.groupSize = '인원수를 입력해주세요.'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const structuredAnswers = questions.map((q, i) => ({ question: q.question, answer: answers[i] }))

    setIsSubmitting(true)
    try {
      if (target === 'space') {
        await addLead({
          type: 'space',
          name: storeName,
          address: storeAddress,
          contact: storeContact,
          instagram: storeInsta || undefined,
          answers: structuredAnswers,
        })
      } else if (target === 'artist') {
        await addLead({
          type: 'artist',
          name: artistName,
          email: artistEmail,
          instagram: artistInsta,
          participation: participation === 'group' ? '단체' : '개인',
          groupSize: participation === 'group' ? groupSize : undefined,
          answers: structuredAnswers,
        })
      }
      setStep('success')
    } catch {
      setErrors({ submit: '접수 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleConfirmSuccess() {
    closeMatching()
    navigate('/archive')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 animate-fade-in">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto border border-slate-200 bg-white p-8 animate-scale-in">
        <button
          type="button"
          onClick={closeMatching}
          className="absolute right-6 top-6 text-slate-400 transition hover:text-slate-900"
        >
          ✕
        </button>

        {step === 'select' && (
          <div className="pt-4 text-center">
            <h2 className="text-lg font-medium text-slate-900">무엇을 하고 싶으신가요?</h2>
            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => selectTarget('space')}
                className="border border-slate-200 py-3.5 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
              >
                내 공간에 작품 걸기
              </button>
              <button
                type="button"
                onClick={() => selectTarget('artist')}
                className="bg-slate-900 py-3.5 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                내 작품 전시하기
              </button>
            </div>
          </div>
        )}

        {typeof step === 'number' && (
          <div className="pt-4">
            <div className="mb-6 flex items-center justify-between">
              {showBack ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="text-xs font-medium text-slate-400 transition hover:text-slate-900"
                >
                  ← 이전
                </button>
              ) : (
                <span />
              )}
              <p className="text-xs font-medium text-sage-dark">{step + 1} / {questions.length}</p>
            </div>
            <h2 className="text-lg font-medium leading-relaxed text-slate-900">
              {questions[step].question}
            </h2>
            <div className="mt-8 flex flex-col gap-3">
              {questions[step].options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => selectAnswer(option)}
                  className={`border px-5 py-3.5 text-left text-sm transition hover:border-sage hover:bg-sage-light hover:text-sage-dark ${
                    answers[step] === option
                      ? 'border-sage bg-sage-light text-sage-dark'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {isOtherSelected && (
              <div className="mt-3 flex gap-2">
                <input
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  className="input"
                  placeholder="직접 입력해주세요"
                  autoFocus
                />
                <button
                  type="button"
                  disabled={!otherText.trim()}
                  onClick={() => advanceWithAnswer(otherText.trim())}
                  className="shrink-0 bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-30"
                >
                  다음
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center gap-6 py-16">
            <div className="h-10 w-10 animate-spin border-4 border-sage-light border-t-sage" />
            <p className="text-sm text-slate-500">AI가 맞춤 매칭을 준비하고 있어요...</p>
          </div>
        )}

        {step === 'form' && target === 'space' && (
          <div className="pt-4">
            <button
              type="button"
              onClick={goBack}
              className="mb-4 text-xs font-medium text-slate-400 transition hover:text-slate-900"
            >
              ← 이전
            </button>
            <h2 className="text-lg font-medium text-slate-900">AI 매칭 준비 완료! 정보를 남겨주세요.</h2>
            <div className="mt-6 flex flex-col gap-4">
              <Field label="가게명" required error={errors.storeName}>
                <input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="가게 주소" required error={errors.storeAddress}>
                <input
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  className="input"
                  placeholder="예: 서울시 강남구 테헤란로 123"
                />
              </Field>
              <Field label="연락받을 연락처" required error={errors.storeContact}>
                <input
                  value={storeContact}
                  onChange={(e) => setStoreContact(e.target.value)}
                  className="input"
                  placeholder="인스타, 이메일, 전화번호 등 편하신 연락처를 남겨주세요"
                />
              </Field>
              <Field label="인스타그램 ID" error={errors.storeInsta}>
                <InstagramInput value={storeInsta} onChange={setStoreInsta} />
              </Field>
            </div>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="mt-8 w-full bg-slate-900 py-3.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
            >
              {isSubmitting ? '접수 처리 중...' : '최종 매칭 접수하기'}
            </button>
            {errors.submit && <p className="mt-2 text-xs text-rose-500">{errors.submit}</p>}
          </div>
        )}

        {step === 'form' && target === 'artist' && (
          <div className="pt-4">
            <button
              type="button"
              onClick={goBack}
              className="mb-4 text-xs font-medium text-slate-400 transition hover:text-slate-900"
            >
              ← 이전
            </button>
            <h2 className="text-lg font-medium text-slate-900">AI 매칭 준비 완료! 정보를 남겨주세요.</h2>
            <div className="mt-6 flex flex-col gap-4">
              <Field label="작가명" required error={errors.artistName}>
                <input
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="이메일" required error={errors.artistEmail}>
                <input
                  value={artistEmail}
                  onChange={(e) => setArtistEmail(e.target.value)}
                  className="input"
                  placeholder="name@example.com"
                />
              </Field>
              <Field label="인스타그램 ID" required error={errors.artistInsta}>
                <InstagramInput value={artistInsta} onChange={setArtistInsta} />
              </Field>
              <Field label="참여 형태" required>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="radio"
                      checked={participation === 'individual'}
                      onChange={() => setParticipation('individual')}
                    />
                    개인
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="radio"
                      checked={participation === 'group'}
                      onChange={() => setParticipation('group')}
                    />
                    단체
                  </label>
                </div>
                {participation === 'group' && (
                  <input
                    value={groupSize}
                    onChange={(e) => setGroupSize(e.target.value)}
                    className="input mt-3"
                    placeholder="인원수를 입력해주세요"
                  />
                )}
                {errors.groupSize && <p className="mt-1 text-xs text-rose-500">{errors.groupSize}</p>}
              </Field>
            </div>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="mt-8 w-full bg-slate-900 py-3.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
            >
              {isSubmitting ? '접수 처리 중...' : '최종 매칭 접수하기'}
            </button>
            {errors.submit && <p className="mt-2 text-xs text-rose-500">{errors.submit}</p>}
          </div>
        )}

        {step === 'success' && (
          <div className="py-10 text-center">
            <p className="text-lg font-medium text-slate-900">매칭 접수가 완료됐어요!</p>
            <p className="mt-2 text-sm text-slate-500">
              남겨주신 정보를 바탕으로 진행된 AI 매칭을 확인 후,<br />순차적으로 연락드릴게요.
            </p>
            <button
              type="button"
              onClick={handleConfirmSuccess}
              className="mt-8 bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              이번 달 전시 둘러보기
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-sm text-slate-600">
        {label}
        {required && <RequiredBadge />}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  )
}
