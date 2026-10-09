import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import AdminPageHeader from '../../components/AdminPageHeader'
import {
  getAdminProjects,
  getAdminUserById,
} from '../../services/adminApi'
import { formatRupiah } from '../../utils/currency'
import '../../styles/admin-user-detail.css'

function AdminUserDetail() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      getAdminUserById(id),
      getAdminProjects(),
    ])
      .then(([userResponse, projectResponse]) => {
        const nextUser = userResponse.data
        setUser(nextUser)
        setProjects(
          (projectResponse.data || []).filter(
            (project) =>
              String(project.userId) === String(nextUser.id),
          ),
        )
        setError('')
      })
      .catch((requestError) => {
        setError(
          requestError.message ||
            'Detail user gagal dimuat.',
        )
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="admin-page">Memuat detail user...</div>
  }

  if (error || !user) {
    return (
      <div className="admin-page">
        <AdminPageHeader
          eyebrow="Detail User"
          title="User tidak ditemukan"
          description={error || 'Data user tidak tersedia.'}
          action={
            <Link className="admin-button secondary" to="/admin/users">
              Kembali
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Detail User"
        title={user.name}
        description={user.email}
        action={
          <Link className="admin-button secondary" to="/admin/users">
            Kembali
          </Link>
        }
      />

      <section className="admin-info-grid">
        <div className="admin-info-card">
          <span>Role</span>
          <strong>{user.role}</strong>
        </div>

        <div className="admin-info-card">
          <span>Jumlah Proyek</span>
          <strong>{projects.length}</strong>
        </div>

        <div className="admin-info-card">
          <span>Dibuat</span>
          <strong>{user.created_at || user.createdAt || '-'}</strong>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Proyek User</h2>
            <p>Admin melihat data proyek yang tersimpan di database.</p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="admin-empty">Belum ada proyek.</div>
        ) : (
          <div className="admin-card-list">
            {projects.map((project) => (
              <article className="admin-list-card" key={project.id}>
                <div>
                  <strong>{project.name}</strong>
                  <span>{project.works?.length || 0} pekerjaan</span>
                </div>
                <strong>{formatRupiah(project.totalCost || 0)}</strong>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminUserDetail
