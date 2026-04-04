import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

<<<<<<< HEAD
import StaffLogin from './pages/StaffLogin'
=======
// Auth
import StaffLogin from './pages/StaffLogin'

// Admin
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminCategories from './pages/admin/AdminCategories'
import AdminFloors from './pages/admin/AdminFloors'
import AdminStaff from './pages/admin/AdminStaff'
import AdminSettings from './pages/admin/AdminSettings'
import AdminReports from './pages/admin/AdminReports'
import AdminAnalytics from './pages/admin/AdminAnalytics'
<<<<<<< HEAD
import AdminCoupons from './pages/admin/AdminCoupons'
import WaiterLayout from './pages/waiter/WaiterLayout'
import WaiterFloor from './pages/waiter/WaiterFloor'
import WaiterSession from './pages/waiter/WaiterSession'
import KitchenDisplay from './pages/kitchen/KitchenDisplay'
import CustomerTable from './pages/customer/CustomerTable'

=======

// Waiter
import WaiterLayout from './pages/waiter/WaiterLayout'
import WaiterFloor from './pages/waiter/WaiterFloor'
import WaiterSession from './pages/waiter/WaiterSession'

// Kitchen
import KitchenDisplay from './pages/kitchen/KitchenDisplay'

// Customer
import CustomerTable from './pages/customer/CustomerTable'

// Route guard
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
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
<<<<<<< HEAD
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/table" element={<CustomerTable />} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
=======
        {/* Public */}
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/table" element={<CustomerTable />} />

        {/* Admin */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="floors" element={<AdminFloors />} />
          <Route path="staff" element={<AdminStaff />} />
<<<<<<< HEAD
          <Route path="coupons" element={<AdminCoupons />} />
=======
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
          <Route path="settings" element={<AdminSettings />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>
<<<<<<< HEAD
        <Route path="/waiter" element={<ProtectedRoute roles={['waiter']}><WaiterLayout /></ProtectedRoute>}>
=======

        {/* Waiter */}
        <Route path="/waiter" element={
          <ProtectedRoute roles={['waiter']}>
            <WaiterLayout />
          </ProtectedRoute>
        }>
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
          <Route index element={<Navigate to="floor" replace />} />
          <Route path="floor" element={<WaiterFloor />} />
          <Route path="session/:id" element={<WaiterSession />} />
        </Route>
<<<<<<< HEAD
        <Route path="/kitchen/display" element={<ProtectedRoute roles={['kitchen']}><KitchenDisplay /></ProtectedRoute>} />
=======

        {/* Kitchen */}
        <Route path="/kitchen/display" element={
          <ProtectedRoute roles={['kitchen']}>
            <KitchenDisplay />
          </ProtectedRoute>
        } />

        {/* Default redirects */}
>>>>>>> c591385ccdd58fa458e6948a62db78e45746c79f
        <Route path="/" element={<RoleRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function RoleRedirect() {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/staff/login" replace />
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  if (user.role === 'waiter') return <Navigate to="/waiter/floor" replace />
  if (user.role === 'kitchen') return <Navigate to="/kitchen/display" replace />
  return <Navigate to="/staff/login" replace />
}
