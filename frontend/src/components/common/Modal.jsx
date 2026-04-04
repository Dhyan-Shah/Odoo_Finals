import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Modal({ open, title, onClose, children, width = 'max-w-md' }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(35,24,16,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${width} animate-bounce-in border border-surface-100`}>
        <div className="flex items-center justify-between p-5 border-b border-surface-100">
          <h2 className="font-display font-bold text-surface-900 text-lg">{title}</h2>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-700 transition-colors p-1 rounded-lg hover:bg-surface-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}