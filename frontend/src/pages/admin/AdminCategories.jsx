import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
import Modal from '../../components/common/Modal'
import Confirm from '../../components/common/Confirm'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '' })
  const [confirm, setConfirm] = useState(null)

  const load = () => api.get('/admin/categories').then(r => setCategories(r.data))
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm({ name: '' }); setModal(true) }
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name }); setModal(true) }
  const save = async () => {
    if (editing) await api.put(`/admin/categories/${editing._id}`, form)
    else await api.post('/admin/categories', form)
    setModal(false); load()
  }

  return (
    <div className="p-7 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-900 italic">Categories</h1>
          <p className="text-surface-400 text-sm mt-0.5">Organise your menu by category</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Category</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((c, i) => (
          <div key={c._id} className="card card-hover p-5 flex items-center gap-4 shine">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md"
              style={{ background: ['linear-gradient(135deg,#c0392b,#8B1A1A)', 'linear-gradient(135deg,#d4a96a,#b88c68)', 'linear-gradient(135deg,#2980b9,#1a5276)', 'linear-gradient(135deg,#27ae60,#1e8449)'][i % 4] }}>
              <Tag className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-surface-900 truncate">{c.name}</p>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => openEdit(c)} className="btn-secondary p-2 rounded-lg"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => setConfirm(c)} className="btn-danger p-2 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} title={editing ? 'Edit Category' : 'New Category'} onClose={() => setModal(false)}>
        <div className="space-y-4">
          <div>
            <label className="label">Category Name</label>
            <input className="input" value={form.name}
              onChange={e => setForm({ name: e.target.value })}
              placeholder="e.g. Hot Beverages" />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={save} className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </Modal>

      <Confirm
        open={!!confirm}
        message={`Delete "${confirm?.name}"?`}
        onConfirm={() => { api.delete(`/admin/categories/${confirm._id}`).then(() => { load(); setConfirm(null) }) }}
        onClose={() => setConfirm(null)}
      />
    </div>
  )
}