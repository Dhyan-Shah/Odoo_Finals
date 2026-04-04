import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { connectSocket } from '../../api/socket'
import { useAuthStore } from '../../store/authStore'
import Modal from '../../components/common/Modal'
import { RefreshCw, Coffee } from 'lucide-react'

const STATUS = {
  free:     { label: 'Free',     bg: 'bg-emerald-50',  border: 'border-emerald-300', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  occupied: { label: 'Occupied', bg: 'bg-red-50',      border: 'border-red-300',     text: 'text-red-700',    dot: 'bg-red-400' },
  payment:  { label: 'Payment',  bg: 'bg-amber-50',    border: 'border-amber-300',   text: 'text-amber-700',  dot: 'bg-amber-400' },
  other:    { label: 'Occupied', bg: 'bg-surface-100', border: 'border-surface-300', text: 'text-surface-500',dot: 'bg-surface-400' },
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
    setFloors(f.data); setTables(t.data)
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
    if (table.status === 'payment' && table.currentWaiter?._id === user._id) return STATUS.payment
    if (table.currentWaiter?._id === user._id) return STATUS.occupied
    return STATUS.other
  }

  const canInteract = (table) => table.status === 'free' || table.currentWaiter?._id === user._id

  const handleTableClick = (table) => {
    if (!canInteract(table)) return
    if (table.status === 'free') { setConfirm(table); return }
    navigate(`/waiter/session/${table.currentSession}`)
  }

  const startSession = async () => {
    if (!confirm) return
    setStarting(true)
    try {
      await api.post('/waiter/sessions/start', { tableId: confirm._id })
      await load()
      const { data: freshTables } = await api.get('/waiter/tables')
      const updated = freshTables.find(t => t._id === confirm._id)
      setConfirm(null)
      if (updated?.currentSession) navigate(`/waiter/session/${updated.currentSession}`)
    } finally { setStarting(false) }
  }

  return (
    <div className="p-5 space-y-5">
      {/* Floor tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold text-surface-400 uppercase tracking-wide mr-1">Floor:</span>
        {floors.map(f => (
          <button key={f._id} onClick={() => setActiveFloor(f._id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeFloor === f._id
                ? 'text-white shadow-md'
                : 'bg-white border border-surface-200 text-surface-600 hover:bg-beige-50'
            }`}
            style={activeFloor === f._id ? { background: 'linear-gradient(135deg,#c0392b,#8B1A1A)' } : {}}>
            {f.name}
          </button>
        ))}
        <button onClick={load} className="btn-secondary ml-auto text-xs">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {floorTables.map(table => {
          const style = getTableStyle(table)
          const interact = canInteract(table)
          return (
            <button key={table._id}
              onClick={() => handleTableClick(table)}
              disabled={!interact}
              className={`relative rounded-2xl border-2 p-5 text-left transition-all duration-200 ${style.bg} ${style.border} ${
                interact ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : 'opacity-50 cursor-not-allowed'
              }`}>
              <div className={`w-3 h-3 rounded-full ${style.dot} absolute top-3 right-3`} />
              <div className="font-display font-bold text-2xl text-surface-900 mb-1">{table.tableNumber}</div>
              <div className={`text-xs font-bold ${style.text}`}>{style.label}</div>
              {table.currentWaiter && (
                <div className="text-xs text-surface-400 mt-1 truncate">{table.currentWaiter.name}</div>
              )}
            </button>
          )
        })}
        {floorTables.length === 0 && (
          <div className="col-span-full py-16 text-center text-surface-400">
            <Coffee className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-semibold">No tables on this floor</p>
          </div>
        )}
      </div>

      {/* Confirm modal — open prop added */}
      <Modal
        open={!!confirm}
        title={confirm ? `Start Session — Table ${confirm.tableNumber}` : ''}
        onClose={() => setConfirm(null)}
      >
        <p className="text-surface-600 mb-6">
          Start a new session at Table <strong>{confirm?.tableNumber}</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setConfirm(null)} className="btn-secondary">Cancel</button>
          <button onClick={startSession} disabled={starting} className="btn-primary">
            {starting ? 'Starting…' : 'Start Session'}
          </button>
        </div>
      </Modal>
    </div>
  )
}