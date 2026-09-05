import { useEffect, useState } from 'react'
import { menuApi } from '../../api/client'
import { useAuth } from '../../context/AuthContext'

const emptyItemForm = { id: null, name: '', description: '', price: '', categoryId: '', available: true }
const emptyCategoryForm = { id: null, name: '', sortOrder: 0 }

export default function MenuManagementPage() {
  const { token } = useAuth()
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [itemForm, setItemForm] = useState(emptyItemForm)
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm)
  const [showCategoryForm, setShowCategoryForm] = useState(false)

  async function refresh() {
    setLoading(true)
    try {
      const [cats, menuItems] = await Promise.all([menuApi.listCategories(), menuApi.listMenuItems()])
      setCategories(cats)
      setItems(menuItems)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  async function handleItemSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const body = {
        name: itemForm.name,
        description: itemForm.description,
        price: Number(itemForm.price),
        categoryId: Number(itemForm.categoryId),
        available: itemForm.available,
      }
      if (itemForm.id) {
        await menuApi.updateMenuItem(token, itemForm.id, body)
      } else {
        await menuApi.createMenuItem(token, body)
      }
      setItemForm(emptyItemForm)
      await refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleCategorySubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const body = { name: categoryForm.name, sortOrder: Number(categoryForm.sortOrder) || 0 }
      if (categoryForm.id) {
        await menuApi.updateCategory(token, categoryForm.id, body)
      } else {
        await menuApi.createCategory(token, body)
      }
      setCategoryForm(emptyCategoryForm)
      setShowCategoryForm(false)
      await refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  async function toggleAvailability(item) {
    try {
      await menuApi.setAvailability(token, item.id, !item.available)
      await refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  async function deleteItem(item) {
    if (!confirm(`Delete "${item.name}"? This can't be undone.`)) return
    try {
      await menuApi.deleteMenuItem(token, item.id)
      await refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  async function deleteCategory(category) {
    if (!confirm(`Delete category "${category.name}"? It must have no items in it.`)) return
    try {
      await menuApi.deleteCategory(token, category.id)
      await refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="eyebrow">Admin</div>
        <h1 style={{ fontSize: '1.8rem' }}>Menu management</h1>

        {error && <div className="banner-error">{error}</div>}
        {loading && <p><span className="spinner" /> Loading…</p>}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(280px, 1fr)', gap: '2rem', alignItems: 'start', marginTop: '1rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <h3 style={{ margin: 0 }}>Categories</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => { setShowCategoryForm((s) => !s); setCategoryForm(emptyCategoryForm) }}>
                {showCategoryForm ? 'Close' : '+ New category'}
              </button>
            </div>

            {showCategoryForm && (
              <form onSubmit={handleCategorySubmit} className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <input placeholder="Category name" required value={categoryForm.name} onChange={(e) => setCategoryForm((f) => ({ ...f, name: e.target.value }))} />
                  <input placeholder="Order" type="number" style={{ width: 90 }} value={categoryForm.sortOrder} onChange={(e) => setCategoryForm((f) => ({ ...f, sortOrder: e.target.value }))} />
                  <button className="btn btn-primary btn-sm">Save</button>
                </div>
              </form>
            )}

            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <table>
                <thead><tr><th>Name</th><th>Order</th><th></th></tr></thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.sortOrder}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setCategoryForm({ id: c.id, name: c.name, sortOrder: c.sortOrder }); setShowCategoryForm(true) }}>Edit</button>{' '}
                        <button className="btn btn-danger btn-sm" onClick={() => deleteCategory(c)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3>Menu items</h3>
            <div className="card">
              <table>
                <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.categoryName}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>
                        <button className={`badge ${item.available ? 'badge-ready' : 'badge-cancelled'}`} style={{ border: 'none' }} onClick={() => toggleAvailability(item)}>
                          {item.available ? 'Available' : 'Sold out'}
                        </button>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setItemForm({
                          id: item.id, name: item.name, description: item.description || '',
                          price: item.price, categoryId: item.categoryId, available: item.available,
                        })}>Edit</button>{' '}
                        <button className="btn btn-danger btn-sm" onClick={() => deleteItem(item)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <form onSubmit={handleItemSubmit} className="card" style={{ padding: '1.2rem', position: 'sticky', top: '1rem' }}>
            <h3 style={{ marginTop: 0 }}>{itemForm.id ? 'Edit item' : 'New item'}</h3>
            <div className="field">
              <label>Name</label>
              <input required value={itemForm.name} onChange={(e) => setItemForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea rows={2} value={itemForm.description} onChange={(e) => setItemForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="field">
              <label>Category</label>
              <select required value={itemForm.categoryId} onChange={(e) => setItemForm((f) => ({ ...f, categoryId: e.target.value }))}>
                <option value="">Select…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Price</label>
              <input required type="number" step="0.01" min="0.01" value={itemForm.price} onChange={(e) => setItemForm((f) => ({ ...f, price: e.target.value }))} />
            </div>
            <div className="field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" style={{ width: 'auto' }} checked={itemForm.available} onChange={(e) => setItemForm((f) => ({ ...f, available: e.target.checked }))} />
              <label style={{ margin: 0 }}>Available</label>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" style={{ flex: 1 }}>{itemForm.id ? 'Save changes' : 'Add item'}</button>
              {itemForm.id && <button type="button" className="btn btn-ghost" onClick={() => setItemForm(emptyItemForm)}>Cancel</button>}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
