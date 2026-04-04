import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Coffee, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react'

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
    <div className="min-h-screen flex" style={{ fontFamily: 'Nunito, sans-serif' }}>
      {/* Left — decorative panel */}
      <div className="hidden lg:flex flex-1 velvet-bg items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
        <div className="relative text-center px-12">
          <div className="w-24 h-24 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
            <Coffee className="w-12 h-12 text-white" />
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-4 italic">Velvet Brew</h1>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs mx-auto">
            Premium cafe management system — beautifully crafted for your team.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4 text-left">
            {['Orders in real-time', 'Kitchen display', 'Analytics & reports', 'Multi-role access'].map(f => (
              <div key={f} className="flex items-center gap-2 text-white/70 text-sm">
                <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 text-white text-xs">✓</div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-beige-50 relative">
        <button onClick={() => navigate('/landing')} className="absolute top-6 left-6 text-surface-500 hover:text-surface-800 flex items-center gap-1.5 text-sm font-semibold transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="w-full max-w-sm animate-fade-in">
          <div className="mb-10 text-center lg:text-left">
            <div className="lg:hidden inline-flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
                <Coffee className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-surface-900 italic">Velvet Brew</span>
            </div>
            <h2 className="font-display text-3xl font-bold text-surface-900 mb-1">Welcome back</h2>
            <p className="text-surface-500 text-sm">Sign in to your staff account</p>
          </div>

          <div className="card p-8 shadow-card-hover">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@cafe.com"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={show ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    className="input pr-11"
                  />
                  <button type="button" onClick={() => setShow(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-700 transition-colors">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="btn-primary w-full justify-center py-3 mt-2 rounded-xl shadow-velvet text-base">
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-surface-200">
              <p className="text-xs text-surface-400 text-center font-medium mb-2">Demo credentials</p>
              <div className="bg-beige-100 rounded-xl p-3 space-y-1">
                {[['Admin', 'admin@cafe.com', 'admin123'], ['Waiter', 'waiter@cafe.com', 'waiter123'], ['Kitchen', 'kitchen@cafe.com', 'kitchen123']].map(([role, email, pass]) => (
                  <button key={role} type="button"
                    onClick={() => setForm({ email, password: pass })}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/60 transition-colors">
                    <span className="text-xs font-bold text-brand-600">{role}</span>
                    <span className="text-xs text-surface-400 ml-2">{email}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
