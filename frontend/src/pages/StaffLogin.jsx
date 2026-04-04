import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Coffee, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function StaffLogin() {
  const navigate = useNavigate()
  const { login, loading } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const user = await login(form.email, form.password)
      if (user.role === 'admin') navigate('/admin/dashboard')
      else if (user.role === 'waiter') navigate('/waiter/floor')
      else if (user.role === 'kitchen') navigate('/kitchen/display')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-brand-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500 shadow-lg shadow-brand-500/30 mb-4">
            <Coffee className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Odoo POS Cafe</h1>
          <p className="text-surface-400 mt-1 text-sm">Staff Portal</p>
        </div>

        {/* Card */}
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@cafe.com"
                className="w-full px-3 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white text-sm placeholder:text-surface-500
                           focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 pr-10 rounded-xl bg-surface-800 border border-surface-700 text-white text-sm placeholder:text-surface-500
                             focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
                />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm
                         transition-all duration-150 shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-surface-500 text-xs mt-4">
            Default: admin@cafe.com / admin123
          </p>
        </div>
      </div>
    </div>
  )
}
