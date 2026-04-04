import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { TrendingUp, ShoppingBag, Table2, Users, RefreshCw, Clock, Coffee, ArrowUpRight } from 'lucide-react'

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
const dur = (start) => {
  const ms = Date.now() - new Date(start)
  const m = Math.floor(ms / 60000)
  return m < 60 ? `${m}m` : `${Math.floor(m/60)}h ${m%60}m`
}

function StatCard({ label, value, icon: Icon, gradient, sub }) {
  return (
    <div className="card card-hover p-5 relative overflow-hidden shine">
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 -translate-y-8 translate-x-8"
        style={{ background: gradient }} />
      <div className="flex items-start justify-between relative">
        <div>
          <p className="text-xs font-semibold text-surface-400 uppercase tracking-wide mb-2">{label}</p>
          <p className="font-display text-2xl font-bold text-surface-900">{value}</p>
          {sub && <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" />{sub}</p>}
        </div>
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md"
          style={{ background: gradient }}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  )
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

  if (loading) return (
    <div className="flex items-center justify-center h-full text-surface-400">
      <div className="text-center">
        <Coffee className="w-10 h-10 mx-auto mb-3 opacity-30 animate-bounce" />
        <p className="text-sm font-semibold">Loading dashboard…</p>
      </div>
    </div>
  )

  const cards = [
    { label: "Today's Sales", value: fmt(data?.totalSalesToday), icon: TrendingUp, gradient: 'linear-gradient(135deg,#c0392b,#8B1A1A)', sub: 'Great performance!' },
    { label: "Today's Orders", value: data?.totalOrdersToday || 0, icon: ShoppingBag, gradient: 'linear-gradient(135deg,#2980b9,#1a5276)' },
    { label: 'Active Tables', value: data?.activeTables || 0, icon: Table2, gradient: 'linear-gradient(135deg,#d4a96a,#b88c68)' },
    { label: 'This Week Revenue', value: fmt(data?.revenueThisWeek), icon: TrendingUp, gradient: 'linear-gradient(135deg,#27ae60,#1e8449)' },
  ]

  return (
    <div className="p-7 space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-900 italic">Dashboard</h1>
          <p className="text-surface-400 text-sm mt-0.5 font-body">Real-time overview of your cafe</p>
        </div>
        <button onClick={load} className="btn-secondary text-xs gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => <StatCard key={card.label} {...card} />)}
      </div>

      {/* Active Sessions */}
      <div className="card">
        <div className="p-5 border-b border-surface-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-brand-600" />
            </div>
            <h2 className="font-display font-bold text-surface-900">Active Sessions</h2>
            {data?.activeSessionDetails?.length > 0 && (
              <span className="badge-red">{data.activeSessionDetails.length}</span>
            )}
          </div>
        </div>

        {data?.activeSessionDetails?.length === 0 ? (
          <div className="p-12 text-center">
            <Coffee className="w-10 h-10 mx-auto mb-3 text-surface-300" />
            <p className="text-surface-400 text-sm font-semibold">No active sessions right now</p>
            <p className="text-surface-300 text-xs mt-1">Tables are waiting for guests</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-100">
            {data?.activeSessionDetails?.map(s => (
              <div key={s._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-beige-50 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-white text-sm shadow-md"
                    style={{ background: 'linear-gradient(135deg,#c0392b,#8B1A1A)' }}>
                    {s.table?.tableNumber}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-surface-900">Table {s.table?.tableNumber}</p>
                    <p className="text-xs text-surface-400">{s.waiter?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-surface-400 text-xs font-semibold bg-beige-100 px-3 py-1 rounded-full">
                  <Clock className="w-3 h-3" />
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
