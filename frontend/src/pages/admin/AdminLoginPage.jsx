import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(username, password)
      navigate('/admin/orders')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 400 }}>
        <div className="eyebrow">Staff area</div>
        <h1 style={{ fontSize: '1.8rem' }}>Admin login</h1>

        <form onSubmit={handleSubmit} className="card" style={{ padding: '1.4rem', marginTop: '1rem' }}>
          {error && <div className="banner-error">{error}</div>}
          <div className="field">
            <label>Username</label>
            <input required value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginTop: '0.9rem' }}>
            Default local credentials: <code>admin</code> / <code>admin123</code> (set via ADMIN_USERNAME / ADMIN_PASSWORD env vars).
          </p>
        </form>
      </div>
    </div>
  )
}
