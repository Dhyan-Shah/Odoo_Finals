import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Save, CreditCard, Banknote, Smartphone, Store } from 'lucide-react'

export default function AdminSettings() {
  const [settings, setSettings] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get('/admin/settings').then(({ data }) => setSettings(data))
  }, [])

  const save = async () => {
    setSaving(true)
    await api.put('/admin/settings', settings)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggle = (method) => setSettings(s => ({
    ...s, paymentMethods: { ...s.paymentMethods, [method]: !s.paymentMethods[method] }
  }))

  if (!settings) return <div className="flex items-center justify-center h-64 text-surface-400">Loading…</div>

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-surface-900">Settings</h1>
        <p className="text-surface-500 text-sm mt-0.5">Configure your restaurant preferences</p>
      </div>

      {/* Restaurant Info */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Store className="w-4 h-4 text-brand-500" />
          <h2 className="font-semibold text-surface-900 text-sm">Restaurant Info</h2>
        </div>
        <div>
          <label className="label">Restaurant Name</label>
          <input className="input" value={settings.restaurantName}
            onChange={e => setSettings(s => ({...s, restaurantName: e.target.value}))} />
        </div>
      </div>

      {/* Payment Methods */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="w-4 h-4 text-brand-500" />
          <h2 className="font-semibold text-surface-900 text-sm">Payment Methods</h2>
        </div>

        {[
          { key: 'cash', label: 'Cash', icon: Banknote, desc: 'Accept cash payments collected by waiter' },
          { key: 'card', label: 'Card', icon: CreditCard, desc: 'Accept card payments via POS terminal' },
          { key: 'upi', label: 'UPI QR', icon: Smartphone, desc: 'Accept UPI payments via QR code scan' },
        ].map(({ key, label, icon: Icon, desc }) => (
          <div key={key} className="flex items-start justify-between p-4 rounded-xl border border-surface-200 hover:bg-surface-50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-brand-500" />
              </div>
              <div>
                <p className="font-medium text-surface-900 text-sm">{label}</p>
                <p className="text-xs text-surface-400">{desc}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-1">
              <input type="checkbox" className="sr-only" checked={settings.paymentMethods[key]}
                onChange={() => toggle(key)} />
              <div className={`w-10 h-5 rounded-full transition-colors ${settings.paymentMethods[key] ? 'bg-brand-500' : 'bg-surface-200'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mt-0.5 ${settings.paymentMethods[key] ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'}`} />
              </div>
            </label>
          </div>
        ))}

        {settings.paymentMethods.upi && (
          <div>
            <label className="label">UPI ID *</label>
            <input className="input" value={settings.upiId}
              onChange={e => setSettings(s => ({...s, upiId: e.target.value}))}
              placeholder="yourname@upi" />
            <p className="text-xs text-surface-400 mt-1">Customers will scan a QR generated from this UPI ID</p>
          </div>
        )}
      </div>

      <button onClick={save} disabled={saving} className="btn-primary">
        <Save className="w-4 h-4" />
        {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Settings'}
      </button>
    </div>
  )
}
