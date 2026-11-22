import { Link } from 'react-router-dom'
import { useAppState } from '../state/AppState'

export default function Footer() {
  const { siteInstagram } = useAppState()

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="flex w-full items-center justify-between px-6 py-10 text-sm text-slate-400">
        <div className="flex items-center gap-4">
          <p className="text-left">ⓒ 2026 FLOOR FRAME. All rights reserved.</p>
          {siteInstagram && (
            <a
              href={`https://instagram.com/${siteInstagram}`}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-slate-900"
            >
              @{siteInstagram}
            </a>
          )}
        </div>
        <Link to="/admin" className="text-slate-300 transition hover:text-slate-900">
          Admin
        </Link>
      </div>
    </footer>
  )
}
