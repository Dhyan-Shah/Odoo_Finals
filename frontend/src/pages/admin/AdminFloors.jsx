import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Modal from '../../components/common/Modal'
import Confirm from '../../components/common/Confirm'
import { QRCodeSVG } from 'qrcode.react'
import { Plus, Pencil, Trash2, QrCode, ChevronDown, ChevronRight, Grid3X3 } from 'lucide-react'

export default function AdminFloors() {
  const [floors, setFloors] = useState([])
  const [tables, setTables] = useState({})
  const [expanded, setExpanded] = useState({})
  const [floorModal, setFloorModal] = useState(false)
  const [tableModal, setTableModal] = useState(false)
  const [qrModal, setQrModal] = useState(null)
  const [editingFloor, setEditingFloor] = useState(null)
  const [editingTable, setEditingTable] = useState(null)
  const [activeFloor, setActiveFloor] = useState(null)
  const [delFloor, setDelFloor] = useState(null)
  const [delTable, setDelTable] = useState(null)
  const [floorForm, setFloorForm] = useState({ name: '' })
  const [tableForm, setTableForm] = useState({ tableNumber: '', capacity: 4 })

  const loadFloors = async () => {
    const { data } = await api.get('/admin/floors')
    setFloors(data)
    data.forEach(f => loadTables(f._id))
  }

  const loadTables = async (floorId) => {
    const { data } = await api.get(`/admin/tables/by-floor/${floorId}`)
    setTables(t => ({ ...t, [floorId]: data }))
  }

  useEffect(() => { loadFloors() }, [])

  const toggleExpand = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }))

  const saveFloor = async () => {
    if (editingFloor) await api.put(`/admin/floors/${editingFloor._id}`, floorForm)
    else await api.post('/admin/floors', floorForm)
    setFloorModal(false); loadFloors()
  }

  const saveTable = async () => {
    if (editingTable) await api.put(`/admin/tables/${editingTable._id}`, tableForm)
    else await api.post('/admin/tables', { ...tableForm, floor: activeFloor })
    setTableModal(false); loadTables(activeFloor)
  }

  const openAddTable = (floorId) => {
    setActiveFloor(floorId); setEditingTable(null)
    setTableForm({ tableNumber: '', capacity: 4 }); setTableModal(true)
  }

  const openEditTable = (t, floorId) => {
    setActiveFloor(floorId); setEditingTable(t)
    setTableForm({ tableNumber: t.tableNumber, capacity: t.capacity }); setTableModal(true)
  }

  const tableUrl = (token) => `${window.location.origin}/table?token=${token}`

  const statusColor = (s) => ({
    free: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    occupied: 'bg-red-50 border-red-200 text-red-700',
    payment: 'bg-amber-50 border-amber-200 text-amber-700',
  }[s] || 'bg-surface-100 text-surface-500')

  return (
    <div className="p-7 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-900 italic">Floors & Tables</h1>
          <p className="text-surface-500 text-sm mt-0.5">Manage your restaurant layout and QR codes</p>
        </div>
        <button onClick={() => { setEditingFloor(null); setFloorForm({ name: '' }); setFloorModal(true) }} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Floor
        </button>
      </div>

      {floors.length === 0 && (
        <div className="card p-12 text-center text-surface-400">
          <Grid3X3 className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No floors yet. Add a floor to start managing tables.</p>
        </div>
      )}

      <div className="space-y-4">
        {floors.map(floor => (
          <div key={floor._id} className="card overflow-hidden">
            {/* Floor header */}
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-50 transition-colors"
              onClick={() => toggleExpand(floor._id)}>
              <div className="flex items-center gap-3">
                {expanded[floor._id] ? <ChevronDown className="w-4 h-4 text-surface-400" /> : <ChevronRight className="w-4 h-4 text-surface-400" />}
                <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center">
                  <Grid3X3 className="w-4 h-4 text-brand-500" />
                </div>
                <div>
                  <p className="font-semibold text-surface-900">{floor.name}</p>
                  <p className="text-xs text-surface-400">{tables[floor._id]?.length || 0} tables</p>
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <button onClick={() => openAddTable(floor._id)} className="btn-secondary text-xs py-1.5">
                  <Plus className="w-3.5 h-3.5" /> Add Table
                </button>
                <button onClick={() => { setEditingFloor(floor); setFloorForm({ name: floor.name }); setFloorModal(true) }}
                  className="w-8 h-8 rounded-lg hover:bg-surface-100 flex items-center justify-center">
                  <Pencil className="w-3.5 h-3.5 text-surface-400" />
                </button>
                <button onClick={() => setDelFloor(floor)}
                  className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center">
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            </div>

            {/* Tables grid */}
            {expanded[floor._id] && (
              <div className="border-t border-surface-100 p-4">
                {(!tables[floor._id] || tables[floor._id].length === 0) ? (
                  <p className="text-surface-400 text-sm text-center py-6">No tables on this floor yet.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {tables[floor._id].map(t => (
                      <div key={t._id} className={`border-2 rounded-xl p-3 text-center ${statusColor(t.status)}`}>
                        <p className="font-bold font-display text-lg leading-none">{t.tableNumber}</p>
                        <p className="text-xs mt-1 opacity-70">{t.capacity} seats</p>
                        {t.currentWaiter && <p className="text-xs mt-1 font-medium truncate">{t.currentWaiter.name}</p>}
                        <p className="text-xs mt-1 capitalize font-medium">{t.status}</p>
                        <div className="flex justify-center gap-1 mt-2">
                          <button onClick={() => setQrModal(t)}
                            className="w-6 h-6 rounded-md bg-white/60 hover:bg-white flex items-center justify-center transition-colors"
                            title="View QR">
                            <QrCode className="w-3 h-3" />
                          </button>
                          <button onClick={() => openEditTable(t, floor._id)}
                            className="w-6 h-6 rounded-md bg-white/60 hover:bg-white flex items-center justify-center transition-colors">
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button onClick={() => setDelTable({ ...t, floorId: floor._id })}
                            className="w-6 h-6 rounded-md bg-white/60 hover:bg-white flex items-center justify-center transition-colors">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Floor modal */}
      <Modal open={floorModal} onClose={() => setFloorModal(false)} title={editingFloor ? 'Edit Floor' : 'New Floor'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Floor Name *</label>
            <input className="input" value={floorForm.name} onChange={e => setFloorForm({ name: e.target.value })} placeholder="e.g. Ground Floor" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setFloorModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={saveFloor} className="btn-primary">{editingFloor ? 'Save' : 'Create'}</button>
          </div>
        </div>
      </Modal>

      {/* Table modal */}
      <Modal open={tableModal} onClose={() => setTableModal(false)} title={editingTable ? 'Edit Table' : 'New Table'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Table Number *</label>
            <input className="input" value={tableForm.tableNumber} onChange={e => setTableForm(f => ({...f, tableNumber: e.target.value}))} placeholder="e.g. T1, A3" />
          </div>
          <div>
            <label className="label">Seating Capacity *</label>
            <input className="input" type="number" min="1" value={tableForm.capacity} onChange={e => setTableForm(f => ({...f, capacity: +e.target.value}))} />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setTableModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={saveTable} className="btn-primary">{editingTable ? 'Save' : 'Create Table'}</button>
          </div>
        </div>
      </Modal>

      {/* QR modal */}
      <Modal open={!!qrModal} onClose={() => setQrModal(null)} title={`QR Code — Table ${qrModal?.tableNumber}`} size="sm">
        {qrModal && (
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-white rounded-2xl border border-surface-200 shadow-sm">
              <QRCodeSVG value={tableUrl(qrModal.token)} size={220} level="M" />
            </div>
            <p className="text-xs text-surface-400 break-all text-center">{tableUrl(qrModal.token)}</p>
            <button onClick={() => window.print()} className="btn-secondary text-sm">Print QR Code</button>
          </div>
        )}
      </Modal>

      <Confirm open={!!delFloor} onClose={() => setDelFloor(null)} onConfirm={async () => { await api.delete(`/admin/floors/${delFloor._id}`); loadFloors() }}
        title="Deactivate Floor" message={`Deactivate "${delFloor?.name}"?`} danger />
      <Confirm open={!!delTable} onClose={() => setDelTable(null)} onConfirm={async () => { await api.delete(`/admin/tables/${delTable._id}`); loadTables(delTable.floorId) }}
        title="Deactivate Table" message={`Deactivate table "${delTable?.tableNumber}"?`} danger />
    </div>
  )
}
