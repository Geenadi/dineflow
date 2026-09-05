import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import MenuPage from './pages/customer/MenuPage'
import CartPage from './pages/customer/CartPage'
import OrderStatusPage from './pages/customer/OrderStatusPage'
import BookTablePage from './pages/customer/BookTablePage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import RequireAuth from './pages/admin/RequireAuth'
import MenuManagementPage from './pages/admin/MenuManagementPage'
import OrdersPage from './pages/admin/OrdersPage'
import ReservationsPage from './pages/admin/ReservationsPage'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Customer app */}
        <Route path="/" element={<MenuPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/order-status" element={<OrderStatusPage />} />
        <Route path="/book-table" element={<BookTablePage />} />

        {/* Admin portal */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/admin" element={<Navigate to="/admin/orders" replace />} />
          <Route path="/admin/menu" element={<MenuManagementPage />} />
          <Route path="/admin/orders" element={<OrdersPage />} />
          <Route path="/admin/reservations" element={<ReservationsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
