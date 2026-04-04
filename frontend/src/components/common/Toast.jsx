import { useNotifStore } from '../../store/notifStore'
import { X, Bell, CheckCircle } from 'lucide-react'

export default function ToastContainer() {
  const { notifications, dismiss } = useNotifStore()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full">
      {notifications.filter(n => n.type !== 'persist').map(n => (
        <div key={n.id} className="card shadow-lg border-l-4 animate-slide-in p-4"
          style={{ borderLeftColor: n.type === 'error' ? '#c0392b' : n.type === 'success' ? '#27ae60' : '#d4a96a' }}>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="font-bold text-surface-900 text-sm">{n.title}</p>
              {n.message && <p className="text-surface-500 text-xs mt-0.5">{n.message}</p>}
            </div>
            <button onClick={() => dismiss(n.id)} className="text-surface-400 hover:text-surface-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      {notifications.filter(n => n.type === 'persist').map(n => (
        <div key={n.id} className="bg-surface-900 text-white rounded-2xl shadow-xl animate-slide-in p-4 border border-surface-700">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
              <Bell className="w-4 h-4 text-brand-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">{n.title}</p>
              {n.message && <p className="text-surface-400 text-xs mt-0.5">{n.message}</p>}
              {n.action && (
                <button onClick={n.action.fn} className="mt-2 text-xs font-bold text-brand-400 hover:text-brand-300 underline">
                  {n.action.label}
                </button>
              )}
            </div>
            <button onClick={() => dismiss(n.id)} className="text-surface-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
