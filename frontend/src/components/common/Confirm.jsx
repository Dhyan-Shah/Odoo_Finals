import { AlertTriangle } from 'lucide-react'

export default function Confirm({ open, message, onConfirm, onClose, onCancel, danger = true }) {
  if (!open) return null

  const handleCancel = () => {
    if (onCancel) onCancel()
    if (onClose) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(35,24,16,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-bounce-in border border-surface-100">
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <p className="font-display font-bold text-surface-900 text-lg mb-2">Are you sure?</p>
          <p className="text-surface-500 text-sm">{message}</p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={handleCancel} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 justify-center ${danger ? 'btn-danger' : 'btn-primary'}`}>Confirm</button>
        </div>
      </div>
    </div>
  )
}