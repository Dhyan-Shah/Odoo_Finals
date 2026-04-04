import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../api/axios'
import { connectSocket } from '../../api/socket'
import { QRCodeSVG } from 'qrcode.react'
import {
  ShoppingCart, Plus, Minus, X, ChevronLeft, Coffee,
<<<<<<< HEAD
  CheckCircle, ChefHat, Bike, Clock, AlertCircle, Loader2, Tag, Printer
=======
  CheckCircle, ChefHat, Bike, Clock, AlertCircle, Loader2
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
} from 'lucide-react'

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

const ORDER_STATUS = {
<<<<<<< HEAD
  confirmed:   { label: 'Order Placed', icon: CheckCircle, color: 'text-blue-500',    bg: 'bg-blue-50'    },
  in_progress: { label: 'Preparing',    icon: ChefHat,     color: 'text-amber-500',   bg: 'bg-amber-50'   },
  ready:       { label: 'Ready!',       icon: Bike,        color: 'text-emerald-500', bg: 'bg-emerald-50' },
  served:      { label: 'Served',       icon: CheckCircle, color: 'text-surface-400', bg: 'bg-surface-50' },
}

// ── Receipt Print Component ──────────────────────────────────────────────
function Receipt({ bill, tableNumber, restaurantName, onClose }) {
  const handlePrint = () => window.print()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      {/* Print styles injected via style tag */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #receipt-print { display: block !important; position: fixed; top: 0; left: 0; width: 100%; }
        }
        #receipt-print { font-family: 'Courier New', monospace; }
      `}</style>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-4 bg-surface-900 flex items-center justify-between">
          <p className="text-white font-semibold text-sm">Receipt</p>
          <button onClick={onClose} className="text-surface-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable receipt */}
        <div id="receipt-print" className="p-5">
          <div className="text-center mb-4 pb-4 border-b-2 border-dashed border-surface-200">
            <p className="font-bold text-lg">{restaurantName || 'Odoo POS Cafe'}</p>
            <p className="text-surface-500 text-sm">Table {tableNumber}</p>
            <p className="text-surface-400 text-xs">{new Date().toLocaleString('en-IN')}</p>
          </div>

          <div className="space-y-1 mb-4">
            {bill.orders.map((order) =>
              order.items.map((item, i) => (
                <div key={`${order._id}-${i}`} className="flex justify-between text-sm">
                  <span className="flex-1">{item.name} ×{item.quantity}</span>
                  <span className="font-mono">{fmt(item.price * item.quantity)}</span>
                </div>
              ))
            )}
          </div>

          <div className="border-t-2 border-dashed border-surface-200 pt-3 space-y-1">
            <div className="flex justify-between text-sm text-surface-600">
              <span>Subtotal</span><span>{fmt(bill.subtotal)}</span>
            </div>
            {bill.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Discount {bill.couponCode ? `(${bill.couponCode})` : ''}</span>
                <span>-{fmt(bill.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-surface-200">
              <span>TOTAL</span>
              <span className="font-mono">{fmt(bill.total)}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t-2 border-dashed border-surface-200 text-center">
            <p className="text-surface-500 text-xs">Thank you for dining with us!</p>
            <p className="text-surface-400 text-xs">Please visit again ☕</p>
          </div>
        </div>

        <div className="p-4 border-t border-surface-100 flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Close</button>
          <button onClick={handlePrint} className="btn-primary flex-1 justify-center">
            <Printer className="w-4 h-4" /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  )
=======
  confirmed:   { label: 'Order Placed',   icon: CheckCircle, color: 'text-blue-500',    bg: 'bg-blue-50'    },
  in_progress: { label: 'Preparing',      icon: ChefHat,     color: 'text-amber-500',   bg: 'bg-amber-50'   },
  ready:       { label: 'Ready!',         icon: Bike,        color: 'text-emerald-500', bg: 'bg-emerald-50' },
  served:      { label: 'Served',         icon: CheckCircle, color: 'text-surface-400', bg: 'bg-surface-50' },
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
}

export default function CustomerTable() {
  const [params] = useSearchParams()
  const token = params.get('token')

  const [tableInfo, setTableInfo] = useState(null)
  const [menu, setMenu] = useState([])
  const [orders, setOrders] = useState([])
  const [cart, setCart] = useState([])
  const [settings, setSettings] = useState(null)
<<<<<<< HEAD
  const [view, setView] = useState('menu')
=======
  const [view, setView] = useState('menu') // menu | cart | tracking | payment | paid | waiting
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [placingOrder, setPlacingOrder] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [payMethod, setPayMethod] = useState(null)
<<<<<<< HEAD
  const [bill, setBill] = useState(null)
  const [showReceipt, setShowReceipt] = useState(false)

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
=======
  const [upiPaid, setUpiPaid] = useState(false)
  const [bill, setBill] = useState(null)
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f

  const loadOrders = useCallback(async (sessionId) => {
    if (!sessionId) return
    const { data } = await api.get(`/customer/sessions/${sessionId}/orders`)
    setOrders(data)
  }, [])

  const loadBill = useCallback(async (sessionId) => {
    if (!sessionId) return
    const { data } = await api.get(`/customer/sessions/${sessionId}/bill`)
    setBill(data)
<<<<<<< HEAD
    return data
=======
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
  }, [])

  useEffect(() => {
    if (!token) { setError('Invalid QR code'); setLoading(false); return }
<<<<<<< HEAD
=======

>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
    const init = async () => {
      try {
        const [tableRes, menuRes, settingsRes] = await Promise.all([
          api.get(`/customer/table/${token}`),
          api.get('/customer/menu'),
          api.get('/customer/settings'),
        ])
        const t = tableRes.data
<<<<<<< HEAD
        setTableInfo(t); setMenu(menuRes.data); setSettings(settingsRes.data)
        if (!t.hasActiveSession) { setView('waiting'); setLoading(false); return }
        if (menuRes.data.length > 0) setSelectedCategory(menuRes.data[0].category._id)
        await loadOrders(t.sessionId)
        setLoading(false)
      } catch (err) { setError(err.response?.data?.message || 'Something went wrong'); setLoading(false) }
=======
        setTableInfo(t)
        setMenu(menuRes.data)
        setSettings(settingsRes.data)

        if (!t.hasActiveSession) { setView('waiting'); setLoading(false); return }
        if (menuRes.data.length > 0) setSelectedCategory(menuRes.data[0].category._id)

        await loadOrders(t.sessionId)
        setLoading(false)
      } catch (err) {
        setError(err.response?.data?.message || 'Something went wrong'); setLoading(false)
      }
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
    }
    init()
  }, [token])

  useEffect(() => {
    if (!tableInfo?.tableId) return
    const socket = connectSocket()
    socket.emit('join:table', tableInfo.tableId)
<<<<<<< HEAD
=======

>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
    const refresh = () => loadOrders(tableInfo.sessionId)
    socket.on('customer:order_placed', refresh)
    socket.on('kitchen:order_in_progress', refresh)
    socket.on('kitchen:order_ready', refresh)
    socket.on('waiter:order_served', refresh)
<<<<<<< HEAD
    socket.on('waiter:cash_confirmed', async () => {
      const b = await loadBill(tableInfo.sessionId)
      setBill(b); setView('paid')
    })
    socket.on('customer:upi_paid', async () => {
      const b = await loadBill(tableInfo.sessionId)
      setBill(b); setView('paid')
    })
=======
    socket.on('waiter:cash_confirmed', () => { setView('paid') })
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
    socket.on('product:availability_changed', async () => {
      const { data } = await api.get('/customer/menu')
      setMenu(data)
    })
<<<<<<< HEAD
    return () => {
      socket.off('customer:order_placed'); socket.off('kitchen:order_in_progress')
      socket.off('kitchen:order_ready'); socket.off('waiter:order_served')
      socket.off('waiter:cash_confirmed'); socket.off('customer:upi_paid')
=======

    return () => {
      socket.off('customer:order_placed')
      socket.off('kitchen:order_in_progress')
      socket.off('kitchen:order_ready')
      socket.off('waiter:order_served')
      socket.off('waiter:cash_confirmed')
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
      socket.off('product:availability_changed')
    }
  }, [tableInfo])

  // Cart helpers
<<<<<<< HEAD
  const addToCart = (product) => setCart(c => {
    const ex = c.find(i => i.productId === product._id)
    if (ex) return c.map(i => i.productId === product._id ? { ...i, qty: i.qty + 1 } : i)
    return [...c, { productId: product._id, name: product.name, price: product.price, taxPercent: product.taxPercent, qty: 1 }]
  })
  const changeQty = (pid, delta) => setCart(c =>
    c.map(i => i.productId === pid ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0)
  )
  const removeFromCart = (pid) => setCart(c => c.filter(i => i.productId !== pid))
=======
  const addToCart = (product) => {
    setCart(c => {
      const existing = c.find(i => i.productId === product._id)
      if (existing) return c.map(i => i.productId === product._id ? { ...i, qty: i.qty + 1 } : i)
      return [...c, { productId: product._id, name: product.name, price: product.price, taxPercent: product.taxPercent, qty: 1 }]
    })
  }

  const removeFromCart = (productId) => setCart(c => c.filter(i => i.productId !== productId))

  const changeQty = (productId, delta) => {
    setCart(c => c.map(i => i.productId === productId ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0))
  }
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f

  const cartTotal = cart.reduce((s, i) => s + i.price * (1 + i.taxPercent / 100) * i.qty, 0)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  const placeOrder = async () => {
    setPlacingOrder(true)
    try {
      await api.post('/customer/orders', {
<<<<<<< HEAD
        sessionId: tableInfo.sessionId, tableId: tableInfo.tableId,
        items: cart.map(i => ({ productId: i.productId, name: i.name, price: i.price, taxPercent: i.taxPercent, quantity: i.qty })),
      })
      setCart([]); setView('tracking')
=======
        sessionId: tableInfo.sessionId,
        tableId: tableInfo.tableId,
        items: cart.map(i => ({ productId: i.productId, name: i.name, price: i.price, taxPercent: i.taxPercent, quantity: i.qty })),
      })
      setCart([])
      setView('tracking')
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
      await loadOrders(tableInfo.sessionId)
    } finally { setPlacingOrder(false) }
  }

  const openPayment = async () => {
<<<<<<< HEAD
    const b = await loadBill(tableInfo.sessionId)
    setBill(b); setView('payment'); setCouponApplied(null); setCouponCode(''); setCouponError('')
  }

  // Coupon validation
  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true); setCouponError(''); setCouponApplied(null)
    try {
      const { data } = await api.post('/customer/coupons/validate', {
        code: couponCode, orderAmount: bill?.subtotal || 0,
      })
      setCouponApplied(data)
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon')
    } finally { setCouponLoading(false) }
  }

  const removeCoupon = () => { setCouponApplied(null); setCouponCode(''); setCouponError('') }

  const requestPayment = async () => {
    if (!payMethod) return
    const res = await api.post(`/customer/sessions/${tableInfo.sessionId}/pay`, {
      paymentMethod: payMethod,
      couponCode: couponApplied?.code || null,
    })
    const updatedBill = { ...bill, discountAmount: res.data.discountAmount, total: res.data.total, couponCode: res.data.couponCode }
    setBill(updatedBill)
=======
    await loadBill(tableInfo.sessionId)
    setView('payment')
  }

  const requestPayment = async () => {
    if (!payMethod) return
    await api.post(`/customer/sessions/${tableInfo.sessionId}/pay`, { paymentMethod: payMethod })
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
    if (payMethod === 'upi') setView('upi')
    else if (payMethod === 'cash') setView('cash')
    else if (payMethod === 'card') setView('card')
  }

  const confirmUpiPaid = async () => {
    await api.post(`/customer/sessions/${tableInfo.sessionId}/upi-paid`)
<<<<<<< HEAD
    const b = await loadBill(tableInfo.sessionId)
    setBill(b); setView('paid')
  }

  const confirmCardPaid = async () => {
    await api.post(`/customer/sessions/${tableInfo.sessionId}/card-paid`)
    const b = await loadBill(tableInfo.sessionId)
    setBill(b); setView('paid')
  }

  // ── LOADING / ERROR ──────────────────────────────────────────────────────
=======
    setView('paid')
  }

  // ── SCREENS ────────────────────────────────────────────────────────────

>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
  if (loading) return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center">
      <div className="text-center">
        <Coffee className="w-10 h-10 text-brand-500 mx-auto mb-3 animate-pulse" />
        <p className="text-surface-500 text-sm">Loading menu…</p>
      </div>
    </div>
  )
<<<<<<< HEAD
=======

>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
  if (error) return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
      <div className="text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-surface-700 font-medium">{error}</p>
      </div>
    </div>
  )

<<<<<<< HEAD
  // ── WAITING ─────────────────────────────────────────────────────────────
=======
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
  if (view === 'waiting') return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto">
          <Coffee className="w-8 h-8 text-brand-500" />
        </div>
<<<<<<< HEAD
        <h1 className="font-display font-bold text-2xl text-surface-900">Table {tableInfo?.tableNumber}</h1>
        <p className="text-surface-500">Your table is being set up. Please wait for your waiter.</p>
=======
        <div>
          <h1 className="font-display font-bold text-2xl text-surface-900">Table {tableInfo?.tableNumber}</h1>
          <p className="text-surface-500 mt-1">Your table is being set up. Please wait for your waiter.</p>
        </div>
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
        <button onClick={() => window.location.reload()} className="btn-secondary text-sm">Refresh</button>
      </div>
    </div>
  )

<<<<<<< HEAD
  // ── PAID ────────────────────────────────────────────────────────────────
  if (view === 'paid') return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
      {showReceipt && bill && (
        <Receipt bill={bill} tableNumber={tableInfo?.tableNumber}
          restaurantName={settings?.restaurantName} onClose={() => setShowReceipt(false)} />
      )}
      <div className="text-center space-y-5">
=======
  if (view === 'paid') return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
      <div className="text-center space-y-4">
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-surface-900">Payment Complete!</h1>
          <p className="text-surface-500 mt-1">Thank you for dining with us. Have a great day! ☕</p>
<<<<<<< HEAD
          {bill && (
            <p className="text-surface-400 text-sm mt-2">
              You paid <strong>{fmt(bill.total)}</strong>
              {bill.discountAmount > 0 && ` (saved ${fmt(bill.discountAmount)}!)`}
            </p>
          )}
        </div>
        <button onClick={() => setShowReceipt(true)} className="btn-secondary text-sm mx-auto">
          <Printer className="w-4 h-4" /> View & Print Receipt
        </button>
=======
        </div>
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
      </div>
    </div>
  )

<<<<<<< HEAD
  // ── UPI ─────────────────────────────────────────────────────────────────
  if (view === 'upi' && bill) return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-6 space-y-6 max-w-sm mx-auto">
      <h1 className="font-display font-bold text-xl text-surface-900">Scan to Pay</h1>
      <div className="card p-6 flex flex-col items-center gap-4 w-full">
=======
  if (view === 'upi' && bill) return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-6 space-y-6">
      <h1 className="font-display font-bold text-xl text-surface-900">Scan to Pay</h1>
      <div className="card p-6 flex flex-col items-center gap-4">
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
        <QRCodeSVG
          value={`upi://pay?pa=${settings?.upiId}&pn=${encodeURIComponent(settings?.restaurantName || 'Cafe')}&am=${bill.total}&cu=INR`}
          size={220} level="M" />
        <p className="font-display font-bold text-2xl text-surface-900">{fmt(bill.total)}</p>
<<<<<<< HEAD
        {bill.discountAmount > 0 && (
          <p className="text-emerald-600 text-sm">You saved {fmt(bill.discountAmount)}! 🎉</p>
        )}
        <p className="text-xs text-surface-400">UPI ID: {settings?.upiId}</p>
      </div>
      <button onClick={confirmUpiPaid} className="btn-primary w-full justify-center py-3">
=======
        <p className="text-xs text-surface-400">UPI ID: {settings?.upiId}</p>
      </div>
      <button onClick={confirmUpiPaid} className="btn-primary w-full max-w-xs justify-center py-3">
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
        I Have Paid
      </button>
    </div>
  )

