import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { connectSocket } from '../../api/socket'
import { useAuthStore } from '../../store/authStore'
import Modal from '../../components/common/Modal'
import { RefreshCw } from 'lucide-react'

const STATUS = {
  free:     { label: 'Free',      bg: 'bg-emerald-50',  border: 'border-emerald-300', text: 'text-emerald-700',  dot: 'bg-emerald-400' },
  occupied: { label: 'Occupied',  bg: 'bg-red-50',      border: 'border-red-300',     text: 'text-red-700',     dot: 'bg-red-400' },
  payment:  { label: 'Payment',   bg: 'bg-amber-50',    border: 'border-amber-300',   text: 'text-amber-700',   dot: 'bg-amber-400' },
  other:    { label: 'Occupied',  bg: 'bg-surface-100', border: 'border-surface-200', text: 'text-surface-500', dot: 'bg-surface-400' },
}

export default function WaiterFloor() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [floors, setFloors] = useState([])
  const [tables, setTables] = useState([])
  const [activeFloor, setActiveFloor] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [starting, setStarting] = useState(false)

  const load = async () => {
    const [f, t] = await Promise.all([api.get('/waiter/floors'), api.get('/waiter/tables')])
    setFloors(f.data)
    setTables(t.data)
    if (!activeFloor && f.data.length > 0) setActiveFloor(f.data[0]._id)
  }

  useEffect(() => {
    load()
    const socket = connectSocket()
    socket.on('table:status_changed', () => load())
    return () => socket.off('table:status_changed')
  }, [])

  const floorTables = tables.filter(t => t.floor?._id === activeFloor)

  const getTableStyle = (table) => {
    if (table.status === 'free') return STATUS.free
    if (table.currentWaiter?._id === user._id) return STATUS.occupied
    if (table.status === 'payment' && table.currentWaiter?._id === user._id) return STATUS.payment
    return STATUS.other
  }

  const canInteract = (table) => {
    return table.status === 'free' || table.currentWaiter?._id === user._id
  }

  const handleTableClick = (table) => {
    if (!canInteract(table)) return
    if (table.status === 'free') { setConfirm(table); return }
    // Navigate to session
    navigate(`/waiter/session/${table.currentSession}`)
  }

  const startSession = async () => {
    if (!confirm) return
    setStarting(true)
    try {
      await api.post('/waiter/sessions/start', { tableId: confirm._id })
      await load()
      // Find the updated table to get session id
      const { data: freshTables } = await api.get('/waiter/tables')
      const updated = freshTables.find(t => t._id === confirm._id)
      setConfirm(null)
      if (updated?.currentSession) navigate(`/waiter/session/${updated.currentSession}`)
    } finally { setStarting(false) }
  }

  return (
    <div className="p-4 space-y-4">
      {/* Floor tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {floors.map(f => (
          <button key={f._id} onClick={() => setActiveFloor(f._id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeFloor === f._id ? 'bg-brand-500 text-white shadow-sm' : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'
            }`}>
            {f.name}
          </button>
        ))}
        <button onClick={load} className="ml-auto text-surface-400 hover:text-surface-600 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        {[
          { ...STATUS.free, label: 'Free' },
          { ...STATUS.occupied, label: 'My Table' },
          { ...STATUS.other, label: 'Another Waiter' },
          { ...STATUS.payment, label: 'Payment' },
        ].map(({ label, dot }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${dot}`} />
            <span className="text-surface-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Tables grid */}
      {floorTables.length === 0 ? (
        <div className="text-center py-16 text-surface-400 text-sm">No tables on this floor</div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {floorTables.map(table => {
            const style = getTableStyle(table)
            const interactive = canInteract(table)
            return (
              <button key={table._id}
                onClick={() => handleTableClick(table)}
                disabled={!interactive}
                className={`relative p-4 rounded-2xl border-2 text-center transition-all duration-200
                  ${style.bg} ${style.border} ${style.text}
                  ${interactive ? 'hover:shadow-md hover:scale-105 cursor-pointer' : 'cursor-not-allowed opacity-60'}
                `}>
                <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${style.dot}`} />
                <p className="font-display font-bold text-xl leading-none">{table.tableNumber}</p>
                <p className="text-xs mt-1 opacity-70">{table.capacity} seats</p>
                <p className="text-xs mt-1 font-medium">{style.label}</p>
                {table.currentWaiter && table.currentWaiter._id !== user._id && (
                  <p className="text-xs mt-0.5 opacity-60 truncate">{table.currentWaiter.name}</p>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Start Session Confirm */}
      <Modal open={!!confirm} onClose={() => setConfirm(null)} title="Start Session" size="sm">
        {confirm && (
          <div className="space-y-4">
            <p className="text-surface-600 text-sm">
              Start a new session for <strong>Table {confirm.tableNumber}</strong>?
              This will lock the table to you.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirm(null)} className="btn-secondary">Cancel</button>
              <button onClick={startSession} disabled={starting} className="btn-primary">
                {starting ? 'Starting…' : 'Start Session'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
