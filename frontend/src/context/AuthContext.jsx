import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  updateProfile,
} from '../services/authApi'
import { AuthContext } from './AuthContextValue'

function normalizeUser(response) {
  return response?.data?.user || response?.data || null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const response = await getCurrentUser()
      const nextUser = normalizeUser(response)
      setUser(nextUser)
      return nextUser
    } catch {
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(refreshUser)
  }, [refreshUser])

  const login = useCallback(async (email, password) => {
    const response = await loginUser({ email, password })
    const nextUser = normalizeUser(response)
    setUser(nextUser)
    return nextUser
  }, [])

  const register = useCallback((data) => {
    return registerUser(data)
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutUser()
    } finally {
      setUser(null)
    }
  }, [])

  const updateCurrentUser = useCallback(async (data) => {
    const response = await updateProfile(data)
    const nextUser = normalizeUser(response)
    setUser(nextUser)
    return nextUser
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      register,
      refreshUser,
      updateCurrentUser,
    }),
    [
      user,
      loading,
      login,
      logout,
      register,
      refreshUser,
      updateCurrentUser,
    ],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
