import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../context/useAuth'

function AdminProtectedRoute() {
  const { loading, user } = useAuth()

  if (loading) {
    return null
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default AdminProtectedRoute