<<<<<<< HEAD
  // ── CASH ────────────────────────────────────────────────────────────────
=======
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
  if (view === 'cash') return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-xs">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto">
          <span className="text-3xl">💵</span>
        </div>
        <h1 className="font-display font-bold text-xl text-surface-900">Cash Payment</h1>
<<<<<<< HEAD
        <div className="card p-4 space-y-1 text-sm text-left">
          {bill?.discountAmount > 0 && <>
            <div className="flex justify-between text-surface-500"><span>Subtotal</span><span>{fmt(bill.subtotal)}</span></div>
            <div className="flex justify-between text-emerald-600"><span>Discount ({bill.couponCode})</span><span>-{fmt(bill.discountAmount)}</span></div>
          </>}
          <div className="flex justify-between font-bold text-surface-900 text-base">
            <span>Amount to Pay</span><span>{fmt(bill?.total)}</span>
          </div>
        </div>
        <p className="text-surface-500 text-sm">Your waiter has been notified and will collect payment shortly.</p>
=======
        <p className="text-surface-500 text-sm">Please request your bill from the waiter. They will collect <strong>{fmt(bill?.total)}</strong> from you.</p>
        <p className="text-xs text-surface-400 bg-surface-100 rounded-xl p-3">Your waiter has been notified and is on their way.</p>
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
      </div>
    </div>
  )

