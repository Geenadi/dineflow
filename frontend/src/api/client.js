const MENU_API = import.meta.env.VITE_MENU_API_URL || 'http://localhost:8081'
const ORDER_API = import.meta.env.VITE_ORDER_API_URL || 'http://localhost:8082'

async function request(baseUrl, path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json().catch(() => null) : null

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`
    const error = new Error(message)
    error.status = res.status
    error.errors = data?.errors
    throw error
  }
  return data
}

// ---- menu-service ----
export const menuApi = {
  listCategories: () => request(MENU_API, '/api/categories'),
  listMenuItems: ({ categoryId, search, availableOnly } = {}) => {
    const params = new URLSearchParams()
    if (categoryId) params.set('categoryId', categoryId)
    if (search) params.set('search', search)
    if (availableOnly) params.set('availableOnly', 'true')
    const qs = params.toString()
    return request(MENU_API, `/api/menu-items${qs ? `?${qs}` : ''}`)
  },

  // admin, JWT required
  createCategory: (token, body) => request(MENU_API, '/api/admin/categories', { method: 'POST', body, token }),
  updateCategory: (token, id, body) => request(MENU_API, `/api/admin/categories/${id}`, { method: 'PUT', body, token }),
  deleteCategory: (token, id) => request(MENU_API, `/api/admin/categories/${id}`, { method: 'DELETE', token }),

  createMenuItem: (token, body) => request(MENU_API, '/api/admin/menu-items', { method: 'POST', body, token }),
  updateMenuItem: (token, id, body) => request(MENU_API, `/api/admin/menu-items/${id}`, { method: 'PUT', body, token }),
  setAvailability: (token, id, available) =>
    request(MENU_API, `/api/admin/menu-items/${id}/availability`, { method: 'PATCH', body: { available }, token }),
  deleteMenuItem: (token, id) => request(MENU_API, `/api/admin/menu-items/${id}`, { method: 'DELETE', token }),
}

// ---- order-service ----
export const orderApi = {
  login: (username, password) => request(ORDER_API, '/api/auth/login', { method: 'POST', body: { username, password } }),

  placeOrder: (body) => request(ORDER_API, '/api/orders', { method: 'POST', body }),
  getOrderStatus: (reference) => request(ORDER_API, `/api/orders/reference/${encodeURIComponent(reference)}`),
  getOrderHistory: (phone) => request(ORDER_API, `/api/orders/history/${encodeURIComponent(phone)}`),

  bookTable: (body) => request(ORDER_API, '/api/reservations', { method: 'POST', body }),

  // admin, JWT required
  listOrders: (token, status) =>
    request(ORDER_API, `/api/admin/orders${status ? `?status=${status}` : ''}`, { token }),
  getOrder: (token, id) => request(ORDER_API, `/api/admin/orders/${id}`, { token }),
  updateOrderStatus: (token, id, status) =>
    request(ORDER_API, `/api/admin/orders/${id}/status`, { method: 'PATCH', body: { status }, token }),

  listReservations: (token, date) =>
    request(ORDER_API, `/api/admin/reservations?date=${date}`, { token }),
  updateReservationStatus: (token, id, status) =>
    request(ORDER_API, `/api/admin/reservations/${id}/status`, { method: 'PATCH', body: { status }, token }),
}
