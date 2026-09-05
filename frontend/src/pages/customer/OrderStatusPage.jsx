import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { orderApi } from '../../api/client'

const STATUS_LABEL = {
  PLACED: 'Placed', CONFIRMED: 'Confirmed', PREPARING: 'Preparing',
  READY: 'Ready', COMPLETED: 'Completed', CANCELLED: 'Cancelled',
}

export default function OrderStatusPage() {
  const [searchParams] = useSearchParams()
  const [reference, setReference] = useState(searchParams.get('ref') || '')
  const [order, setOrder] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function lookup(ref) {
    if (!ref.trim()) return
    setLoading(true)
    setError(null)
    setOrder(null)
    try {
      const data = await orderApi.getOrderStatus(ref.trim())
      setOrder(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchParams.get('ref')) lookup(searchParams.get('ref'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 520 }}>
        <div className="eyebrow">Order tracking</div>
        <h1 style={{ fontSize: '1.8rem' }}>Check your order status</h1>
        <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
          Enter the reference you received when you placed your order (e.g. DF-3F2A9C).
        </p>

        <form onSubmit={(e) => { e.preventDefault(); lookup(reference) }} style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem' }}>
          <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="DF-XXXXXX" />
          <button className="btn btn-primary" disabled={loading}>{loading ? '…' : 'Check'}</button>
        </form>

        {error && <div className="banner-error">{error}</div>}

        {order && (
          <div className="card" style={{ padding: '1.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>{order.reference}</strong>
              <span className={`badge badge-${order.status.toLowerCase()}`}>{STATUS_LABEL[order.status]}</span>
            </div>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>
              Total: <strong style={{ color: 'var(--color-ink)' }}>${order.totalAmount.toFixed(2)}</strong>
            </p>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.82rem' }}>
              Placed {new Date(order.createdAt).toLocaleString()}
            </p>
            <StatusTimeline current={order.status} />
          </div>
        )}
      </div>
    </div>
  )
}

const STEPS = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED']

function StatusTimeline({ current }) {
  if (current === 'CANCELLED') {
    return <p style={{ marginTop: '1rem', color: 'var(--color-danger)', fontWeight: 600 }}>This order was cancelled.</p>
  }
  const currentIndex = STEPS.indexOf(current)
  return (
    <div style={{ display: 'flex', marginTop: '1.4rem', gap: '4px' }}>
      {STEPS.map((step, i) => (
        <div key={step} style={{ flex: 1 }}>
          <div style={{ height: 6, borderRadius: 4, background: i <= currentIndex ? 'var(--color-forest)' : 'var(--color-line)' }} />
          <div style={{ fontSize: '0.65rem', marginTop: '0.3rem', color: i <= currentIndex ? 'var(--color-ink)' : 'var(--color-muted)', textAlign: 'center' }}>
            {STATUS_LABEL[step]}
          </div>
        </div>
      ))}
    </div>
  )
}
