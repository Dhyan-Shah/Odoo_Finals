import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { BarChart3, TrendingUp, Clock, Banknote, Users } from 'lucide-react'

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
const dur = (ms) => { const m = Math.floor(ms / 60000); return m < 60 ? `${m}m` : `${Math.floor(m/60)}h ${m%60}m` }

export default function AdminAnalytics() {
  const [data, setData] = useState([])
  const [selected, setSelected] = useState(null)
  const [sessions, setSessions] = useState([])
  const [sort, setSort] = useState('totalRevenue')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/analytics/waiters').then(({ data: d }) => {
      setData(d); setLoading(false)
    })
  }, [])

  const selectWaiter = async (w) => {
    setSelected(w)
    const { data: s } = await api.get(`/admin/analytics/waiter/${w.waiter.id}/sessions`)
    setSessions(s)
  }

  const sorted = [...data].sort((a, b) => b[sort] - a[sort])

  if (loading) return <div className="flex items-center justify-center h-64 text-surface-400">Loading…</div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-surface-900">Waiter Analytics</h1>
        <p className="text-surface-500 text-sm mt-0.5">Performance comparison across all waiters</p>
      </div>

      {/* Sort tabs */}
      <div className="flex gap-2">
        {[
          { key: 'totalRevenue', label: 'By Revenue' },
          { key: 'totalSessions', label: 'By Sessions' },
          { key: 'todaySessions', label: "Today's Activity" },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setSort(key)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${sort === key ? 'bg-brand-500 text-white' : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <div className="card divide-y divide-surface-100">
          <div className="p-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-500" />
            <h2 className="font-semibold text-surface-900 text-sm">Waiter Performance</h2>
          </div>
          {sorted.length === 0 && (
            <div className="p-8 text-center text-surface-400 text-sm">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No waiter data yet
            </div>
          )}
          {sorted.map((w, i) => (
            <div key={w.waiter.id}
              onClick={() => selectWaiter(w)}
              className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-surface-50 transition-colors ${selected?.waiter.id === w.waiter.id ? 'bg-brand-50 border-l-2 border-brand-500' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-surface-300 text-surface-700' : i === 2 ? 'bg-orange-300 text-white' : 'bg-surface-100 text-surface-500'}`}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-surface-900 text-sm">{w.waiter.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-surface-400">{w.totalSessions} sessions total</span>
                  <span className="text-xs text-emerald-600 font-medium">+{w.todaySessions} today</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-surface-900 text-sm font-mono">{fmt(w.totalRevenue)}</p>
                <p className="text-xs text-surface-400">{w.cashPayments} cash</p>
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        <div className="card">
          {!selected ? (
            <div className="flex items-center justify-center h-full min-h-48 text-surface-400 text-sm p-8 text-center">
              <div>
                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Click a waiter to see their session history
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-surface-100">
                <p className="font-semibold text-surface-900">{selected.waiter.name}</p>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {[
                    { label: 'Revenue', value: fmt(selected.totalRevenue), icon: TrendingUp, color: 'text-emerald-500' },
                    { label: 'Avg Duration', value: selected.avgDurationMs ? dur(selected.avgDurationMs) : '—', icon: Clock, color: 'text-blue-500' },
                    { label: 'Cash Collected', value: selected.cashPayments, icon: Banknote, color: 'text-amber-500' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-surface-50 rounded-xl p-3 text-center">
                      <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
                      <p className="font-bold text-surface-900 text-sm">{value}</p>
                      <p className="text-xs text-surface-400">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-surface-100 overflow-y-auto max-h-80">
                {sessions.length === 0 && <p className="p-6 text-center text-surface-400 text-sm">No closed sessions yet</p>}
                {sessions.map(s => (
                  <div key={s._id} className="flex items-center justify-between p-3 text-sm">
                    <div>
                      <p className="font-medium text-surface-900">Table {s.table?.tableNumber}</p>
                      <p className="text-xs text-surface-400">{new Date(s.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-medium text-surface-900">{fmt(s.totalAmount)}</p>
                      <span className={`text-xs capitalize ${s.paymentMethod === 'cash' ? 'text-amber-600' : s.paymentMethod === 'upi' ? 'text-blue-600' : 'text-surface-500'}`}>
                        {s.paymentMethod || '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
