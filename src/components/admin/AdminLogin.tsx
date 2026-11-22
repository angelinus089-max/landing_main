import { useState } from 'react'
import { supabase } from '../../lib/supabase'

const ADMIN_EMAIL_DOMAIN = '@admin.local'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!username.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 입력해주세요.')
      return
    }
    setLoading(true)
    setError('')
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: `${username.trim()}${ADMIN_EMAIL_DOMAIN}`,
      password,
    })
    setLoading(false)
    if (signInError) {
      setError('아이디 또는 비밀번호가 올바르지 않아요.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 font-sans">
      <div className="w-full max-w-sm border border-slate-200 bg-white p-8">
        <h1 className="text-center text-sm font-semibold tracking-widest text-slate-900">⚙️ Admin Login</h1>
        <div className="mt-8 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm text-slate-600">아이디</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="input"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-600">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="input"
            />
          </div>
          {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={handleSubmit}
          className="mt-8 w-full bg-slate-900 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </div>
    </div>
  )
}
