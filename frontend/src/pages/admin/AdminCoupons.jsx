import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Modal from '../../components/common/Modal'
import Confirm from '../../components/common/Confirm'
import { Plus, Pencil, Trash2, Ticket, ToggleRight, ToggleLeft } from 'lucide-react'

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

const emptyForm = {
  code: '', discountType: 'percent', discountValue: '', minOrderAmount: 0,
  maxDiscount: '', validFrom: '', validUntil: '', usageLimit: '', active: true, description: '',
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [del, setDel] = useState(null)

  const load = async () => { const { data } = await api.get('/admin/coupons'); setCoupons(data) }
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true) }
  const openEdit = (c) => {
    setEditing(c)
    setForm({
      code: c.code, discountType: c.discountType, discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount || 0, maxDiscount: c.maxDiscount || '',
      validFrom: c.validFrom ? c.validFrom.slice(0, 10) : '',
      validUntil: c.validUntil ? c.validUntil.slice(0, 10) : '',
      usageLimit: c.usageLimit || '', active: c.active, description: c.description || '',
    })
    setModal(true)
  }

  const save = async () => {
    const body = {
      ...form,
      discountValue: +form.discountValue,
      minOrderAmount: +form.minOrderAmount || 0,
      maxDiscount: form.maxDiscount !== '' ? +form.maxDiscount : null,
      usageLimit: form.usageLimit !== '' ? +form.usageLimit : null,
      validFrom: form.validFrom || null,
      validUntil: form.validUntil || null,
    }
    if (editing) await api.put(`/admin/coupons/${editing._id}`, body)
    else await api.post('/admin/coupons', body)
    setModal(false); load()
  }

  const toggleActive = async (c) => {
    await api.put(`/admin/coupons/${c._id}`, { active: !c.active }); load()
  }

  const isExpired = (c) => c.validUntil && new Date(c.validUntil) < new Date()
  const isNotStarted = (c) => c.validFrom && new Date(c.validFrom) > new Date()

  const statusBadge = (c) => {
    if (!c.active) return <span className="badge-gray">Inactive</span>
    if (isExpired(c)) return <span className="badge-red">Expired</span>
    if (isNotStarted(c)) return <span className="badge-yellow">Scheduled</span>
    if (c.usageLimit && c.usedCount >= c.usageLimit) return <span className="badge-gray">Limit Reached</span>
    return <span className="badge-green">Active</span>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900">Coupons</h1>
          <p className="text-surface-500 text-sm mt-0.5">Manage discount codes for customers</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Coupon</button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-50 border-b border-surface-100">
            <tr>
              {['Code', 'Discount', 'Min Order', 'Validity', 'Usage', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {coupons.length === 0 && (
              <tr><td colSpan={7} className="p-12 text-center text-surface-400">
                <Ticket className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No coupons yet. Create one to offer discounts.</p>
              </td></tr>
            )}
            {coupons.map(c => (
              <tr key={c._id} className="hover:bg-surface-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-mono font-bold text-surface-900 tracking-widest text-base">{c.code}</p>
                  {c.description && <p className="text-xs text-surface-400 mt-0.5">{c.description}</p>}
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-brand-600">
                    {c.discountType === 'percent' ? `${c.discountValue}%` : fmt(c.discountValue)}
                  </p>
                  {c.discountType === 'percent' && c.maxDiscount && (
                    <p className="text-xs text-surface-400">max {fmt(c.maxDiscount)}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-surface-600">{c.minOrderAmount > 0 ? fmt(c.minOrderAmount) : '—'}</td>
                <td className="px-4 py-3 text-xs text-surface-500">
                  {c.validFrom ? <p>From: {new Date(c.validFrom).toLocaleDateString()}</p> : <p>—</p>}
                  {c.validUntil ? <p>Until: {new Date(c.validUntil).toLocaleDateString()}</p> : null}
                </td>
                <td className="px-4 py-3 text-surface-600">
                  {c.usedCount} / {c.usageLimit ?? '∞'}
                </td>
                <td className="px-4 py-3">{statusBadge(c)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleActive(c)}>
                      {c.active
                        ? <ToggleRight className="w-5 h-5 text-emerald-500 hover:text-emerald-600" />
                        : <ToggleLeft className="w-5 h-5 text-surface-300 hover:text-surface-500" />}
                    </button>
                    <button onClick={() => openEdit(c)}
                      className="w-8 h-8 rounded-lg hover:bg-surface-100 flex items-center justify-center">
                      <Pencil className="w-3.5 h-3.5 text-surface-400" />
                    </button>
                    <button onClick={() => setDel(c)}
                      className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Coupon' : 'New Coupon'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Coupon Code *</label>
            <input className="input font-mono uppercase tracking-widest" value={form.code}
              onChange={e => setForm(f => ({...f, code: e.target.value.toUpperCase()}))}
              placeholder="SUMMER20" />
          </div>
          <div>
            <label className="label">Description</label>
            <input className="input" value={form.description}
              onChange={e => setForm(f => ({...f, description: e.target.value}))}
              placeholder="Summer sale 20% off" />
          </div>
          <div>
            <label className="label">Discount Type *</label>
            <select className="input" value={form.discountType}
              onChange={e => setForm(f => ({...f, discountType: e.target.value}))}>
              <option value="percent">Percentage (%)</option>
              <option value="flat">Flat Amount (₹)</option>
            </select>
          </div>
          <div>
            <label className="label">Discount Value *</label>
            <input className="input" type="number" min="0" value={form.discountValue}
              onChange={e => setForm(f => ({...f, discountValue: e.target.value}))}
              placeholder={form.discountType === 'percent' ? '20' : '50'} />
          </div>
          {form.discountType === 'percent' && (
            <div>
              <label className="label">Max Discount Cap (₹) — optional</label>
              <input className="input" type="number" min="0" value={form.maxDiscount}
                onChange={e => setForm(f => ({...f, maxDiscount: e.target.value}))}
                placeholder="200" />
            </div>
          )}
          <div>
            <label className="label">Minimum Order Amount (₹)</label>
            <input className="input" type="number" min="0" value={form.minOrderAmount}
              onChange={e => setForm(f => ({...f, minOrderAmount: e.target.value}))} />
          </div>
          <div>
            <label className="label">Valid From — optional</label>
            <input className="input" type="date" value={form.validFrom}
              onChange={e => setForm(f => ({...f, validFrom: e.target.value}))} />
          </div>
          <div>
            <label className="label">Valid Until — optional</label>
            <input className="input" type="date" value={form.validUntil}
              onChange={e => setForm(f => ({...f, validUntil: e.target.value}))} />
          </div>
          <div>
            <label className="label">Usage Limit — optional (blank = unlimited)</label>
            <input className="input" type="number" min="1" value={form.usageLimit}
              onChange={e => setForm(f => ({...f, usageLimit: e.target.value}))}
              placeholder="100" />
          </div>
          <div className="flex items-center gap-3 mt-4">
            <input type="checkbox" id="coup-active" checked={form.active}
              onChange={e => setForm(f => ({...f, active: e.target.checked}))} className="rounded" />
            <label htmlFor="coup-active" className="text-sm text-surface-700">Active (visible to customers)</label>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-surface-100">
          <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
          <button onClick={save} className="btn-primary">{editing ? 'Save Changes' : 'Create Coupon'}</button>
        </div>
      </Modal>

      <Confirm open={!!del} onClose={() => setDel(null)}
        onConfirm={async () => { await api.delete(`/admin/coupons/${del._id}`); load() }}
        title="Delete Coupon" message={`Permanently delete coupon "${del?.code}"? This cannot be undone.`} danger />
    </div>
  )
}
