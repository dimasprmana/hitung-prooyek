import { Menu, Search } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import '../styles/admin-header.css'

function AdminHeader({ onMenu }) {
  const { user } = useAuth()
  const initial = user?.name?.charAt(0)?.toUpperCase() || 'A'

  return (
    <header className="admin-header">
      <button
        className="admin-menu-button"
        type="button"
        aria-label="Buka menu"
        onClick={onMenu}
      >
        <Menu size={20} />
      </button>

      <label className="admin-search">
        <Search size={17} />
        <input type="search" placeholder="Cari data..." />
      </label>

      <div className="admin-account">
        <span className="admin-avatar">{initial}</span>
        <div>
          <strong>{user?.name || 'Admin'}</strong>
          <small>{user?.email || '-'}</small>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
