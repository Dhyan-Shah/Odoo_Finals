import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} bg-white rounded-2xl shadow-2xl animate-bounce-in max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between p-5 border-b border-surface-100 flex-shrink-0">
          <h2 className="font-display font-bold text-surface-900 text-lg">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-surface-100 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-surface-500" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
