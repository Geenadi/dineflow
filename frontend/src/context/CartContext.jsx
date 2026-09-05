import { createContext, useContext, useMemo, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  // { [menuItemId]: { id, name, price, quantity } }
  const [items, setItems] = useState({})

  function addItem(menuItem) {
    setItems((prev) => {
      const existing = prev[menuItem.id]
      const quantity = (existing?.quantity || 0) + 1
      return { ...prev, [menuItem.id]: { id: menuItem.id, name: menuItem.name, price: menuItem.price, quantity } }
    })
  }

  function setQuantity(menuItemId, quantity) {
    setItems((prev) => {
      if (quantity <= 0) {
        const next = { ...prev }
        delete next[menuItemId]
        return next
      }
      return { ...prev, [menuItemId]: { ...prev[menuItemId], quantity } }
    })
  }

  function removeItem(menuItemId) {
    setItems((prev) => {
      const next = { ...prev }
      delete next[menuItemId]
      return next
    })
  }

  function clear() {
    setItems({})
  }

  const list = useMemo(() => Object.values(items), [items])
  const total = useMemo(() => list.reduce((sum, i) => sum + i.price * i.quantity, 0), [list])
  const count = useMemo(() => list.reduce((sum, i) => sum + i.quantity, 0), [list])

  return (
    <CartContext.Provider value={{ items: list, total, count, addItem, setQuantity, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
