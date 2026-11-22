import { Link } from 'react-router-dom'
import { useModalState } from '../state/ModalState'
import logo from '../assets/logo.png'

export default function GNB() {
  const { openMatching, openInquiry } = useModalState()

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link to="/main" className="flex items-center">
          <img src={logo} alt="FLOOR FRAME" className="h-7 sm:h-8 w-auto object-contain" />
        </Link>
        <nav className="flex items-center gap-8 text-sm text-slate-600">
          <Link to="/archive/exhibition" className="hover:text-slate-900">전시</Link>
          <Link to="/archive/space" className="hover:text-slate-900">공간</Link>
          <Link to="/archive/artist" className="hover:text-slate-900">작가</Link>
          <button
            type="button"
            onClick={() => openMatching()}
            className="bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700"
          >
            매칭하기
          </button>
          <button type="button" onClick={openInquiry} className="hover:text-slate-900">
            문의하기
          </button>
        </nav>
      </div>
    </header>
  )
}
