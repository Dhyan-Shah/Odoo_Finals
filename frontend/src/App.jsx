import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

import LandingPage from './pages/LandingPage'
import StaffLogin from './pages/StaffLogin'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminCategories from './pages/admin/AdminCategories'
import AdminFloors from './pages/admin/AdminFloors'
import AdminStaff from './pages/admin/AdminStaff'
import AdminSettings from './pages/admin/AdminSettings'
import AdminReports from './pages/admin/AdminReports'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminCoupons from './pages/admin/AdminCoupons'
import WaiterLayout from './pages/waiter/WaiterLayout'
import WaiterFloor from './pages/waiter/WaiterFloor'
import WaiterSession from './pages/waiter/WaiterSession'
import KitchenDisplay from './pages/kitchen/KitchenDisplay'
import CustomerTable from './pages/customer/CustomerTable'

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/staff/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/staff/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/table" element={<CustomerTable />} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="floors" element={<AdminFloors />} />
          <Route path="staff" element={<AdminStaff />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>
        <Route path="/waiter" element={<ProtectedRoute roles={['waiter']}><WaiterLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="floor" replace />} />
          <Route path="floor" element={<WaiterFloor />} />
          <Route path="session/:id" element={<WaiterSession />} />
        </Route>
        <Route path="/kitchen/display" element={<ProtectedRoute roles={['kitchen']}><KitchenDisplay /></ProtectedRoute>} />
        <Route path="/" element={<RoleRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function RoleRedirect() {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/landing" replace />
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  if (user.role === 'waiter') return <Navigate to="/waiter/floor" replace />
  if (user.role === 'kitchen') return <Navigate to="/kitchen/display" replace />
  return <Navigate to="/landing" replace />
}
