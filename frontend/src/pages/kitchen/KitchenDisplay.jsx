import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { connectSocket, disconnectSocket } from '../../api/socket'
import { useAuthStore } from '../../store/authStore'
import { ChefHat, Clock, CheckCheck, LogOut, ToggleLeft, ToggleRight, ChevronDown, ChevronUp } from 'lucide-react'

const elapsed = (s) => {
  const m = Math.floor((Date.now() - new Date(s)) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m/60)}h ${m%60}m ago`
}

const urgencyClass = (createdAt) => {
  const m = Math.floor((Date.now() - new Date(createdAt)) / 60000)
  if (m >= 15) return 'border-red-500/60'
  if (m >= 8) return 'border-amber-500/40'
  return 'border-surface-700'
}

export default function KitchenDisplay() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [showPanel, setShowPanel] = useState(false)
  const [tick, setTick] = useState(0)

  const loadOrders = async () => {
    const { data } = await api.get('/kitchen/orders')
    setOrders(data)
  }
  const loadProducts = async () => {
    const { data } = await api.get('/kitchen/products')
    setProducts(data)
  }

  useEffect(() => {
    loadOrders(); loadProducts()
    const socket = connectSocket()
    socket.emit('join:kitchen')

    socket.on('customer:order_placed', () => loadOrders())
    socket.on('product:availability_changed', () => loadProducts())
    // Remove served orders from kitchen display
    socket.on('kitchen:order_removed', ({ orderId }) => {
      setOrders(prev => prev.filter(o => o._id !== orderId))
    })

    const refreshInterval = setInterval(loadOrders, 20000)
    const tickInterval = setInterval(() => setTick(t => t + 1), 30000) // re-render for time updates

    return () => {
      socket.off('customer:order_placed')
      socket.off('product:availability_changed')
      socket.off('kitchen:order_removed')
      clearInterval(refreshInterval)
      clearInterval(tickInterval)
      disconnectSocket()
    }
  }, [])

  const advance = async (order) => {
    const next = order.status === 'confirmed' ? 'in_progress' : 'ready'
    await api.patch(`/kitchen/orders/${order._id}/status`, { status: next })
    setOrders(prev => prev.map(o => o._id === order._id ? { ...o, status: next } : o))
  }

  const toggleItemPrepared = async (orderId, idx) => {
    await api.patch(`/kitchen/orders/${orderId}/items/${idx}/prepared`)
    setOrders(prev => prev.map(o => {
      if (o._id !== orderId) return o
      const items = [...o.items]
      items[idx] = { ...items[idx], prepared: !items[idx].prepared }
      return { ...o, items }
    }))
  }

  const toggleProduct = async (p) => {
    await api.patch(`/kitchen/products/${p._id}/availability`, { available: !p.available })
    setProducts(prev => prev.map(pr => pr._id === p._id ? { ...pr, available: !pr.available } : pr))
  }

  const handleLogout = () => { logout(); navigate('/staff/login') }

  const confirmed = orders.filter(o => o.status === 'confirmed')
  const inProgress = orders.filter(o => o.status === 'in_progress')
  const ready = orders.filter(o => o.status === 'ready')

  const columns = [
    { label: 'New Orders',       orders: confirmed,  btnLabel: 'Start Preparing', btnClass: 'bg-blue-500 hover:bg-blue-600',    headerBg: 'bg-blue-950/40',    headerText: 'text-blue-300',    countBg: 'bg-blue-500' },
    { label: 'In Progress',      orders: inProgress, btnLabel: 'Mark Ready',      btnClass: 'bg-emerald-500 hover:bg-emerald-600', headerBg: 'bg-amber-950/30', headerText: 'text-amber-300',   countBg: 'bg-amber-500' },
    { label: 'Ready for Pickup', orders: ready,      btnLabel: null,              btnClass: '',                                  headerBg: 'bg-emerald-950/30', headerText: 'text-emerald-300', countBg: 'bg-emerald-500' },
  ]

  return (
    <div className="min-h-screen bg-surface-900 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-surface-900 border-b border-surface-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center">
            <ChefHat className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-display font-bold text-sm">Kitchen Display</p>
            <p className="text-surface-400 text-xs">{user?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-blue-400 font-medium">{confirmed.length} new</span>
            <span className="text-amber-400 font-medium">{inProgress.length} cooking</span>
            <span className="text-emerald-400 font-medium">{ready.length} ready</span>
          </div>
          <button onClick={() => setShowPanel(s => !s)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-800 text-surface-300 hover:text-white text-xs transition-colors">
            Item Availability {showPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button onClick={handleLogout} className="text-surface-500 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Item Availability Panel */}
      {showPanel && (
        <div className="bg-surface-900 border-b border-surface-800 px-6 py-4">
          <p className="text-surface-400 text-xs font-medium mb-3 uppercase tracking-wide">Toggle Item Availability</p>
          <div className="flex flex-wrap gap-2">
            {products.map(p => (
              <button key={p._id} onClick={() => toggleProduct(p)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm border transition-all ${
                  p.available
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                }`}>
                {p.available ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                {p.name}
                {!p.available && <span className="text-xs opacity-70">(unavailable)</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ticket board */}
      <div className="flex-1 grid grid-cols-3 gap-0 divide-x divide-surface-800 overflow-hidden">
        {columns.map(({ label, orders: colOrders, btnLabel, btnClass, headerBg, headerText, countBg }) => (
          <div key={label} className="flex flex-col overflow-hidden">
            <div className={`px-4 py-3 border-b border-surface-800 flex items-center justify-between flex-shrink-0 ${headerBg}`}>
              <span className={`font-semibold text-sm ${headerText}`}>{label}</span>
              <span className={`w-6 h-6 rounded-full ${countBg} flex items-center justify-center text-xs font-bold text-white`}>
                {colOrders.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {colOrders.length === 0 && (
                <div className="text-center py-12 text-surface-700 text-sm">
                  <CheckCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  All clear
                </div>
              )}
              {colOrders.map(order => (
                <div key={order._id} className={`bg-surface-900 border-2 rounded-2xl overflow-hidden transition-colors ${urgencyClass(order.createdAt)}`}>
                  <div className="flex items-center justify-between px-4 py-3 bg-surface-800 border-b border-surface-700">
                    <span className="text-white font-bold text-xl font-display">Table {order.table?.tableNumber}</span>
                    <div className="flex items-center gap-1.5 text-surface-400 text-xs">
                      <Clock className="w-3 h-3" />
                      {elapsed(order.createdAt)}
                    </div>
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    {order.items.map((item, idx) => (
                      <button key={idx} onClick={() => toggleItemPrepared(order._id, idx)}
                        className={`w-full flex items-center justify-between text-left rounded-xl px-3 py-2 transition-all ${
                          item.prepared ? 'bg-surface-800/40 opacity-40' : 'bg-surface-800 hover:bg-surface-700'
                        }`}>
                        <span className={`text-sm ${item.prepared ? 'line-through text-surface-500' : 'text-white'}`}>
                          {item.name}
                        </span>
                        <span className={`font-bold text-lg font-display ${item.prepared ? 'text-surface-600' : 'text-brand-400'}`}>
                          ×{item.quantity}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="px-4 pb-4">
                    {btnLabel ? (
                      <button onClick={() => advance(order)}
                        className={`w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-colors ${btnClass}`}>
                        {btnLabel}
                      </button>
                    ) : (
                      <div className="w-full py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center font-medium">
                        ✓ Awaiting pickup by waiter
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
