import AdminPageHeader from '../../components/AdminPageHeader'
import { useAuth } from '../../context/useAuth'
import '../../styles/admin-profile.css'

function AdminProfile() {
  const { user } = useAuth()
  const initial = user?.name?.charAt(0)?.toUpperCase() || 'A'

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Akun"
        title="Profil Admin"
        description="Informasi akun administrator."
      />

      <section className="admin-panel admin-profile-card">
        <div className="admin-profile-avatar">{initial}</div>

        <div>
          <h2>{user?.name || 'Admin'}</h2>
          <p>{user?.email || '-'}</p>
          <span className="admin-status active">Admin</span>
        </div>
      </section>
    </div>
  )
}

export default AdminProfile
