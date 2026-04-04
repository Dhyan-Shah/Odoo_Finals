import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Modal from '../../components/common/Modal'
import Confirm from '../../components/common/Confirm'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'

export default function AdminCategories() {
  const [cats, setCats] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', sortOrder: 0 })
  const [del, setDel] = useState(null)

  const load = async () => {
    const { data } = await api.get('/admin/categories')
    setCats(data)
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '', sortOrder: 0 }); setModal(true) }
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, description: c.description, sortOrder: c.sortOrder }); setModal(true) }

  const save = async () => {
    if (editing) await api.put(`/admin/categories/${editing._id}`, form)
    else await api.post('/admin/categories', form)
    setModal(false); load()
  }

  const remove = async (id) => { await api.delete(`/admin/categories/${id}`); load() }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900">Categories</h1>
          <p className="text-surface-500 text-sm mt-0.5">Group your menu items</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Category</button>
      </div>

      <div className="card divide-y divide-surface-100">
        {cats.length === 0 && (
          <div className="p-12 text-center text-surface-400">
            <Tag className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No categories yet. Create one to get started.</p>
          </div>
        )}
        {cats.map(c => (
          <div key={c._id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center">
                <Tag className="w-4 h-4 text-brand-500" />
              </div>
              <div>
                <p className="font-medium text-surface-900 text-sm">{c.name}</p>
                {c.description && <p className="text-xs text-surface-400">{c.description}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={c.active ? 'badge-green' : 'badge-gray'}>{c.active ? 'Active' : 'Inactive'}</span>
              <button onClick={() => openEdit(c)} className="w-8 h-8 rounded-lg hover:bg-surface-100 flex items-center justify-center transition-colors">
                <Pencil className="w-3.5 h-3.5 text-surface-400" />
              </button>
              <button onClick={() => setDel(c)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors">
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Category' : 'New Category'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Name *</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Starters" />
          </div>
          <div>
            <label className="label">Description</label>
            <input className="input" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Optional description" />
          </div>
          <div>
            <label className="label">Sort Order</label>
            <input className="input" type="number" value={form.sortOrder} onChange={e => setForm(f => ({...f, sortOrder: +e.target.value}))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={save} className="btn-primary">{editing ? 'Save Changes' : 'Create'}</button>
          </div>
        </div>
      </Modal>

      <Confirm open={!!del} onClose={() => setDel(null)} onConfirm={() => remove(del._id)}
        title="Deactivate Category" message={`Deactivate "${del?.name}"? Products in this category will remain but the category will be hidden.`} danger />
    </div>
  )
}
