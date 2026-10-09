import { useEffect, useMemo, useState } from 'react'
import AdminPageHeader from '../../components/AdminPageHeader'
import AdminStatCard from '../../components/AdminStatCard'
import { getAdminDashboard } from '../../services/adminApi'
import { formatRupiah } from '../../utils/currency'
import '../../styles/admin-dashboard.css'

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAdminDashboard()
      .then((response) => {
        setDashboard(response.data)
        setError('')
      })
      .catch((requestError) => {
        setError(requestError.message || 'Dashboard gagal dimuat.')
      })
      .finally(() => setLoading(false))
  }, [])

  const recentUsers = dashboard?.recentUsers || []
  const recentProjects = dashboard?.recentProjects || []
  const recentActivities = dashboard?.recentActivities || []

  const dashboardStats = useMemo(
    () => {
      const stats = dashboard?.stats || {}

      return [
        {
          label: 'Total User',
          value: stats.totalUsers || 0,
          description: 'Akun terdaftar',
        },
        {
          label: 'Total Proyek',
          value: stats.totalProjects || 0,
          description: 'Proyek tersimpan',
        },
        {
          label: 'Hitung Cepat',
          value: stats.totalCalculations || 0,
          description: 'Riwayat kalkulasi',
        },
        {
          label: 'Material',
          value: stats.totalMaterials || 0,
          description: 'Master material',
        },
      ]
    },
    [dashboard],
  )

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Ringkasan aktivitas utama HitungProyek."
      />

      {loading && <p>Memuat dashboard...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && (
        <>
          <section className="admin-stats-grid">
            {dashboardStats.map((item) => (
              <AdminStatCard key={item.label} {...item} />
            ))}
          </section>

          <div className="admin-dashboard-grid">
            <section className="admin-panel">
              <div className="admin-panel-heading">
                <div>
                  <h2>User Terbaru</h2>
                  <p>Akun user yang baru atau aktif digunakan.</p>
                </div>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Dibuat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.length === 0 ? (
                      <tr>
                        <td colSpan="4">Belum ada user.</td>
                      </tr>
                    ) : (
                      recentUsers.map((user) => (
                        <tr key={user.id}>
                          <td><strong>{user.name}</strong></td>
                          <td>{user.email}</td>
                          <td>{user.role}</td>
                          <td>{user.created_at || user.createdAt}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="admin-panel">
              <div className="admin-panel-heading">
                <div>
                  <h2>Aktivitas Terbaru</h2>
                  <p>Aktivitas yang terjadi pada sistem.</p>
                </div>
              </div>

              <div className="admin-activity-list">
                {recentActivities.length === 0 ? (
                  <div className="admin-empty">Belum ada aktivitas.</div>
                ) : (
                  recentActivities.map((activity, index) => (
                    <div className="admin-activity-item" key={activity}>
                      <span>{index + 1}</span>
                      <p>{activity}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <h2>Proyek Terbaru</h2>
                <p>Monitoring proyek user secara ringkas.</p>
              </div>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Proyek</th>
                    <th>Pemilik</th>
                    <th>Pekerjaan</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProjects.length === 0 ? (
                    <tr>
                      <td colSpan="5">Belum ada proyek.</td>
                    </tr>
                  ) : (
                    recentProjects.map((project) => (
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export default AdminDashboard
