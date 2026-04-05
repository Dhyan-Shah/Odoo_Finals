import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Plus, Pencil, Trash2, Search, Package, Coffee, ToggleLeft, ToggleRight } from 'lucide-react'
import Modal from '../../components/common/Modal'
import Confirm from '../../components/common/Confirm'

const fmt = (n) => `₹${Number(n || 0).toFixed(2)}`

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [form, setForm] = useState({ name: '', price: '', category: '', description: '', available: true })

  const load = async () => {
    const [p, c] = await Promise.all([api.get('/admin/products'), api.get('/admin/categories')])
    setProducts(p.data); setCategories(c.data)
  }
  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', price: '', category: categories[0]?._id || '', description: '', available: true })
    setModal(true)
  }
  const openEdit = (p) => {
    setEditing(p)
    setForm({ name: p.name, price: p.price, category: p.category?._id || '', description: p.description || '', available: p.available })
    setModal(true)
  }
  const save = async () => {
    if (editing) await api.put(`/admin/products/${editing._id}`, form)
    else await api.post('/admin/products', form)
    setModal(false); load()
  }
  const del = async (p) => { await api.delete(`/admin/products/${p._id}`); setConfirm(null); load() }
  const toggle = async (p) => {
    await api.patch(`/admin/products/${p._id}/availability`, { available: !p.available })
    load()
  }

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-7 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-900 italic">Products</h1>
          <p className="text-surface-400 text-sm mt-0.5">Manage your cafe menu items</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search products…" className="input pl-11" />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr>
                {['Product', 'Category', 'Price', 'Availability', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center text-gray-400">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />No products found
                </td></tr>
              )}
              {filtered.map(p => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#c0392b,#8B1A1A)' }}>
                        <Coffee className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{p.name}</p>
                        {p.description && <p className="text-xs text-gray-400 truncate max-w-xs">{p.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="badge-yellow">{p.category?.name || '—'}</span>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-gray-900">{fmt(p.price)}</td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => toggle(p)}
                      className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${p.available ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {p.available
                        ? <ToggleRight className="w-5 h-5" />
                        : <ToggleLeft className="w-5 h-5" />}
                      {p.available ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="btn-secondary py-1.5 px-3 text-xs"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setConfirm(p)} className="btn-danger py-1.5 px-3 text-xs"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} title={editing ? 'Edit Product' : 'New Product'} onClose={() => setModal(false)}>
        <div className="space-y-4">
          <div>
            <label className="label">Product Name</label>
            <input className="input" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Cappuccino" />
          </div>
          <div>
            <label className="label">Price (₹)</label>
            <input type="number" className="input" value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={2} value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Optional description" />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`w-10 h-6 rounded-full transition-colors relative ${form.available ? 'bg-indigo-500' : 'bg-gray-300'}`}
              onClick={() => setForm(f => ({ ...f, available: !f.available }))}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.available ? 'right-1' : 'left-1'}`} />
            </div>
            <span className="text-sm font-semibold text-gray-700">Available for ordering</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={save} className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </Modal>

      <Confirm
        open={!!confirm}
        message={`Delete "${confirm?.name}"?`}
        onConfirm={() => del(confirm)}
        onClose={() => setConfirm(null)}
      />
    </div>
  )
}