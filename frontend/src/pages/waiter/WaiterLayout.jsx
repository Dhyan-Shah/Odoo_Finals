import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useNotifStore } from '../../store/notifStore'
import { connectSocket, disconnectSocket } from '../../api/socket'
import ToastContainer from '../../components/common/Toast'
import { Coffee, LogOut, Bell } from 'lucide-react'

export default function WaiterLayout() {
  const { user, logout } = useAuthStore()
  const { add, notifications } = useNotifStore()
  const navigate = useNavigate()

  useEffect(() => {
    const socket = connectSocket()
    socket.emit('join:waiter', user._id)

    socket.on('notification:order_ready', ({ orderId, tableNumber, tableId }) => {
      add({ type: 'persist', title: `🍽️ Order Ready — Table ${tableNumber}`, message: 'Food is ready for pickup from kitchen.', orderId, tableId, action: { label: 'Mark as Served', fn: () => navigate(`/waiter/session/${tableId}`) } })
    })
    socket.on('customer:pay_now', ({ sessionId, tableId, total, paymentMethod }) => {
      add({ type: 'persist', title: `💰 Cash Payment — ₹${total?.toLocaleString('en-IN')}`, message: 'Customer requested cash payment.', sessionId, tableId, action: { label: 'Collect & Confirm', fn: () => navigate(`/waiter/session/${sessionId}`) } })
    })
    socket.on('notification:clear', ({ orderId }) => useNotifStore.getState().clearByOrderId(orderId))
    socket.on('notification:clear_payment', ({ sessionId }) => useNotifStore.getState().clearBySessionId(sessionId))

    return () => {
      socket.off('notification:order_ready')
      socket.off('customer:pay_now')
      socket.off('notification:clear')
      socket.off('notification:clear_payment')
      disconnectSocket()
    }
  }, [])

  const persistNotifs = notifications.filter(n => n.type === 'persist')
  const handleLogout = () => { logout(); navigate('/landing') }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#fdf8f4' }}>
      {/* Top bar */}
      <header className="text-white px-5 py-3.5 flex items-center justify-between shadow-lg flex-shrink-0"
        style={{ background: 'linear-gradient(135deg,#8B1A1A,#c0392b)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
            <Coffee className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-display font-bold italic text-base">Velvet Brew</span>
            <span className="text-white/50 text-sm ml-2">· Waiter</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {persistNotifs.length > 0 && (
            <div className="relative notify-dot">
              <Bell className="w-5 h-5 text-amber-300" />
              <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-amber-400 rounded-full text-white text-xs flex items-center justify-center font-bold min-w-4 px-1">
                {persistNotifs.length}
              </span>
            </div>
          )}
          <span className="text-white/80 text-sm font-semibold">{user?.name}</span>
          <button onClick={handleLogout} className="text-white/60 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto"><Outlet /></main>
      <ToastContainer />
    </div>
  )
}