<<<<<<< HEAD
  // ── CARD ────────────────────────────────────────────────────────────────
=======
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
  if (view === 'card') return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-xs">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto">
          <span className="text-3xl">💳</span>
        </div>
        <h1 className="font-display font-bold text-xl text-surface-900">Card Payment</h1>
<<<<<<< HEAD
        <div className="card p-4 text-sm text-left space-y-1">
          {bill?.discountAmount > 0 && <>
            <div className="flex justify-between text-surface-500"><span>Subtotal</span><span>{fmt(bill.subtotal)}</span></div>
            <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{fmt(bill.discountAmount)}</span></div>
          </>}
          <div className="flex justify-between font-bold text-surface-900 text-base">
            <span>Amount to Pay</span><span>{fmt(bill?.total)}</span>
          </div>
        </div>
        <p className="text-surface-500 text-sm">Please hand your card to the waiter to complete payment.</p>
        <button onClick={confirmCardPaid} className="btn-primary w-full justify-center py-2.5 text-sm">
          Payment Done
        </button>
=======
        <p className="text-surface-500 text-sm">Please hand your card to the waiter. Amount: <strong>{fmt(bill?.total)}</strong></p>
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
      </div>
    </div>
  )

<<<<<<< HEAD
  // ── MENU / TRACKING ──────────────────────────────────────────────────────
