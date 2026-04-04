import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Coffee, LayoutDashboard, Package, Tag, Grid3X3, Users, Settings, FileText, BarChart3, LogOut, Ticket, ChevronRight } from 'lucide-react'

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
]

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/landing') }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#fdf8f4' }}>
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col shadow-xl" style={{ background: 'linear-gradient(180deg, #8B1A1A 0%, #6a1212 100%)' }}>
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center border border-white/20 flex-shrink-0 backdrop-blur-sm">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-display font-bold text-base italic truncate">Velvet Brew</p>
              <p className="text-white/50 text-xs truncate font-body">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                  isActive
                    ? 'bg-white/20 text-white shadow-sm backdrop-blur-sm border border-white/20'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 truncate">{label}</span>
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2.5 px-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 border border-white/20">
              <span className="text-white text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-bold truncate">{user?.name}</p>
              <p className="text-white/50 text-xs capitalize truncate">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3.5 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all font-semibold">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
