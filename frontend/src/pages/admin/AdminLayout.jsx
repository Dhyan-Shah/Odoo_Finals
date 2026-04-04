import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
<<<<<<< HEAD
import { Coffee, LayoutDashboard, Package, Tag, Grid3X3, Users, Settings, FileText, BarChart3, LogOut, Ticket } from 'lucide-react'

const NAV = [
  { to: 'dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: 'products',   icon: Package,         label: 'Products' },
  { to: 'categories', icon: Tag,             label: 'Categories' },
  { to: 'floors',     icon: Grid3X3,         label: 'Floors & Tables' },
  { to: 'staff',      icon: Users,           label: 'Staff' },
  { to: 'coupons',    icon: Ticket,          label: 'Coupons' },
  { to: 'analytics',  icon: BarChart3,       label: 'Analytics' },
  { to: 'reports',    icon: FileText,        label: 'Reports' },
  { to: 'settings',   icon: Settings,        label: 'Settings' },
=======
import {
  Coffee, LayoutDashboard, Package, Tag, Grid3X3,
  Users, Settings, FileText, BarChart3, LogOut
} from 'lucide-react'

const NAV = [
  { to: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: 'products', icon: Package, label: 'Products' },
  { to: 'categories', icon: Tag, label: 'Categories' },
  { to: 'floors', icon: Grid3X3, label: 'Floors & Tables' },
  { to: 'staff', icon: Users, label: 'Staff' },
  { to: 'analytics', icon: BarChart3, label: 'Analytics' },
  { to: 'reports', icon: FileText, label: 'Reports' },
  { to: 'settings', icon: Settings, label: 'Settings' },
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
]

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
<<<<<<< HEAD
=======

>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
  const handleLogout = () => { logout(); navigate('/staff/login') }

  return (
    <div className="flex h-screen bg-surface-100 overflow-hidden">
<<<<<<< HEAD
=======
      {/* Sidebar */}
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
      <aside className="w-56 flex-shrink-0 bg-surface-950 flex flex-col">
        <div className="p-4 border-b border-surface-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
              <Coffee className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-display font-bold text-sm truncate">Odoo POS</p>
              <p className="text-surface-500 text-xs truncate">Admin Panel</p>
            </div>
          </div>
        </div>
<<<<<<< HEAD
=======

>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
<<<<<<< HEAD
                  isActive ? 'bg-brand-500 text-white shadow-sm' : 'text-surface-400 hover:text-white hover:bg-surface-800'
                }`}>
              <Icon className="w-4 h-4 flex-shrink-0" />{label}
            </NavLink>
          ))}
        </nav>
=======
                  isActive
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-surface-400 hover:text-white hover:bg-surface-800'
                }`
              }>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
        <div className="p-3 border-t border-surface-800">
          <div className="flex items-center gap-2 px-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-brand-400 text-xs font-bold">{user?.name?.[0]}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{user?.name}</p>
              <p className="text-surface-500 text-xs truncate">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-surface-400 hover:text-red-400 hover:bg-surface-800 transition-all">
<<<<<<< HEAD
            <LogOut className="w-4 h-4" />Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto"><Outlet /></main>
=======
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
    </div>
  )
}