=======
  // ── MENU ───────────────────────────────────────────────────────────────
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
  if (view === 'menu' || view === 'tracking') {
    const categories = menu.map(g => g.category)
    const activeProducts = menu.find(g => g.category._id === selectedCategory)?.products || []

    return (
      <div className="min-h-screen bg-surface-50 flex flex-col max-w-lg mx-auto">
<<<<<<< HEAD
        <div className="bg-white border-b border-surface-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <div>
            <p className="font-display font-bold text-surface-900 text-lg">Table {tableInfo?.tableNumber}</p>
            <p className="text-xs text-surface-400">{settings?.restaurantName || 'Odoo POS Cafe'}</p>
=======
        {/* Header */}
        <div className="bg-white border-b border-surface-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <div>
            <p className="font-display font-bold text-surface-900 text-lg">Table {tableInfo?.tableNumber}</p>
            <p className="text-xs text-surface-400">Odoo POS Cafe</p>
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
          </div>
          <div className="flex items-center gap-2">
            {orders.length > 0 && (
              <button onClick={() => setView(view === 'tracking' ? 'menu' : 'tracking')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                  view === 'tracking' ? 'bg-brand-500 text-white border-brand-500' : 'bg-white border-surface-200 text-surface-600'
                }`}>
<<<<<<< HEAD
                <Clock className="w-3.5 h-3.5" /> Orders ({orders.length})
=======
                <Clock className="w-3.5 h-3.5" />
                Orders ({orders.length})
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
              </button>
            )}
            {cartCount > 0 && (
              <button onClick={() => setView('cart')}
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-brand-500 text-white">
<<<<<<< HEAD
                <ShoppingCart className="w-3.5 h-3.5" />{cartCount}
=======
                <ShoppingCart className="w-3.5 h-3.5" />
                {cartCount}
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
              </button>
            )}
          </div>
        </div>

<<<<<<< HEAD
        {/* Tracking */}
=======
        {/* Tracking view */}
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
        {view === 'tracking' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-surface-900">Your Orders</h2>
              <button onClick={openPayment} className="btn-primary text-sm">Pay Now</button>
            </div>
            {orders.map(order => {
              const st = ORDER_STATUS[order.status]
              const Icon = st.icon
              return (
                <div key={order._id} className="card overflow-hidden">
                  <div className={`flex items-center gap-2 px-4 py-3 ${st.bg} border-b border-surface-100`}>
                    <Icon className={`w-4 h-4 ${st.color}`} />
                    <span className={`text-sm font-medium ${st.color}`}>{st.label}</span>
                    <span className="text-xs text-surface-400 ml-auto">{order.orderNumber}</span>
                  </div>
                  <div className="px-4 py-3 space-y-1">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm text-surface-700">
                        <span>{item.name} ×{item.quantity}</span>
                        <span>{fmt(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            <button onClick={() => setView('menu')} className="btn-secondary w-full justify-center">
              <Plus className="w-4 h-4" /> Add More Items
            </button>
          </div>
        )}

<<<<<<< HEAD
        {/* Menu */}
        {view === 'menu' && (
          <>
            <div className="flex gap-2 px-4 py-3 overflow-x-auto border-b border-surface-100 bg-white" style={{scrollbarWidth:'none'}}>
              {categories.map(cat => (
                <button key={cat._id} onClick={() => setSelectedCategory(cat._id)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat._id ? 'bg-brand-500 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
=======
        {/* Menu view */}
        {view === 'menu' && (
          <>
            {/* Category tabs */}
            <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar border-b border-surface-100 bg-white">
              {categories.map(cat => (
                <button key={cat._id} onClick={() => setSelectedCategory(cat._id)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat._id
                      ? 'bg-brand-500 text-white'
                      : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
                  }`}>
                  {cat.name}
                </button>
              ))}
            </div>
