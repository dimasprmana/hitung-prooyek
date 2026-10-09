import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import AdminPageHeader from '../../components/AdminPageHeader'
import MaterialResultTable from '../../components/MaterialResultTable'
import { getAdminProjectById } from '../../services/adminApi'
import { formatRupiah } from '../../utils/currency'
import '../../styles/admin-project-detail.css'

function AdminProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAdminProjectById(id)
      .then((response) => {
        setProject(response.data)
        setError('')
      })
      .catch((requestError) => {
        setError(
          requestError.message ||
            'Detail proyek gagal dimuat.',
        )
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="admin-page">Memuat detail proyek...</div>
  }

  if (error || !project) {
    return (
      <div className="admin-page">
        <AdminPageHeader
          eyebrow="Detail Proyek"
          title="Proyek tidak ditemukan"
          description={error || 'Data proyek tidak tersedia.'}
          action={
            <Link className="admin-button secondary" to="/admin/projects">
              Kembali
            </Link>
          }
        />
      </div>
    )
  }

  const works = project.works || []
  const materialSummary = project.materialSummary || []

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Detail Proyek"
        title={project.name}
        description={`Pemilik: ${project.owner || '-'}`}
        action={
          <Link className="admin-button secondary" to="/admin/projects">
            Kembali
          </Link>
        }
      />

      <section className="admin-info-grid">
        <div className="admin-info-card">
          <span>Pekerjaan</span>
          <strong>{works.length}</strong>
        </div>

        <div className="admin-info-card">
          <span>Status</span>
          <strong>{project.status}</strong>
        </div>

        <div className="admin-info-card">
          <span>Total Estimasi</span>
          <strong>{formatRupiah(project.totalCost || 0)}</strong>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Daftar Pekerjaan</h2>
            <p>Detail pekerjaan yang tersimpan pada proyek ini.</p>
          </div>
        </div>

        {works.length === 0 ? (
          <div className="admin-empty">Belum ada pekerjaan.</div>
        ) : (
          <div className="admin-card-list">
            {works.map((work) => (
              <article className="admin-list-card" key={work.id}>
                <div>
                  <strong>{work.title}</strong>
                  <span>{work.calculatorType}</span>
                </div>
                <strong>{formatRupiah(work.totalCost || 0)}</strong>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Rekap Material</h2>
            <p>Material proyek berdasarkan hasil kalkulasi user.</p>
          </div>
        </div>

        {materialSummary.length === 0 ? (
          <div className="admin-empty">Belum ada rekap material.</div>
        ) : (
          <MaterialResultTable items={materialSummary} />
        )}
      </section>
    </div>
  )
}

export default AdminProjectDetail
