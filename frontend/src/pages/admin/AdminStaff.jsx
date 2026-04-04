import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'
import Modal from '../../components/common/Modal'
import Confirm from '../../components/common/Confirm'

const ROLE_COLORS = { admin: 'badge-red', waiter: 'badge-yellow', kitchen: 'badge-green' }

export default function AdminStaff() {
  const [staff, setStaff] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'waiter' })

  const load = () => api.get('/admin/staff').then(r => setStaff(r.data))
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm({ name: '', email: '', password: '', role: 'waiter' }); setModal(true) }
  const openEdit = (s) => { setEditing(s); setForm({ name: s.name, email: s.email, password: '', role: s.role }); setModal(true) }
  const save = async () => {
    if (editing) await api.put(`/admin/staff/${editing._id}`, form)
    else await api.post('/admin/staff', form)
    setModal(false); load()
  }

  return (
    <div className="p-7 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-900 italic">Staff</h1>
          <p className="text-surface-400 text-sm mt-0.5">Manage your team members</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Staff</button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-surface-100">
            <tr>{['Member', 'Email', 'Role', 'Actions'].map(h => (
              <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-surface-400 uppercase tracking-wider">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-surface-50">
            {staff.length === 0 && (
              <tr><td colSpan={4} className="py-12 text-center text-surface-400">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />No staff yet
              </td></tr>
            )}
            {staff.map(s => (
              <tr key={s._id} className="hover:bg-beige-50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0 shadow-md"
                      style={{ background: 'linear-gradient(135deg,#c0392b,#8B1A1A)' }}>
                      {s.name?.[0]?.toUpperCase()}
                    </div>
                    <p className="font-bold text-surface-900">{s.name}</p>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-surface-500">{s.email}</td>
                <td className="px-5 py-3.5"><span className={ROLE_COLORS[s.role] || 'badge-gray'}>{s.role}</span></td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(s)} className="btn-secondary py-1.5 px-3 text-xs"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setConfirm(s)} className="btn-danger py-1.5 px-3 text-xs"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modal} title={editing ? 'Edit Staff' : 'Add Staff'} onClose={() => setModal(false)}>
        <div className="space-y-4">
          <div><label className="label">Full Name</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div>
            <label className="label">{editing ? 'New Password (leave blank to keep)' : 'Password'}</label>
            <input type="password" className="input" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <div><label className="label">Role</label>
            <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              {['admin', 'waiter', 'kitchen'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={save} className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </Modal>

      <Confirm
        open={!!confirm}
        message={`Remove "${confirm?.name}" from staff?`}
        onConfirm={() => { api.delete(`/admin/staff/${confirm._id}`).then(() => { load(); setConfirm(null) }) }}
        onClose={() => setConfirm(null)}
      />
    </div>
  )
}