<<<<<<< HEAD
=======

            {/* Products */}
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
              {activeProducts.map(product => {
                const cartItem = cart.find(i => i.productId === product._id)
                const priceWithTax = product.price * (1 + product.taxPercent / 100)
                return (
<<<<<<< HEAD
                  <div key={product._id} className={`card p-4 ${!product.available ? 'opacity-50' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-surface-900 text-sm">{product.name}</p>
                        {product.description && <p className="text-xs text-surface-400 mt-0.5 leading-relaxed">{product.description}</p>}
                      </div>
                      {!product.available && <span className="badge-gray text-xs flex-shrink-0">Unavailable</span>}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <p className="font-bold text-surface-900">{fmt(priceWithTax)}</p>
                        {product.taxPercent > 0 && <p className="text-xs text-surface-400">incl. {product.taxPercent}% tax</p>}
                      </div>
                      {product.available && (cartItem ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => changeQty(product._id, -1)}
                            className="w-7 h-7 rounded-lg bg-surface-100 flex items-center justify-center hover:bg-surface-200">
                            <Minus className="w-3.5 h-3.5 text-surface-700" />
                          </button>
                          <span className="font-bold text-surface-900 w-5 text-center">{cartItem.qty}</span>
                          <button onClick={() => changeQty(product._id, 1)}
                            className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center hover:bg-brand-600">
                            <Plus className="w-3.5 h-3.5 text-white" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => addToCart(product)}
                          className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center hover:bg-brand-600 shadow-sm">
                          <Plus className="w-4 h-4 text-white" />
                        </button>
                      ))}
=======
                  <div key={product._id} className={`card p-4 flex items-start gap-3 ${!product.available ? 'opacity-50' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-surface-900 text-sm">{product.name}</p>
                          {product.description && <p className="text-xs text-surface-400 mt-0.5 leading-relaxed">{product.description}</p>}
                        </div>
                        {!product.available && (
                          <span className="badge-gray text-xs flex-shrink-0">Unavailable</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <p className="font-bold text-surface-900">{fmt(priceWithTax)}</p>
                          {product.taxPercent > 0 && <p className="text-xs text-surface-400">incl. {product.taxPercent}% tax</p>}
                        </div>
                        {product.available && (
                          cartItem ? (
                            <div className="flex items-center gap-2">
                              <button onClick={() => changeQty(product._id, -1)}
                                className="w-7 h-7 rounded-lg bg-surface-100 flex items-center justify-center hover:bg-surface-200 transition-colors">
                                <Minus className="w-3.5 h-3.5 text-surface-700" />
                              </button>
                              <span className="font-bold text-surface-900 w-5 text-center">{cartItem.qty}</span>
                              <button onClick={() => changeQty(product._id, 1)}
                                className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center hover:bg-brand-600 transition-colors">
                                <Plus className="w-3.5 h-3.5 text-white" />
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => addToCart(product)}
                              className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center hover:bg-brand-600 transition-colors shadow-sm">
                              <Plus className="w-4 h-4 text-white" />
                            </button>
                          )
                        )}
                      </div>
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
                    </div>
                  </div>
                )
              })}
            </div>
<<<<<<< HEAD
            {cartCount > 0 && (
              <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto p-4 bg-white border-t border-surface-100">
                <button onClick={() => setView('cart')} className="btn-primary w-full justify-between py-3">
                  <span className="flex items-center gap-2"><ShoppingCart className="w-4 h-4" />View Cart ({cartCount} items)</span>
=======

            {/* Floating cart bar */}
            {cartCount > 0 && (
              <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto p-4 bg-white border-t border-surface-100">
                <button onClick={() => setView('cart')} className="btn-primary w-full justify-between py-3">
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    View Cart ({cartCount} items)
                  </span>
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
                  <span>{fmt(cartTotal)}</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

<<<<<<< HEAD
  // ── CART ────────────────────────────────────────────────────────────────
=======
  // ── CART ───────────────────────────────────────────────────────────────
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
  if (view === 'cart') {
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
    const taxTotal = cart.reduce((s, i) => s + i.price * (i.taxPercent / 100) * i.qty, 0)
    return (
      <div className="min-h-screen bg-surface-50 flex flex-col max-w-lg mx-auto">
        <div className="bg-white border-b border-surface-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setView('menu')} className="w-8 h-8 rounded-xl border border-surface-200 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-surface-600" />
          </button>
          <h1 className="font-display font-bold text-surface-900 text-lg">Your Cart</h1>
        </div>
<<<<<<< HEAD
=======

>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.map(item => (
            <div key={item.productId} className="card p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-surface-900 text-sm">{item.name}</p>
                <p className="text-xs text-surface-400">{fmt(item.price)} each</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => changeQty(item.productId, -1)}
                  className="w-7 h-7 rounded-lg bg-surface-100 flex items-center justify-center hover:bg-surface-200">
                  <Minus className="w-3.5 h-3.5 text-surface-700" />
                </button>
                <span className="font-bold text-surface-900 w-5 text-center">{item.qty}</span>
                <button onClick={() => changeQty(item.productId, 1)}
                  className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center hover:bg-brand-600">
                  <Plus className="w-3.5 h-3.5 text-white" />
                </button>
<<<<<<< HEAD
                <button onClick={() => removeFromCart(item.productId)}
                  className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center ml-1">
=======
                <button onClick={() => removeFromCart(item.productId)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center ml-1">
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
                  <X className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
              <p className="font-bold text-surface-900 text-sm w-16 text-right">{fmt(item.price * item.qty)}</p>
            </div>
          ))}
        </div>
<<<<<<< HEAD
=======

>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
        <div className="bg-white border-t border-surface-100 p-4 space-y-3">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-surface-600"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
            <div className="flex justify-between text-surface-600"><span>Tax</span><span>{fmt(taxTotal)}</span></div>
            <div className="flex justify-between font-bold text-surface-900 text-base border-t border-surface-100 pt-2">
              <span>Total</span><span>{fmt(cartTotal)}</span>
            </div>
          </div>
          <button onClick={placeOrder} disabled={placingOrder || cart.length === 0} className="btn-primary w-full justify-center py-3">
<<<<<<< HEAD
            {placingOrder ? <><Loader2 className="w-4 h-4 animate-spin" />Placing Order…</> : 'Place Order'}
=======
            {placingOrder ? <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order…</> : 'Place Order'}
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
          </button>
        </div>
      </div>
    )
  }

  // ── PAYMENT ─────────────────────────────────────────────────────────────
  if (view === 'payment' && bill) {
<<<<<<< HEAD
    const discountFromCoupon = couponApplied?.discountAmount || 0
    const finalTotal = Math.max(0, bill.subtotal - discountFromCoupon)

=======
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
    return (
      <div className="min-h-screen bg-surface-50 flex flex-col max-w-lg mx-auto">
        <div className="bg-white border-b border-surface-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setView('tracking')} className="w-8 h-8 rounded-xl border border-surface-200 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-surface-600" />
          </button>
          <h1 className="font-display font-bold text-surface-900 text-lg">Bill & Payment</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Bill breakdown */}
          <div className="card p-4 space-y-3">
            <h2 className="font-semibold text-surface-900 text-sm">Order Summary</h2>
            {bill.orders.map(order => (
              <div key={order._id} className="space-y-1">
                <p className="text-xs font-medium text-surface-400 uppercase">{order.orderNumber}</p>
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm text-surface-700">
                    <span>{item.name} ×{item.quantity}</span>
                    <span>{fmt(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            ))}
<<<<<<< HEAD
            <div className="border-t border-surface-100 pt-2 space-y-1">
              <div className="flex justify-between text-sm text-surface-600">
                <span>Subtotal</span><span>{fmt(bill.subtotal)}</span>
              </div>
              {discountFromCoupon > 0 && (
                <div className="flex justify-between text-sm text-emerald-600 font-medium">
                  <span>Discount ({couponApplied.code})</span>
                  <span>-{fmt(discountFromCoupon)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-surface-900 text-lg pt-1 border-t border-surface-100">
                <span>Total</span>
                <span className="text-brand-500 font-display">{fmt(finalTotal)}</span>
              </div>
            </div>
          </div>

          {/* Coupon code — only for UPI and Card */}
          <div className="card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-brand-500" />
              <h2 className="font-semibold text-surface-900 text-sm">Coupon Code</h2>
              <span className="text-xs text-surface-400">(optional)</span>
            </div>
            {couponApplied ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                <div>
                  <p className="font-mono font-bold text-emerald-700 tracking-widest">{couponApplied.code}</p>
                  <p className="text-xs text-emerald-600">{couponApplied.description || `You save ${fmt(couponApplied.discountAmount)}!`}</p>
                </div>
                <button onClick={removeCoupon} className="text-emerald-500 hover:text-red-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input className="input flex-1 font-mono uppercase tracking-widest" value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="ENTER CODE" onKeyDown={e => e.key === 'Enter' && applyCoupon()} />
                <button onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()}
                  className="btn-secondary text-sm flex-shrink-0">
                  {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                </button>
              </div>
            )}
            {couponError && <p className="text-red-500 text-xs">{couponError}</p>}
          </div>

=======
            <div className="border-t border-surface-100 pt-2 flex justify-between font-bold text-surface-900">
              <span>Grand Total</span>
              <span className="text-brand-500 font-display text-xl">{fmt(bill.total)}</span>
            </div>
          </div>

>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
          {/* Payment method */}
          <div className="card p-4 space-y-3">
            <h2 className="font-semibold text-surface-900 text-sm">Select Payment Method</h2>
            {[
<<<<<<< HEAD
              { key: 'upi',  label: 'UPI QR Code', icon: '📱', desc: 'Pay via GPay, PhonePe, Paytm', enabled: settings?.paymentMethods?.upi },
              { key: 'cash', label: 'Cash',         icon: '💵', desc: 'Pay your waiter directly',     enabled: settings?.paymentMethods?.cash },
              { key: 'card', label: 'Card',         icon: '💳', desc: 'Swipe card with waiter',       enabled: settings?.paymentMethods?.card },
=======
              { key: 'upi', label: 'UPI QR Code', icon: '📱', desc: 'Pay via GPay, PhonePe, Paytm', enabled: settings?.paymentMethods?.upi },
              { key: 'cash', label: 'Cash', icon: '💵', desc: 'Pay your waiter directly', enabled: settings?.paymentMethods?.cash },
              { key: 'card', label: 'Card', icon: '💳', desc: 'Swipe card with waiter', enabled: settings?.paymentMethods?.card },
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
            ].filter(m => m.enabled).map(method => (
              <button key={method.key} onClick={() => setPayMethod(method.key)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                  payMethod === method.key ? 'border-brand-500 bg-brand-50' : 'border-surface-200 hover:border-surface-300'
                }`}>
                <span className="text-2xl">{method.icon}</span>
<<<<<<< HEAD
                <div className="flex-1">
                  <p className="font-medium text-surface-900 text-sm">{method.label}</p>
                  <p className="text-xs text-surface-400">{method.desc}</p>
                </div>
                {payMethod === method.key && <CheckCircle className="w-5 h-5 text-brand-500 flex-shrink-0" />}
=======
                <div>
                  <p className="font-medium text-surface-900 text-sm">{method.label}</p>
                  <p className="text-xs text-surface-400">{method.desc}</p>
                </div>
                {payMethod === method.key && (
                  <CheckCircle className="w-5 h-5 text-brand-500 ml-auto flex-shrink-0" />
                )}
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border-t border-surface-100 p-4">
<<<<<<< HEAD
          <button onClick={requestPayment} disabled={!payMethod}
            className="btn-primary w-full justify-center py-3 text-base">
            Proceed to Pay {fmt(finalTotal)}
=======
          <button onClick={requestPayment} disabled={!payMethod} className="btn-primary w-full justify-center py-3">
            Proceed to Pay {fmt(bill.total)}
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
          </button>
        </div>
      </div>
    )
  }

  return null
}
