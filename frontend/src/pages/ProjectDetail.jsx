import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft,Layers3,Package,Trash2,WalletCards,AlertTriangle,} from 'lucide-react'
import MaterialResultTable from '../components/MaterialResultTable'
import { formatRupiah } from '../utils/currency'
import { deleteProject as deleteApiProject,deleteProjectWork,getProjectById,} from '../services/projectApi'
import '../styles/project-detail.css'

function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteProject, setShowDeleteProject] = useState(false)

  const project = useMemo(
    () => projects.find((item) => String(item.id) === String(id)),
    [id, projects],
  )

  useEffect(() => {
    getProjectById(id)
      .then((response) => {
        setProjects([response.data])
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

  const total = project?.totalCost || 0
  const works = project?.works || []
  const materialSummary = project?.materialSummary || []

  async function handleDeleteWork(jobId) {
    try {
      const response = await deleteProjectWork(project.id, jobId)
      setProjects([response.data])
    } catch (requestError) {
      setError(
        requestError.message ||
          'Pekerjaan gagal dihapus.',
      )
    }
  }

  async function handleDeleteProject() {
    try {
      await deleteApiProject(project.id)
      setShowDeleteProject(false)
      navigate('/proyek')
    } catch (requestError) {
      setError(
        requestError.message ||
          'Proyek gagal dihapus.',
      )
    }
  }

  if (loading) {
    return (
      <main className="page proyek-page project-detail-page">
        <section className="section project-detail-section">
          <div className="container project-detail-container">
            <div className="project-detail-empty">
              <p>Memuat proyek...</p>
            </div>
          </div>
        </section>
      </main>
    )
  }

  if (!project) {
    return (
      <main className="page proyek-page project-detail-page">
        <section className="section project-detail-section">
          <div className="container project-detail-container">
            <div className="project-detail-empty">
              <h1>Proyek tidak ditemukan</h1>

              <p>
                {error ||
                  'Data proyek mungkin sudah dihapus atau tidak tersedia.'}
              </p>

              <Link
                className="button button-primary"
                to="/proyek"
              >
                <ArrowLeft size={18} />
                Kembali ke Proyek
              </Link>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="page proyek-page project-detail-page">
      <section className="section project-detail-section">
        <div className="container project-detail-container">
          {error && (
            <div className="project-detail-inline-empty">
              <p>{error}</p>
            </div>
          )}
          <div className="project-detail-back">
            <Link
              className="project-detail-back-link"
              to="/proyek"
            >
              <ArrowLeft size={18} />
              Kembali ke Proyek
            </Link>
          </div>

          <header className="project-detail-hero">
            <div className="project-detail-heading">
              <span className="status-badge active">
                {project.status}
              </span>

              <h1>{project.name}</h1>

              {project.note ? (
                <p>{project.note}</p>
              ) : (
                <p>
                  Ringkasan pekerjaan, kebutuhan material, dan
                  estimasi biaya proyek.
                </p>
              )}
            </div>

            <div className="project-detail-total">
              <span>Total Estimasi Proyek</span>
              <strong>{formatRupiah(total)}</strong>
              <small>
                Berdasarkan {works.length} pekerjaan yang tersimpan.
              </small>
            </div>
          </header>

          <div className="project-detail-stats">
            <article className="project-detail-stat">
              <span className="project-detail-stat-icon">
                <Layers3 size={20} />
              </span>

              <div>
                <span>Jumlah Pekerjaan</span>
                <strong>{works.length}</strong>
              </div>
            </article>

            <article className="project-detail-stat">
              <span className="project-detail-stat-icon">
                <Package size={20} />
              </span>

              <div>
                <span>Jenis Material</span>
                <strong>{materialSummary.length}</strong>
              </div>
            </article>

            <article className="project-detail-stat project-detail-stat-total">
              <span className="project-detail-stat-icon">
                <WalletCards size={20} />
              </span>

              <div>
                <span>Total Estimasi</span>
                <strong>{formatRupiah(total)}</strong>
              </div>
            </article>
          </div>

          <section className="project-detail-card">
            <div className="project-detail-card-heading">
              <div>
                <span className="eyebrow">Pekerjaan</span>
                <h2>Daftar Pekerjaan</h2>
                <p>
                  Semua pekerjaan yang sudah dihitung dan disimpan
                  ke dalam proyek ini.
                </p>
              </div>

              <span className="project-detail-count">
                {works.length} pekerjaan
              </span>
            </div>

            {works.length > 0 ? (
              <div className="project-detail-job-list">
                {works.map((job, index) => {
                  const area = job.resultData?.area
                  const volume = job.resultData?.volume

                  return (
                    <article
                      className="project-detail-job"
                      key={job.id}
                    >
                      <span className="project-detail-job-number">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <div className="project-detail-job-copy">
                        <h3>{job.title}</h3>

                        <p>
                          {area
                            ? `${Number(area).toFixed(2)} m²`
                            : volume
                              ? `${Number(volume).toFixed(2)} m³`
                              : 'Estimasi pekerjaan'}
                        </p>
                      </div>

                      <div className="project-detail-job-cost">
                        <span>Estimasi</span>
                        <strong>
                          {formatRupiah(job.totalCost || 0)}
                        </strong>
                      </div>

                      <button
                        className="project-detail-delete"
                        type="button"
                        aria-label={`Hapus pekerjaan ${job.title}`}
                        title="Hapus pekerjaan"
                        onClick={() => handleDeleteWork(job.id)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="project-detail-inline-empty">
                <p>Belum ada pekerjaan di proyek ini.</p>
              </div>
            )}
          </section>

          <section className="project-detail-card">
            <div className="project-detail-card-heading">
              <div>
                <span className="eyebrow">Material</span>
                <h2>Rekap Material</h2>
                <p>
                  Material yang sama sudah digabungkan menjadi satu
                  kebutuhan total proyek.
                </p>
              </div>

              <span className="project-detail-count">
                {materialSummary.length} material
              </span>
            </div>

            {materialSummary.length > 0 ? (
              <div className="project-detail-material-table">
                <MaterialResultTable items={materialSummary} />
              </div>
            ) : (
              <div className="project-detail-inline-empty">
                <p>Belum ada rekap material untuk proyek ini.</p>
              </div>
            )}
          </section>

          <section className="project-detail-danger-zone">
            <div>
              <span className="project-detail-danger-icon">
                <AlertTriangle size={20} />
              </span>

              <div>
                <h2>Hapus Proyek</h2>
                <p>
                  Hapus proyek jika sudah tidak digunakan lagi.
                  Tindakan ini akan menghapus seluruh pekerjaan dan
                  rekap material di dalam proyek.
                </p>
              </div>
            </div>

            <button
              className="project-detail-delete-project"
              type="button"
              onClick={() => setShowDeleteProject(true)}
            >
              <Trash2 size={17} />
              Hapus Proyek
            </button>
          </section>

          {showDeleteProject && (
            <div
              className="project-delete-modal-backdrop"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  setShowDeleteProject(false)
                }
              }}
            >
              <div
                className="project-delete-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-project-title"
              >
                <span className="project-delete-modal-icon">
                  <AlertTriangle size={24} />
                </span>

                <div className="project-delete-modal-copy">
                  <h2 id="delete-project-title">
                    Hapus proyek ini?
                  </h2>

                  <p>
                    Proyek <strong>{project.name}</strong> beserta
                    seluruh pekerjaan dan rekap materialnya akan
                    dihapus dari akun Anda.
                  </p>
                </div>

                <div className="project-delete-modal-actions">
                  <button
                    className="button button-secondary"
                    type="button"
                    onClick={() => setShowDeleteProject(false)}
                  >
                    Batal
                  </button>

                  <button
                    className="project-detail-delete-project confirm"
                    type="button"
                    onClick={handleDeleteProject}
                  >
                    <Trash2 size={17} />
                    Ya, Hapus Proyek
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default ProjectDetail
