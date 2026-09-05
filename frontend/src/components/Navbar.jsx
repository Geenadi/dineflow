import { Link, NavLink, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { count } = useCart()
  const { isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const isAdminSection = location.pathname.startsWith('/admin')

  return (
    <header style={{ background: 'var(--color-forest)', color: 'white' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700 }}>DineFlow</span>
          <span style={{ fontSize: '0.7rem', opacity: 0.7, fontWeight: 500 }}>{isAdminSection ? 'Admin' : 'Table & Takeaway'}</span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.4rem', fontSize: '0.88rem' }}>
          {!isAdminSection && (
            <>
              <NavStyledLink to="/">Menu</NavStyledLink>
              <NavStyledLink to="/order-status">Track order</NavStyledLink>
              <NavStyledLink to="/book-table">Book a table</NavStyledLink>
              <NavStyledLink to="/cart" style={{ position: 'relative' }}>
                Cart {count > 0 && <CartCount count={count} />}
              </NavStyledLink>
              <Link to="/admin/login" style={{ opacity: 0.6, fontSize: '0.78rem', textDecoration: 'none', color: 'white' }}>
                Staff login
              </Link>
            </>
          )}
          {isAdminSection && isAuthenticated && (
            <>
              <NavStyledLink to="/admin/menu">Menu</NavStyledLink>
              <NavStyledLink to="/admin/orders">Orders</NavStyledLink>
              <NavStyledLink to="/admin/reservations">Reservations</NavStyledLink>
              <button onClick={logout} className="btn btn-gold btn-sm">Log out</button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

function NavStyledLink({ to, children, style }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        textDecoration: 'none',
        color: 'white',
        opacity: isActive ? 1 : 0.75,
        fontWeight: isActive ? 700 : 500,
        borderBottom: isActive ? '2px solid var(--color-gold)' : '2px solid transparent',
        paddingBottom: '2px',
        ...style,
      })}
    >
      {children}
    </NavLink>
  )
}

function CartCount({ count }) {
  return (
    <span style={{
      position: 'absolute', top: -10, right: -16,
      background: 'var(--color-gold)', color: 'var(--color-ink)',
      borderRadius: '999px', fontSize: '0.65rem', fontWeight: 800,
      width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {count}
    </span>
  )
}
