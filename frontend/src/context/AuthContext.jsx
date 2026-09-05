import { createContext, useContext, useEffect, useState } from 'react'
import { orderApi } from '../api/client'

const AuthContext = createContext(null)
const STORAGE_KEY = 'dineflow_admin_token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY))
  const [username, setUsername] = useState(null)

  useEffect(() => {
    if (token) localStorage.setItem(STORAGE_KEY, token)
    else localStorage.removeItem(STORAGE_KEY)
  }, [token])

  async function login(usernameInput, password) {
    const res = await orderApi.login(usernameInput, password)
    setToken(res.token)
    setUsername(res.username)
    return res
  }

  function logout() {
    setToken(null)
    setUsername(null)
  }

  return (
    <AuthContext.Provider value={{ token, username, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
