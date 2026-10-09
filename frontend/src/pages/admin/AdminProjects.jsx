import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import AdminPageHeader from '../../components/AdminPageHeader'
import { getAdminProjects } from '../../services/adminApi'
import { formatRupiah } from '../../utils/currency'
import '../../styles/admin-projects.css'

function AdminProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAdminProjects()
      .then((response) => {
        setProjects(response.data || [])
        setError('')
      })
      .catch((requestError) => {
        setError(
          requestError.message ||
            'Proyek gagal dimuat.',
        )
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Monitoring"
        title="Proyek User"
        description="Lihat proyek user tanpa mengubah hasil perhitungan."
      />

      <section className="admin-panel">
        {loading && <p>Memuat proyek...</p>}
        {error && <p role="alert">{error}</p>}

        {!loading && !error && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nama Proyek</th>
                  <th>Pemilik</th>
                  <th>Pekerjaan</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan="6">Belum ada proyek.</td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <tr key={project.id}>
                      <td><strong>{project.name}</strong></td>
                      <td>{project.owner || '-'}</td>
                      <td>{project.works?.length || 0}</td>
                      <td>{formatRupiah(project.totalCost || 0)}</td>
                      <td>
                        <span className="admin-status active">
                          {project.status}
                        </span>
                      </td>
                      <td className="admin-table-action">
                        <Link
                          className="admin-link-button"
                          to={`/admin/projects/${project.id}`}
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminProjects
