import { useEffect, useState } from 'react'
import api from '../../api/axios'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { BarChart3, TrendingUp, Clock, Banknote, Users, Trophy, Coffee } from 'lucide-react'

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
const dur = (ms) => { if (!ms) return '—'; const m = Math.floor(ms / 60000); return m < 60 ? `${m}m` : `${Math.floor(m/60)}h ${m%60}m` }

const VELVET_COLORS = ['#c0392b','#d4a96a','#8B1A1A','#e8b4b8','#f5e8d0','#b88c68','#922b21','#edd8b2']
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-surface-200 rounded-xl p-3 shadow-lg text-xs">
      {label && <p className="font-bold text-surface-700 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === 'number' && p.value > 1000 ? fmt(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

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

  // Derived chart data
  const barData = sorted.map(w => ({
    name: w.waiter.name.split(' ')[0],
    Revenue: Math.round(w.totalRevenue),
    Sessions: w.totalSessions,
    Today: w.todaySessions,
  }))

  const pieData = sorted.map(w => ({ name: w.waiter.name.split(' ')[0], value: Math.round(w.totalRevenue) }))

  const radarData = sorted.slice(0, 5).map(w => ({
    subject: w.waiter.name.split(' ')[0],
    Revenue: Math.round((w.totalRevenue / (Math.max(...data.map(d => d.totalRevenue)) || 1)) * 100),
    Sessions: Math.round((w.totalSessions / (Math.max(...data.map(d => d.totalSessions)) || 1)) * 100),
    Today: Math.round((w.todaySessions / (Math.max(...data.map(d => d.todaySessions)) || 1)) * 100),
  }))

  // Build session timeline from selected waiter's sessions
  const sessionTimelineData = sessions.slice(0, 14).reverse().map((s, i) => ({
    idx: `S${i + 1}`,
    Amount: Math.round(s.totalAmount || 0),
    method: s.paymentMethod,
  }))

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-surface-400">
      <div className="text-center">
        <Coffee className="w-10 h-10 mx-auto mb-3 opacity-30 animate-bounce" />
        <p className="text-sm font-semibold">Loading analytics…</p>
      </div>
    </div>
  )

  return (
    <div className="p-7 space-y-7">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-surface-900 italic">Waiter Analytics</h1>
        <p className="text-surface-400 text-sm mt-0.5">Performance comparison & revenue analysis across all waiters</p>
      </div>

      {/* Sort tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'totalRevenue', label: '💰 By Revenue' },
          { key: 'totalSessions', label: '📋 By Sessions' },
          { key: 'todaySessions', label: "⚡ Today's Activity" },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setSort(key)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              sort === key
                ? 'text-white shadow-md'
                : 'bg-white border border-surface-200 text-surface-600 hover:bg-beige-50'
            }`}
            style={sort === key ? { background: 'linear-gradient(135deg,#c0392b,#8B1A1A)' } : {}}>
            {label}
          </button>
        ))}
      </div>

      {/* ── CHARTS ROW 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Bar Chart */}
        <div className="card p-5">
          <h2 className="font-display font-bold text-surface-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-500" /> Revenue by Waiter
          </h2>
          {barData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-surface-300 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ddd0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#8a6448', fontFamily: 'Nunito' }} />
                <YAxis tick={{ fontSize: 11, fill: '#8a6448', fontFamily: 'Nunito' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Revenue" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c0392b" />
                    <stop offset="100%" stopColor="#8B1A1A" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Revenue Pie Chart */}
        <div className="card p-5">
          <h2 className="font-display font-bold text-surface-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-500" /> Revenue Share
          </h2>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-surface-300 text-sm">No data yet</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                    paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={VELVET_COLORS[i % VELVET_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {pieData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: VELVET_COLORS[i % VELVET_COLORS.length] }} />
                    <span className="text-surface-600 font-semibold truncate flex-1">{item.name}</span>
                    <span className="text-surface-400 font-mono">{fmt(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── CHARTS ROW 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessions Comparison */}
        <div className="card p-5">
          <h2 className="font-display font-bold text-surface-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-500" /> Session Comparison
          </h2>
          {barData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-surface-300 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ddd0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#8a6448', fontFamily: 'Nunito' }} />
                <YAxis tick={{ fontSize: 11, fill: '#8a6448', fontFamily: 'Nunito' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Nunito' }} />
                <Bar dataKey="Sessions" fill="#d4a96a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Today" fill="#c0392b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Radar performance */}
        <div className="card p-5">
          <h2 className="font-display font-bold text-surface-900 mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-brand-500" /> Performance Radar
          </h2>
          {radarData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-surface-300 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e4c4b0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#8a6448', fontFamily: 'Nunito' }} />
                <Radar name="Revenue %" dataKey="Revenue" stroke="#c0392b" fill="#c0392b" fillOpacity={0.25} />
                <Radar name="Sessions %" dataKey="Sessions" stroke="#d4a96a" fill="#d4a96a" fillOpacity={0.2} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Nunito' }} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── LEADERBOARD + DETAIL ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <div className="card">
          <div className="p-5 border-b border-surface-100 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-brand-500" />
            <h2 className="font-display font-bold text-surface-900">Leaderboard</h2>
          </div>
          {sorted.length === 0 && (
            <div className="p-10 text-center text-surface-400 text-sm">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />No waiter data yet
            </div>
          )}
          {sorted.map((w, i) => (
            <div key={w.waiter.id}
              onClick={() => selectWaiter(w)}
              className={`flex items-center gap-4 p-4 cursor-pointer transition-colors border-b border-surface-50 last:border-0 ${
                selected?.waiter.id === w.waiter.id ? 'bg-beige-100 border-l-4 border-brand-500' : 'hover:bg-beige-50'
              }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                i === 0 ? 'text-white shadow-md' : i === 1 ? 'bg-surface-200 text-surface-600' : i === 2 ? 'bg-amber-100 text-amber-700' : 'bg-surface-100 text-surface-400'
              }`}
              style={i === 0 ? { background: 'linear-gradient(135deg,#d4a96a,#b88c68)' } : {}}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-surface-900 text-sm">{w.waiter.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-surface-400">{w.totalSessions} sessions</span>
                  <span className="text-xs text-emerald-600 font-bold">+{w.todaySessions} today</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-display font-bold text-surface-900 text-sm">{fmt(w.totalRevenue)}</p>
                <p className="text-xs text-surface-400">{w.cashPayments} cash</p>
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        <div className="card">
          {!selected ? (
            <div className="flex items-center justify-center h-full min-h-64 p-8 text-center">
              <div>
                <BarChart3 className="w-10 h-10 mx-auto mb-3 text-surface-300" />
                <p className="text-surface-400 text-sm font-semibold">Select a waiter</p>
                <p className="text-surface-300 text-xs mt-1">Click any row to view session history & charts</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-5 border-b border-surface-100">
                <p className="font-display font-bold text-surface-900 text-lg italic">{selected.waiter.name}</p>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { label: 'Revenue', value: fmt(selected.totalRevenue), icon: TrendingUp, color: '#c0392b' },
                    { label: 'Avg Duration', value: dur(selected.avgDurationMs), icon: Clock, color: '#2980b9' },
                    { label: 'Cash', value: selected.cashPayments, icon: Banknote, color: '#d4a96a' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-beige-50 rounded-xl p-3 text-center border border-beige-200">
                      <Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color }} />
                      <p className="font-display font-bold text-surface-900 text-base">{value}</p>
                      <p className="text-xs text-surface-400 font-semibold">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Session amount line chart */}
              {sessionTimelineData.length > 1 && (
                <div className="px-5 pt-4 pb-2">
                  <p className="text-xs font-bold text-surface-500 uppercase tracking-wide mb-2">Session Revenue Timeline</p>
                  <ResponsiveContainer width="100%" height={130}>
                    <LineChart data={sessionTimelineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0ddd0" />
                      <XAxis dataKey="idx" tick={{ fontSize: 10, fill: '#8a6448' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#8a6448' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="Amount" stroke="#c0392b" strokeWidth={2.5} dot={{ fill: '#c0392b', r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="divide-y divide-surface-50 overflow-y-auto max-h-52">
                {sessions.length === 0 && <p className="p-6 text-center text-surface-400 text-sm">No closed sessions yet</p>}
                {sessions.map(s => (
                  <div key={s._id} className="flex items-center justify-between px-5 py-3 hover:bg-beige-50 transition-colors">
                    <div>
                      <p className="font-bold text-surface-900 text-sm">Table {s.table?.tableNumber}</p>
                      <p className="text-xs text-surface-400">{new Date(s.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-surface-900 text-sm">{fmt(s.totalAmount)}</p>
                      <span className={`text-xs capitalize font-semibold ${
                        s.paymentMethod === 'cash' ? 'text-amber-600' :
                        s.paymentMethod === 'upi' ? 'text-blue-600' : 'text-surface-400'
                      }`}>{s.paymentMethod || '—'}</span>
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
