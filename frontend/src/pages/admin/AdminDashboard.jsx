import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { TrendingUp, ShoppingBag, Table2, Users, RefreshCw, Clock } from 'lucide-react'

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
const dur = (start) => {
  const ms = Date.now() - new Date(start)
  const m = Math.floor(ms / 60000)
  return m < 60 ? `${m}m` : `${Math.floor(m/60)}h ${m%60}m`
}

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const { data: d } = await api.get('/admin/dashboard')
      setData(d)
    } finally { setLoading(false) }
  }

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t) }, [])

  if (loading) return <div className="flex items-center justify-center h-full text-surface-400">Loading…</div>

  const cards = [
    { label: "Today's Sales", value: fmt(data?.totalSalesToday), icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: "Today's Orders", value: data?.totalOrdersToday || 0, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Active Tables', value: data?.activeTables || 0, icon: Table2, color: 'text-brand-500', bg: 'bg-brand-50' },
    { label: 'This Week Revenue', value: fmt(data?.revenueThisWeek), icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900">Dashboard</h1>
          <p className="text-surface-500 text-sm mt-0.5">Real-time overview of your cafe</p>
        </div>
        <button onClick={load} className="btn-secondary text-xs">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-surface-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-surface-900 mt-1 font-display">{value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Sessions */}
      <div className="card">
        <div className="p-4 border-b border-surface-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-surface-400" />
            <h2 className="font-semibold text-surface-900 text-sm">Active Sessions</h2>
            <span className="badge-blue">{data?.activeSessionDetails?.length || 0}</span>
          </div>
        </div>

        {data?.activeSessionDetails?.length === 0 ? (
          <div className="p-8 text-center text-surface-400 text-sm">No active sessions right now</div>
        ) : (
          <div className="divide-y divide-surface-100">
            {data?.activeSessionDetails?.map(s => (
              <div key={s._id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
                    <span className="text-brand-600 font-bold text-sm">{s.table?.tableNumber}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-900">Table {s.table?.tableNumber}</p>
                    <p className="text-xs text-surface-500">{s.waiter?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-surface-400 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  {dur(s.startTime)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
