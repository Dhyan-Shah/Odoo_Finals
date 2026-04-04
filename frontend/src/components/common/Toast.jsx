import { useEffect } from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { useNotifStore } from '../../store/notifStore'

const icons = {
  success: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  error:   <AlertCircle className="w-4 h-4 text-red-500" />,
  info:    <Info className="w-4 h-4 text-blue-500" />,
}

function Toast({ notif }) {
  const remove = useNotifStore(s => s.remove)

  useEffect(() => {
    if (notif.type !== 'persist') {
      const t = setTimeout(() => remove(notif.id), notif.duration || 4000)
      return () => clearTimeout(t)
    }
  }, [])

  return (
    <div className="flex items-start gap-3 bg-white border border-surface-200 rounded-2xl shadow-lg p-4 min-w-72 max-w-sm animate-slide-in">
      <div className="flex-shrink-0 mt-0.5">{icons[notif.type] || icons.info}</div>
      <div className="flex-1 min-w-0">
        {notif.title && <p className="text-sm font-semibold text-surface-900">{notif.title}</p>}
        <p className="text-sm text-surface-600">{notif.message}</p>
        {notif.action && (
          <button onClick={notif.action.fn} className="mt-2 text-xs font-medium text-brand-500 hover:text-brand-600">
            {notif.action.label}
          </button>
        )}
      </div>
      <button onClick={() => remove(notif.id)} className="flex-shrink-0 text-surface-300 hover:text-surface-500">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export default function ToastContainer() {
  const notifications = useNotifStore(s => s.notifications)
  const toasts = notifications.filter(n => ['success','error','info','persist'].includes(n.type))

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(n => <Toast key={n.id} notif={n} />)}
    </div>
  )
}
