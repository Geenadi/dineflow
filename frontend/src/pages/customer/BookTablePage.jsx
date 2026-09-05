import { useState } from 'react'
import { orderApi } from '../../api/client'

const today = new Date().toISOString().slice(0, 10)

export default function BookTablePage() {
  const [form, setForm] = useState({ date: today, time: '19:00', partySize: 2, customerName: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const reservation = await orderApi.bookTable({
        date: form.date,
        time: `${form.time}:00`,
        partySize: Number(form.partySize),
        customerName: form.customerName,
        phone: form.phone,
      })
      setResult(reservation)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 520 }}>
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="eyebrow">Table booked</div>
            <h1 style={{ fontSize: '1.6rem' }}>See you soon, {result.customerName}!</h1>
            <p style={{ color: 'var(--color-muted)' }}>
              Table {result.tableNumber} · {result.date} at {result.time?.slice(0, 5)} · party of {result.partySize}
            </p>
            <span className={`badge badge-${result.status.toLowerCase()}`} style={{ marginTop: '0.8rem' }}>
              {result.status === 'PENDING' ? 'Awaiting confirmation' : result.status}
            </span>
            <div style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-ghost" onClick={() => setResult(null)}>Book another table</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 480 }}>
        <div className="eyebrow">Reservations</div>
        <h1 style={{ fontSize: '1.8rem' }}>Book a table</h1>
        <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
          We'll find you a table automatically. If nothing's free at that time, try a different slot.
        </p>

        <form onSubmit={handleSubmit} className="card" style={{ padding: '1.4rem' }}>
          {error && <div className="banner-error">{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="field">
              <label>Date</label>
              <input type="date" required min={today} value={form.date} onChange={(e) => update('date', e.target.value)} />
            </div>
            <div className="field">
              <label>Time</label>
              <input type="time" required value={form.time} onChange={(e) => update('time', e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>Party size</label>
            <input type="number" min="1" max="20" required value={form.partySize} onChange={(e) => update('partySize', e.target.value)} />
          </div>
          <div className="field">
            <label>Full name</label>
            <input required value={form.customerName} onChange={(e) => update('customerName', e.target.value)} />
          </div>
          <div className="field">
            <label>Phone number</label>
            <input required value={form.phone} onChange={(e) => update('phone', e.target.value)} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Booking…' : 'Book table'}
          </button>
        </form>
      </div>
    </div>
  )
}
