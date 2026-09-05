import { useEffect, useState } from 'react'
import { orderApi } from '../../api/client'
import { useAuth } from '../../context/AuthContext'

const STATUSES = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']

const NEXT_STATUS = {
  PLACED: 'CONFIRMED',
  CONFIRMED: 'PREPARING',
  PREPARING: 'READY',
  READY: 'COMPLETED',
}

export default function OrdersPage() {
  const { token } = useAuth()
  const [orders, setOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)

  async function refresh() {
    setLoading(true)
    try {
      const data = await orderApi.listOrders(token, statusFilter || undefined)
      setOrders(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [statusFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  async function changeStatus(order, newStatus) {
    try {
      const updated = await orderApi.updateOrderStatus(token, order.id, newStatus)
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
      if (selected?.id === updated.id) setSelected(updated)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="eyebrow">Admin</div>
        <h1 style={{ fontSize: '1.8rem' }}>Orders</h1>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
          <FilterChip label="All" active={!statusFilter} onClick={() => setStatusFilter('')} />
          {STATUSES.map((s) => (
            <FilterChip key={s} label={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
          ))}
        </div>

        {error && <div className="banner-error">{error}</div>}
        {loading && <p><span className="spinner" /> Loading…</p>}
        {!loading && orders.length === 0 && <div className="empty-state">No orders here yet.</div>}

        <div style={{ display: 'grid', gridTemplateColumns: selected ? 'minmax(0, 1.3fr) minmax(300px, 1fr)' : '1fr', gap: '2rem', alignItems: 'start' }}>
          <div className="card">
            {orders.length > 0 && (
              <table>
                <thead>
                  <tr><th>Reference</th><th>Customer</th><th>Type</th><th>Total</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{o.reference}</td>
                      <td>{o.customerName}</td>
                      <td>{o.orderType === 'DINE_IN' ? `Dine-in · T${o.tableNumber}` : 'Takeaway'}</td>
                      <td>${o.totalAmount.toFixed(2)}</td>
                      <td><span className={`badge badge-${o.status.toLowerCase()}`}>{o.status}</span></td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setSelected(o)}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {selected && (
            <div className="card" style={{ padding: '1.2rem', position: 'sticky', top: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ marginTop: 0 }}>{selected.reference}</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>Close</button>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-muted)' }}>
                {selected.customerName} · {selected.phone}<br />
                {selected.orderType === 'DINE_IN' ? `Dine-in, table ${selected.tableNumber}` : 'Takeaway'}
              </p>
              <table style={{ marginBottom: '1rem' }}>
                <tbody>
                  {selected.items.map((i, idx) => (
                    <tr key={idx}>
                      <td>{i.quantity}× {i.itemName}</td>
                      <td style={{ textAlign: 'right' }}>${i.lineTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ fontWeight: 700, borderBottom: 'none' }}>Total</td>
                    <td style={{ fontWeight: 700, textAlign: 'right', borderBottom: 'none' }}>${selected.totalAmount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {NEXT_STATUS[selected.status] && (
                  <button className="btn btn-primary btn-sm" onClick={() => changeStatus(selected, NEXT_STATUS[selected.status])}>
                    Mark {NEXT_STATUS[selected.status]}
                  </button>
                )}
                {selected.status !== 'COMPLETED' && selected.status !== 'CANCELLED' && (
                  <button className="btn btn-danger btn-sm" onClick={() => changeStatus(selected, 'CANCELLED')}>
                    Cancel order
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="btn btn-sm"
      style={{ background: active ? 'var(--color-forest)' : 'var(--color-card)', color: active ? 'white' : 'var(--color-ink)', border: '1px solid var(--color-line)' }}
    >
      {label}
    </button>
  )
}
