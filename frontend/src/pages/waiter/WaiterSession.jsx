import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { connectSocket } from '../../api/socket'
import { useNotifStore } from '../../store/notifStore'
import Confirm from '../../components/common/Confirm'
import { ArrowLeft, Clock, CheckCircle2, Receipt } from 'lucide-react'

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

const STATUS_MAP = {
  confirmed:   { label: 'Confirmed',   color: 'badge-blue'   },
  in_progress: { label: 'In Progress', color: 'badge-yellow' },
  ready:       { label: 'Ready!',      color: 'badge-green'  },
  served:      { label: 'Served',      color: 'badge-gray'   },
}

export default function WaiterSession() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { clearBySessionId } = useNotifStore()
  const [session, setSession] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [endConfirm, setEndConfirm] = useState(false)
  const [cashConfirm, setCashConfirm] = useState(false)

  const load = async () => {
    try {
      const { data } = await api.get(`/waiter/sessions/${id}`)
      setSession(data.session); setOrders(data.orders)
    } finally { setLoading(false) }
  }

  useEffect(() => {
    load()
    const socket = connectSocket()
    socket.on('kitchen:order_in_progress', load)
    socket.on('kitchen:order_ready', load)
    socket.on('customer:order_placed', load)
    socket.on('customer:pay_now', load)
    socket.on('waiter:cash_confirmed', () => navigate('/waiter/floor'))
    return () => {
      socket.off('kitchen:order_in_progress')
      socket.off('kitchen:order_ready')
      socket.off('customer:order_placed')
      socket.off('customer:pay_now')
      socket.off('waiter:cash_confirmed')
    }
  }, [id])

  const markServed = async (orderId) => {
    await api.patch(`/waiter/orders/${orderId}/serve`)
    load()
  }

  const confirmCash = async () => {
    await api.patch(`/waiter/sessions/${id}/confirm-cash`)
    clearBySessionId(id)
    navigate('/waiter/floor')
  }

  const endSession = async () => {
    await api.post(`/waiter/sessions/${id}/end`)
    navigate('/waiter/floor')
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-surface-400">Loading…</div>
  if (!session) return <div className="p-6 text-center text-surface-400">Session not found</div>

  const subtotal = orders.reduce((s, o) => s + o.total, 0)
  const discountAmount = session.discountAmount || 0
  const total = session.totalAmount || subtotal
  const isPaid = session.paymentStatus === 'paid'
  const isCashPending = session.status === 'payment' && session.paymentMethod === 'cash' && !isPaid
  const isPaymentMode = session.status === 'payment'
  const dur = Math.floor((Date.now() - new Date(session.startTime)) / 60000)

  const readyOrders = orders.filter(o => o.status === 'ready')

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/waiter/floor')}
          className="w-9 h-9 rounded-xl border border-surface-200 bg-white flex items-center justify-center hover:bg-surface-50">
          <ArrowLeft className="w-4 h-4 text-surface-600" />
        </button>
        <div className="flex-1">
          <h1 className="font-display font-bold text-xl text-surface-900">Table {session.table?.tableNumber}</h1>
          <div className="flex items-center gap-2 text-xs text-surface-400">
            <Clock className="w-3 h-3" /> {dur}m active
            {isPaid && <span className="badge-green ml-1">Paid</span>}
            {isPaymentMode && !isPaid && <span className="badge-yellow ml-1">Awaiting Payment</span>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-surface-400">Total</p>
          <p className="font-display font-bold text-xl text-surface-900">{fmt(total)}</p>
          {discountAmount > 0 && (
            <p className="text-xs text-emerald-600">-{fmt(discountAmount)} discount</p>
          )}
        </div>
      </div>

      {/* Cash payment alert */}
      {isCashPending && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-amber-800 text-sm">💰 Cash Payment Requested</p>
            <p className="text-amber-700 text-sm">
              Collect <strong>{fmt(total)}</strong> from customer
              {discountAmount > 0 && <span className="text-emerald-700"> (after {fmt(discountAmount)} discount)</span>}
              {session.couponCode && <span className="ml-1 text-xs text-amber-600">[{session.couponCode}]</span>}
            </p>
          </div>
          <button onClick={() => setCashConfirm(true)} className="btn-primary text-sm flex-shrink-0">
            Confirm Received
          </button>
        </div>
      )}

      {/* Ready orders highlight */}
      {readyOrders.length > 0 && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4">
          <p className="font-semibold text-emerald-800 text-sm mb-2">
            🍽️ {readyOrders.length} order{readyOrders.length > 1 ? 's' : ''} ready for pickup
          </p>
          {readyOrders.map(order => (
            <div key={order._id} className="flex items-center justify-between">
              <span className="text-emerald-700 text-sm">{order.orderNumber} — {order.items.map(i => `${i.name}×${i.quantity}`).join(', ')}</span>
              <button onClick={() => markServed(order._id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors">
                <CheckCircle2 className="w-3.5 h-3.5" /> Served
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Orders list */}
      <div className="space-y-3">
        {orders.length === 0 && (
          <div className="card p-8 text-center text-surface-400 text-sm">
            No orders yet. Customer is browsing the menu.
          </div>
        )}
        {orders.map(order => (
          <div key={order._id} className="card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-surface-50 border-b border-surface-100">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-surface-500">{order.orderNumber}</span>
                <span className={STATUS_MAP[order.status]?.color || 'badge-gray'}>
                  {STATUS_MAP[order.status]?.label}
                </span>
              </div>
              <span className="font-mono font-medium text-sm">{fmt(order.total)}</span>
            </div>
            <div className="px-4 py-3 space-y-1">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className={`text-surface-700 ${item.prepared ? 'line-through text-surface-300' : ''}`}>
                    {item.name} <span className="text-surface-400">×{item.quantity}</span>
                  </span>
                  <span className="text-surface-500">{fmt(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            {order.status === 'ready' && (
              <div className="px-4 pb-3">
                <button onClick={() => markServed(order._id)}
                  className="w-full py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Mark as Served
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bill summary if in payment mode */}
      {isPaymentMode && (
        <div className="card p-4 space-y-2">
          <p className="font-semibold text-surface-900 text-sm">Bill Summary</p>
          <div className="flex justify-between text-sm text-surface-600">
            <span>Subtotal</span><span>{fmt(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-emerald-600">
              <span>Discount {session.couponCode ? `(${session.couponCode})` : ''}</span>
              <span>-{fmt(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-surface-900 border-t border-surface-100 pt-2">
            <span>Total</span><span className="text-brand-600">{fmt(total)}</span>
          </div>
          <p className="text-xs text-surface-400 capitalize">
            Payment: {session.paymentMethod || 'pending'} · Status: {session.paymentStatus}
          </p>
        </div>
      )}

      {/* End Session button — only show when session is closed (payment received) but waiter hasn't navigated away yet */}
      {session.status === 'active' && orders.every(o => o.status === 'served') && orders.length > 0 && (
        <button onClick={() => setEndConfirm(true)}
          className="w-full py-3 rounded-2xl bg-surface-900 text-white font-semibold text-sm hover:bg-surface-800 transition-colors flex items-center justify-center gap-2">
          <ReceiptText className="w-4 h-4" /> End Session & Free Table
        </button>
      )}

      <Confirm open={cashConfirm} onClose={() => setCashConfirm(false)} onConfirm={confirmCash}
        title="Confirm Cash Collection"
        message={`Confirm you collected ${fmt(total)} in cash from the customer?`} />
      <Confirm open={endConfirm} onClose={() => setEndConfirm(false)} onConfirm={endSession}
        title="End Session" message="This will close the session and free the table." />
    </div>
  )
}
