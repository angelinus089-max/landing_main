import { useState } from 'react'
import { Link } from 'react-router-dom'
import LeadsTable from '../components/admin/LeadsTable'
import InquiriesTable from '../components/admin/InquiriesTable'
import ContentManager from '../components/admin/ContentManager'
import SettingsPanel from '../components/admin/SettingsPanel'
import AdminLogin from '../components/admin/AdminLogin'
import { useAdminSession } from '../utils/useAdminSession'
import { supabase } from '../lib/supabase'

type Menu = 'leads' | 'inquiries' | 'content' | 'settings'

const MENUS: { key: Menu; label: string }[] = [
  { key: 'leads', label: '1. 신규등록' },
  { key: 'inquiries', label: '2. 문의내역' },
  { key: 'content', label: '3. 콘텐츠' },
  { key: 'settings', label: '4. 설정' },
]

export default function AdminPage() {
  const [menu, setMenu] = useState<Menu>('leads')
  const { loading, isLoggedIn } = useAdminSession()

  if (loading) return null
  if (!isLoggedIn) return <AdminLogin />

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-sm font-semibold tracking-widest text-slate-900">⚙️ Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <Link to="/main" className="border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-slate-900">
            🏠 홈으로
          </Link>
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-slate-900"
          >
            로그아웃
          </button>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl gap-8 px-6 py-10">
        <aside className="w-48 shrink-0">
          <nav className="flex flex-col gap-1">
            {MENUS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setMenu(item.key)}
                className={`px-4 py-2.5 text-left text-sm transition ${menu === item.key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>
        <main className="flex-1 border border-slate-200 bg-white p-8">
          {menu === 'leads' && <LeadsTable />}
          {menu === 'inquiries' && <InquiriesTable />}
          {menu === 'content' && <ContentManager />}
          {menu === 'settings' && <SettingsPanel />}
        </main>
      </div>
    </div>
  )
}
