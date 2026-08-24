import { createContext, useContext, useState, useEffect } from 'react'
import { getUser } from '../api/client'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('finassist_user')
    const lastActivity = localStorage.getItem('finassist_last_activity')

    if (storedUser && lastActivity) {
      const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10)
      const THIRTY_SIX_HOURS = 36 * 60 * 60 * 1000

      if (timeSinceLastActivity > THIRTY_SIX_HOURS) {
        localStorage.removeItem('finassist_user')
        localStorage.removeItem('finassist_last_activity')
      } else {
        setUser(JSON.parse(storedUser))
        localStorage.setItem('finassist_last_activity', Date.now().toString())
      }
    } else if (storedUser) {
      localStorage.removeItem('finassist_user')
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('finassist_user', JSON.stringify(userData))
    localStorage.setItem('finassist_last_activity', Date.now().toString())
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('finassist_user')
    localStorage.removeItem('finassist_last_activity')
  }

  /**
   * Fetches the latest user data from the backend and syncs it to state + localStorage.
   * Call this after the AI agent updates profile (income, name) during onboarding.
   */
  const refreshUser = async (userId) => {
    try {
      const fresh = await getUser(userId)
      setUser(fresh)
      localStorage.setItem('finassist_user', JSON.stringify(fresh))
      localStorage.setItem('finassist_last_activity', Date.now().toString())
    } catch (e) {
      console.warn('refreshUser failed', e)
    }
  }

  const completeOnboarding = () => {
    if (user) {
      const updatedUser = { ...user, onboarding_complete: true }
      setUser(updatedUser)
      localStorage.setItem('finassist_user', JSON.stringify(updatedUser))
      localStorage.setItem('finassist_last_activity', Date.now().toString())
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, completeOnboarding, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
