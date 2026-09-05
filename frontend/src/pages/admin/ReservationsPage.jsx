import { useEffect, useState } from 'react'
import { orderApi } from '../../api/client'
import { useAuth } from '../../context/AuthContext'

const today = new Date().toISOString().slice(0, 10)

export default function ReservationsPage() {
  const { token } = useAuth()
  const [date, setDate] = useState(today)
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function refresh() {
    setLoading(true)
    try {
      const data = await orderApi.listReservations(token, date)
      setReservations(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [date]) // eslint-disable-line react-hooks/exhaustive-deps

  async function updateStatus(reservation, status) {
    try {
      const updated = await orderApi.updateReservationStatus(token, reservation.id, status)
      setReservations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="eyebrow">Admin</div>
        <h1 style={{ fontSize: '1.8rem' }}>Reservations</h1>

        <div className="field" style={{ maxWidth: 220, marginBottom: '1.2rem' }}>
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        {error && <div className="banner-error">{error}</div>}
        {loading && <p><span className="spinner" /> Loading…</p>}
        {!loading && reservations.length === 0 && <div className="empty-state">No reservations for this date.</div>}

        {reservations.length > 0 && (
          <div className="card">
            <table>
              <thead>
                <tr><th>Time</th><th>Name</th><th>Party</th><th>Table</th><th>Phone</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id}>
                    <td>{r.time?.slice(0, 5)}</td>
                    <td>{r.customerName}</td>
                    <td>{r.partySize}</td>
                    <td>T{r.tableNumber}</td>
                    <td>{r.phone}</td>
                    <td><span className={`badge badge-${r.status.toLowerCase()}`}>{r.status}</span></td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {r.status === 'PENDING' && (
                        <button className="btn btn-primary btn-sm" onClick={() => updateStatus(r, 'CONFIRMED')}>Confirm</button>
                      )}{' '}
                      {r.status !== 'CANCELLED' && (
                        <button className="btn btn-danger btn-sm" onClick={() => updateStatus(r, 'CANCELLED')}>Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
