import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { orderApi } from '../../api/client'

export default function CartPage() {
  const { items, total, setQuantity, removeItem, clear } = useCart()
  const [orderType, setOrderType] = useState('TAKEAWAY')
  const [form, setForm] = useState({ customerName: '', phone: '', tableNumber: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const navigate = useNavigate()

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (items.length === 0) return
    setSubmitting(true)
    try {
      const payload = {
        customerName: form.customerName,
        phone: form.phone,
        orderType,
        tableNumber: orderType === 'DINE_IN' ? form.tableNumber : null,
        items: items.map((i) => ({ menuItemId: i.id, quantity: i.quantity })),
      }
      const order = await orderApi.placeOrder(payload)
      setResult(order)
      clear()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 560 }}>
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="eyebrow">Order placed</div>
            <h1 style={{ fontSize: '1.6rem' }}>Thanks, {result.customerName}!</h1>
            <p style={{ color: 'var(--color-muted)' }}>Your order reference is:</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--color-forest)', margin: '0.4rem 0 1.2rem' }}>
              {result.reference}
            </p>
            <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
              Total: <strong style={{ color: 'var(--color-ink)' }}>${result.totalAmount.toFixed(2)}</strong> · Save this reference to track your order.
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => navigate(`/order-status?ref=${result.reference}`)}>
                Track this order
              </button>
              <Link to="/" className="btn btn-ghost">Back to menu</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container">
        <div className="eyebrow">Your order</div>
        <h1 style={{ fontSize: '1.8rem' }}>Cart & checkout</h1>

        {items.length === 0 ? (
          <div className="empty-state">
            Your cart is empty. <Link to="/" style={{ color: 'var(--color-forest)', fontWeight: 600 }}>Browse the menu</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(280px, 1fr)', gap: '2rem', alignItems: 'start' }}>
            <div className="card" style={{ padding: '1.2rem' }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 0', borderBottom: '1px solid var(--color-line)' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>${item.price.toFixed(2)} each</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <QuantityStepper
                      quantity={item.quantity}
                      onChange={(q) => setQuantity(item.id, q)}
                    />
                    <strong style={{ width: 60, textAlign: 'right' }}>${(item.price * item.quantity).toFixed(2)}</strong>
                    <button className="btn-ghost btn btn-sm" onClick={() => removeItem(item.id)}>Remove</button>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', fontSize: '1.1rem', fontWeight: 700 }}>
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="card" style={{ padding: '1.2rem' }}>
              <h3 style={{ fontSize: '1.05rem' }}>Your details</h3>

              {error && <div className="banner-error">{error}</div>}

              <div className="field">
                <label>Full name</label>
                <input required value={form.customerName} onChange={(e) => updateForm('customerName', e.target.value)} />
              </div>
              <div className="field">
                <label>Phone number</label>
                <input required value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} />
              </div>
              <div className="field">
                <label>Order type</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-sm" style={{ flex: 1, background: orderType === 'TAKEAWAY' ? 'var(--color-forest)' : 'var(--color-card)', color: orderType === 'TAKEAWAY' ? 'white' : 'var(--color-ink)', border: '1px solid var(--color-line)' }} onClick={() => setOrderType('TAKEAWAY')}>Takeaway</button>
                  <button type="button" className="btn btn-sm" style={{ flex: 1, background: orderType === 'DINE_IN' ? 'var(--color-forest)' : 'var(--color-card)', color: orderType === 'DINE_IN' ? 'white' : 'var(--color-ink)', border: '1px solid var(--color-line)' }} onClick={() => setOrderType('DINE_IN')}>Dine-in</button>
                </div>
              </div>
              {orderType === 'DINE_IN' && (
                <div className="field">
                  <label>Table number</label>
                  <input required value={form.tableNumber} onChange={(e) => updateForm('tableNumber', e.target.value)} />
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? 'Placing order…' : `Place order · $${total.toFixed(2)}`}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

function QuantityStepper({ quantity, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-line)', borderRadius: 999, overflow: 'hidden' }}>
      <StepButton onClick={() => onChange(quantity - 1)}>−</StepButton>
      <span style={{ width: 26, textAlign: 'center', fontSize: '0.9rem' }}>{quantity}</span>
      <StepButton onClick={() => onChange(quantity + 1)}>+</StepButton>
    </div>
  )
}

function StepButton({ children, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{ background: 'transparent', border: 'none', width: 26, height: 26, fontSize: '1rem', color: 'var(--color-forest)' }}>
      {children}
    </button>
  )
}
