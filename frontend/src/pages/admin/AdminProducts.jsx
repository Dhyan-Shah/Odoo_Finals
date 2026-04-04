import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Modal from '../../components/common/Modal'
import { Plus, Pencil, ToggleLeft, ToggleRight, Search, Package } from 'lucide-react'

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name:'', category:'', price:'', taxPercent:0, description:'', active:true, available:true })

  const load = async () => {
    const [p, c] = await Promise.all([api.get('/admin/products'), api.get('/admin/categories')])
    setProducts(p.data); setCategories(c.data.filter(c => c.active))
  }
  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name:'', category: categories[0]?._id || '', price:'', taxPercent:0, description:'', active:true, available:true })
    setModal(true)
  }
  const openEdit = (p) => {
    setEditing(p)
    setForm({ name:p.name, category:p.category._id, price:p.price, taxPercent:p.taxPercent, description:p.description, active:p.active, available:p.available })
    setModal(true)
  }

  const save = async () => {
    const body = { ...form, price: +form.price, taxPercent: +form.taxPercent }
    if (editing) await api.put(`/admin/products/${editing._id}`, body)
    else await api.post('/admin/products', body)
    setModal(false); load()
  }

  const toggle = async (p, field) => {
    await api.put(`/admin/products/${p._id}`, { [field]: !p[field] })
    load()
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900">Products</h1>
          <p className="text-surface-500 text-sm mt-0.5">{products.length} products in menu</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Product</button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <input className="input pl-9" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-50 border-b border-surface-100">
            <tr>
              {['Product','Category','Price','Tax','Active','Available','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="p-12 text-center text-surface-400">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No products found</p>
              </td></tr>
            )}
            {filtered.map(p => (
              <tr key={p._id} className="hover:bg-surface-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-surface-900">{p.name}</p>
                  {p.description && <p className="text-xs text-surface-400 truncate max-w-xs">{p.description}</p>}
                </td>
                <td className="px-4 py-3 text-surface-600">{p.category?.name}</td>
                <td className="px-4 py-3 font-mono font-medium text-surface-900">{fmt(p.price)}</td>
                <td className="px-4 py-3 text-surface-500">{p.taxPercent}%</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggle(p, 'active')} className="text-surface-400 hover:text-brand-500 transition-colors">
                    {p.active ? <ToggleRight className="w-6 h-6 text-brand-500" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggle(p, 'available')} className="text-surface-400 hover:text-emerald-500 transition-colors">
                    {p.available ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg hover:bg-surface-100 flex items-center justify-center">
                    <Pencil className="w-3.5 h-3.5 text-surface-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Product' : 'New Product'}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Name *</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Product name" />
          </div>
          <div className="col-span-2">
            <label className="label">Category *</label>
            <select className="input" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Price (₹) *</label>
            <input className="input" type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} placeholder="0.00" />
          </div>
          <div>
            <label className="label">Tax %</label>
            <input className="input" type="number" min="0" max="100" value={form.taxPercent} onChange={e => setForm(f => ({...f, taxPercent: e.target.value}))} />
          </div>
          <div className="col-span-2">
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={2} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Short description…" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="active" checked={form.active} onChange={e => setForm(f => ({...f, active: e.target.checked}))} className="rounded" />
            <label htmlFor="active" className="text-sm text-surface-700">Active</label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="avail" checked={form.available} onChange={e => setForm(f => ({...f, available: e.target.checked}))} className="rounded" />
            <label htmlFor="avail" className="text-sm text-surface-700">Available</label>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
          <button onClick={save} className="btn-primary">{editing ? 'Save Changes' : 'Create Product'}</button>
        </div>
      </Modal>
    </div>
  )
}
