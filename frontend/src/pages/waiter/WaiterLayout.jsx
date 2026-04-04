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
      add({
        type: 'persist',
        title: `🍽️ Order Ready — Table ${tableNumber}`,
        message: 'Food is ready for pickup from kitchen.',
        orderId,
        tableId,
        action: { label: 'Mark as Served', fn: () => navigate(`/waiter/session/${tableId}`) },
      })
    })

    socket.on('customer:pay_now', ({ sessionId, tableId, total, paymentMethod }) => {
      add({
        type: 'persist',
        title: `💰 Cash Payment — ₹${total.toLocaleString('en-IN')}`,
        message: 'Customer requested cash payment.',
        sessionId,
        tableId,
        action: { label: 'Collect & Confirm', fn: () => navigate(`/waiter/session/${sessionId}`) },
      })
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

  const handleLogout = () => { logout(); navigate('/staff/login') }

  return (
    <div className="min-h-screen bg-surface-100 flex flex-col">
      {/* Top bar */}
      <header className="bg-surface-950 text-white px-4 py-3 flex items-center justify-between shadow-lg flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
            <Coffee className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-sm">Odoo POS</span>
          <span className="text-surface-500 text-sm">· Waiter</span>
        </div>
        <div className="flex items-center gap-3">
          {persistNotifs.length > 0 && (
            <div className="relative">
              <Bell className="w-5 h-5 text-amber-400" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                {persistNotifs.length}
              </span>
            </div>
          )}
          <span className="text-surface-300 text-sm">{user?.name}</span>
          <button onClick={handleLogout} className="text-surface-400 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <ToastContainer />
    </div>
  )
}
