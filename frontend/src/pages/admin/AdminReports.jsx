import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { FileText, Filter, Download } from 'lucide-react'

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

export default function AdminReports() {
  const [report, setReport] = useState(null)
  const [staff, setStaff] = useState([])
  const [tables, setTables] = useState([])
  const [filters, setFilters] = useState({ startDate: '', endDate: '', waiterId: '', paymentMethod: '', tableId: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/admin/staff').then(({ data }) => setStaff(data))
    api.get('/admin/tables').then(({ data }) => setTables(data))
    loadReport()
  }, [])

  const loadReport = async () => {
    setLoading(true)
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
    const { data } = await api.get('/admin/reports', { params })
    setReport(data); setLoading(false)
  }

  const exportCSV = () => {
    if (!report?.orders) return
    const rows = [['Order #','Table','Waiter','Items','Total','Payment','Date']]
    report.orders.forEach(o => {
      rows.push([
        o.orderNumber,
        o.table?.tableNumber,
        o.waiter?.name,
        o.items.map(i => `${i.name}x${i.quantity}`).join('; '),
        o.total,
        o.session?.paymentMethod || '',
        new Date(o.createdAt).toLocaleDateString()
      ])
    })
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `report-${Date.now()}.csv`; a.click()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900">Reports</h1>
          <p className="text-surface-500 text-sm mt-0.5">Filter and export order data</p>
        </div>
        <button onClick={exportCSV} className="btn-secondary text-sm">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-surface-400" />
          <p className="text-sm font-semibold text-surface-700">Filters</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div>
            <label className="label">From Date</label>
            <input type="date" className="input" value={filters.startDate}
              onChange={e => setFilters(f => ({...f, startDate: e.target.value}))} />
          </div>
          <div>
            <label className="label">To Date</label>
            <input type="date" className="input" value={filters.endDate}
              onChange={e => setFilters(f => ({...f, endDate: e.target.value}))} />
          </div>
          <div>
            <label className="label">Waiter</label>
            <select className="input" value={filters.waiterId}
              onChange={e => setFilters(f => ({...f, waiterId: e.target.value}))}>
              <option value="">All Waiters</option>
              {staff.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Payment Method</label>
            <select className="input" value={filters.paymentMethod}
              onChange={e => setFilters(f => ({...f, paymentMethod: e.target.value}))}>
              <option value="">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
            </select>
          </div>
          <div>
            <label className="label">Table</label>
            <select className="input" value={filters.tableId}
              onChange={e => setFilters(f => ({...f, tableId: e.target.value}))}>
              <option value="">All Tables</option>
              {tables.map(t => <option key={t._id} value={t._id}>Table {t.tableNumber}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-3">
          <button onClick={loadReport} className="btn-primary text-sm">Apply Filters</button>
        </div>
      </div>

      {/* Summary */}
      {report && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Sessions', value: report.summary.totalSessions },
            { label: 'Total Orders', value: report.summary.totalOrders },
            { label: 'Total Revenue', value: fmt(report.summary.totalRevenue) },
          ].map(({ label, value }) => (
            <div key={label} className="card p-4 text-center">
              <p className="text-2xl font-bold font-display text-surface-900">{value}</p>
              <p className="text-xs text-surface-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Orders table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-surface-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-surface-400" />
          <h2 className="font-semibold text-surface-900 text-sm">Orders</h2>
          {report && <span className="badge-gray">{report.orders.length}</span>}
        </div>
        {loading ? (
          <div className="p-8 text-center text-surface-400 text-sm">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 border-b border-surface-100">
                <tr>
                  {['Order #','Table','Waiter','Items','Total','Payment','Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {report?.orders?.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-surface-400">No orders found for this period</td></tr>
                )}
                {report?.orders?.map(o => (
                  <tr key={o._id} className="hover:bg-surface-50">
                    <td className="px-4 py-3 font-mono text-xs text-surface-600">{o.orderNumber}</td>
                    <td className="px-4 py-3 font-medium">T{o.table?.tableNumber}</td>
                    <td className="px-4 py-3 text-surface-600">{o.waiter?.name}</td>
                    <td className="px-4 py-3 text-surface-500 text-xs max-w-xs">
                      {o.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}
                    </td>
                    <td className="px-4 py-3 font-mono font-medium">{fmt(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`capitalize ${o.paymentMethod === 'cash' ? 'badge-yellow' : o.paymentMethod === 'upi' ? 'badge-blue' : 'badge-gray'}`}>
                        {o.paymentMethod || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-surface-400 text-xs whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
