import { useState } from 'react'
import { Outlet } from 'react-router'
import AdminHeader from './AdminHeader'
import AdminSidebar from './AdminSidebar'
import '../styles/admin-base.css'
import '../styles/admin-layout.css'

function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="admin-layout">
      <div
        className={`admin-sidebar-wrap ${menuOpen ? 'open' : ''}`}
      >
        <AdminSidebar onClose={() => setMenuOpen(false)} />
      </div>

      {menuOpen && (
        <button
          className="admin-overlay"
          type="button"
          aria-label="Tutup menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="admin-main">
        <AdminHeader onMenu={() => setMenuOpen(true)} />

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
