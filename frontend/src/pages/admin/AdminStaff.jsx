import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Modal from '../../components/common/Modal'
import Confirm from '../../components/common/Confirm'
import { Plus, Pencil, ToggleLeft, ToggleRight, Users, ChefHat, UserCheck } from 'lucide-react'

export default function AdminStaff() {
  const [staff, setStaff] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deactivate, setDeactivate] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'waiter' })

  const load = async () => { const { data } = await api.get('/admin/staff'); setStaff(data) }
  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null); setForm({ name: '', email: '', password: '', role: 'waiter' }); setModal(true)
  }
  const openEdit = (s) => {
    setEditing(s); setForm({ name: s.name, email: s.email, password: '', role: s.role }); setModal(true)
  }

  const save = async () => {
    const body = { ...form }
    if (editing && !body.password) delete body.password
    if (editing) await api.put(`/admin/staff/${editing._id}`, body)
    else await api.post('/admin/staff', body)
    setModal(false); load()
  }

  const toggleActive = async (s) => {
    await api.put(`/admin/staff/${s._id}`, { active: !s.active }); load()
  }

  const roleIcon = (role) => role === 'kitchen'
    ? <ChefHat className="w-3.5 h-3.5" />
    : <UserCheck className="w-3.5 h-3.5" />

  const roleBadge = (role) => role === 'kitchen' ? 'badge-blue' : 'badge-green'

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900">Staff</h1>
          <p className="text-surface-500 text-sm mt-0.5">{staff.length} staff members</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Staff</button>
      </div>

      <div className="card divide-y divide-surface-100">
        {staff.length === 0 && (
          <div className="p-12 text-center text-surface-400">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No staff accounts yet.</p>
          </div>
        )}
        {staff.map(s => (
          <div key={s._id} className={`flex items-center justify-between p-4 ${!s.active ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center font-bold text-surface-600">
                {s.name[0].toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-surface-900 text-sm">{s.name}</p>
                <p className="text-xs text-surface-400">{s.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={roleBadge(s.role)}>
                {roleIcon(s.role)} <span className="ml-1 capitalize">{s.role}</span>
              </span>
              <button onClick={() => toggleActive(s)} title={s.active ? 'Deactivate' : 'Activate'}>
                {s.active
                  ? <ToggleRight className="w-6 h-6 text-emerald-500 hover:text-emerald-600" />
                  : <ToggleLeft className="w-6 h-6 text-surface-300 hover:text-surface-500" />}
              </button>
              <button onClick={() => openEdit(s)}
                className="w-8 h-8 rounded-lg hover:bg-surface-100 flex items-center justify-center transition-colors">
                <Pencil className="w-3.5 h-3.5 text-surface-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Staff' : 'New Staff Account'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="John Doe" />
          </div>
          <div>
            <label className="label">Email *</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="john@cafe.com" />
          </div>
          <div>
            <label className="label">{editing ? 'New Password (leave blank to keep)' : 'Password *'}</label>
            <input className="input" type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} placeholder="••••••••" />
          </div>
          <div>
            <label className="label">Role *</label>
            <select className="input" value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}>
              <option value="waiter">Waiter</option>
              <option value="kitchen">Kitchen</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={save} className="btn-primary">{editing ? 'Save Changes' : 'Create Account'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
