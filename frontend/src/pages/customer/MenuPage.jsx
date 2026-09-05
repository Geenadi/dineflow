import { useEffect, useMemo, useState } from 'react'
import { menuApi } from '../../api/client'
import { useCart } from '../../context/CartContext'

export default function MenuPage() {
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const { addItem } = useCart()
  const [justAdded, setJustAdded] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([menuApi.listCategories(), menuApi.listMenuItems()])
      .then(([cats, menuItems]) => {
        if (cancelled) return
        setCategories(cats)
        setItems(menuItems)
        setError(null)
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.categoryId === activeCategory
      const q = search.trim().toLowerCase()
      const matchesSearch = !q || item.name.toLowerCase().includes(q) || (item.description || '').toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [items, search, activeCategory])

  const grouped = useMemo(() => {
    const byCategory = {}
    for (const item of filtered) {
      const key = item.categoryId
      if (!byCategory[key]) byCategory[key] = []
      byCategory[key].push(item)
    }
    return categories
      .filter((c) => byCategory[c.id]?.length)
      .map((c) => ({ category: c, items: byCategory[c.id] }))
  }, [filtered, categories])

  function handleAdd(item) {
    addItem(item)
    setJustAdded(item.id)
    setTimeout(() => setJustAdded((id) => (id === item.id ? null : id)), 900)
  }

  return (
    <div className="page">
      <div className="container">
        <div className="eyebrow">Today's menu</div>
        <h1 style={{ fontSize: '2rem' }}>Browse & order</h1>
        <p style={{ color: 'var(--color-muted)', marginBottom: '1.8rem' }}>
          Pick your dishes, add them to the cart, then check out as dine-in or takeaway.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <input
            placeholder="Search the menu…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 320 }}
          />
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <FilterChip label="All" active={activeCategory === 'all'} onClick={() => setActiveCategory('all')} />
            {categories.map((c) => (
              <FilterChip key={c.id} label={c.name} active={activeCategory === c.id} onClick={() => setActiveCategory(c.id)} />
            ))}
          </div>
        </div>

        {loading && <p style={{ color: 'var(--color-muted)' }}><span className="spinner" /> Loading menu…</p>}
        {error && <div className="banner-error">Couldn't load the menu ({error}). Is menu-service running on port 8081?</div>}

        {!loading && !error && grouped.length === 0 && (
          <div className="empty-state">No dishes match your search.</div>
        )}

        {grouped.map(({ category, items: catItems }) => (
          <section key={category.id} style={{ marginBottom: '2.2rem' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '0.8rem' }}>{category.name}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {catItems.map((item) => (
                <div key={item.id} className="card" style={{ padding: '1.1rem', opacity: item.available ? 1 : 0.55 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.02rem', margin: 0 }}>{item.name}</h3>
                    <strong style={{ whiteSpace: 'nowrap', color: 'var(--color-forest)' }}>${item.price.toFixed(2)}</strong>
                  </div>
                  {item.description && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', margin: '0.4rem 0 0.9rem' }}>{item.description}</p>
                  )}
                  {!item.description && <div style={{ marginBottom: '0.9rem' }} />}
                  {item.available ? (
                    <button className="btn btn-primary btn-sm" onClick={() => handleAdd(item)}>
                      {justAdded === item.id ? 'Added ✓' : 'Add to cart'}
                    </button>
                  ) : (
                    <span className="badge badge-cancelled">Sold out</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="btn btn-sm"
      style={{
        background: active ? 'var(--color-forest)' : 'var(--color-card)',
        color: active ? 'white' : 'var(--color-ink)',
        border: '1px solid var(--color-line)',
      }}
    >
      {label}
    </button>
  )
}
