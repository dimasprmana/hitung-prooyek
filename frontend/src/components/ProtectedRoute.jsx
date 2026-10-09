import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../context/useAuth'

function ProtectedRoute() {
  const { loading, user } = useAuth()

  if (loading) {
    return null
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  if (user.role !== 'user') {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  return <Outlet />
}

export default ProtectedRoute
