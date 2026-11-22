import { Link } from 'react-router-dom'
import { useModalState } from '../state/ModalState'

export default function MainPage() {
  const { openMatching } = useModalState()

  return (
    <section className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center px-6 py-24 text-center">
      <p className="mb-4 text-xs font-semibold tracking-[0.3em] text-sage-dark">FLOOR FRAME</p>
      <h1 className="max-w-2xl text-3xl font-medium leading-relaxed text-slate-900 sm:text-4xl">
        어떤 공간을 예술로 채우고 싶나요?
      </h1>
      <div className="mt-12 flex flex-col gap-4 sm:flex-row">
        <button
          type="button"
          onClick={() => openMatching('space')}
          className="border border-slate-200 px-8 py-3.5 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
        >
          내 공간에 작품 걸기
        </button>
        <button
          type="button"
          onClick={() => openMatching('artist')}
          className="bg-slate-900 px-8 py-3.5 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          내 작품 전시하기
        </button>
      </div>
      <Link to="/archive" className="mt-16 text-sm text-slate-400 transition hover:text-sage-dark">
        👉 이미 매칭을 하셨나요? <span className="underline">FLOOR FRAME 둘러보기</span>
      </Link>
    </section>
  )
}
