import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowRight,
  Clock3,
  Plus,
} from 'lucide-react'

import { formatRupiah } from '../utils/currency'
import { getProjects as getApiProjects } from '../services/projectApi'
import { getCalculationHistory } from '../services/historyApi'

import proyekIllustration from '../assets/images/proyek-illustration.webp'

import '../styles/projects.css'

const HISTORY_LIMIT = 5

const calculatorIcons = import.meta.glob(
  '../assets/calculator-icon/*',
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
)

function normalizeName(value = '') {
  return value
    .toLowerCase()
    .replace(
      /\.(svg|png|webp|jpg|jpeg)$/i,
      '',
    )
    .replace(/[^a-z0-9]/g, '')
}

function getCalculatorIcon(type, name) {
  const typeKey = normalizeName(type)
  const nameKey = normalizeName(name)

  const entry = Object.entries(calculatorIcons).find(
    ([path]) => {
      const fileName = path.split('/').pop()
      const fileKey = normalizeName(fileName)

      return (
        fileKey.includes(typeKey) ||
        typeKey.includes(fileKey) ||
        (nameKey && fileKey.includes(nameKey)) ||
        (nameKey && nameKey.includes(fileKey))
      )
    },
  )

  return entry?.[1] || null
}

function formatHistoryDate(value) {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function Projects() {
  const [projects, setProjects] = useState([])
  const [quickHistory, setQuickHistory] = useState([])

  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(true)

  const [error, setError] = useState('')
  const [historyError, setHistoryError] = useState('')

  useEffect(() => {
    Promise.all([
      getApiProjects(),
      getCalculationHistory(),
    ])
      .then(([projectResponse, historyResponse]) => {
        setProjects(projectResponse.data || [])

        setQuickHistory(
          (historyResponse.data || []).slice(
            0,
            HISTORY_LIMIT,
          ),
        )

        setError('')
        setHistoryError('')
      })
      .catch((requestError) => {
        setError(
          requestError.message ||
            'Data proyek gagal dimuat.',
        )
      })
      .finally(() => {
        setLoading(false)
        setHistoryLoading(false)
      })
  }, [])

  return (
    <main className="page proyek-page">
      {/* =========================================
          HERO
      ========================================== */}
      <section className="proyek-hero-section">
        <div className="container proyek-hero">
          <div className="proyek-hero-copy">
            <span className="eyebrow">
              Workspace
            </span>

            <h1>
              Kelola proyek dan perhitungan Anda
            </h1>

            <p>
              Simpan proyek, kelola pekerjaan,
              dan lihat kembali hasil Hitung Cepat
              yang pernah Anda lakukan.
            </p>

            <div className="proyek-hero-actions">
              <Link
                className="button button-primary"
                to="/proyek/buat"
              >
                <Plus size={18} />
                Buat Proyek
              </Link>
            </div>
          </div>

          <div className="proyek-hero-visual">
            <div className="proyek-hero-glow" />

            <img
              src={proyekIllustration}
              alt="Ilustrasi proyek HitungProyek"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      </section>

      <section className="section proyek-content-section">
        <div className="container">

          {/* =========================================
              ERROR PROYEK
          ========================================== */}
          {error && (
            <div
              className="empty-state"
              role="alert"
            >
              <p>{error}</p>
            </div>
          )}

          {/* =========================================
              PROYEK SAYA
          ========================================== */}
          <div className="proyek-list-section">
            <div className="proyek-list-header">
              <div>
                <span className="eyebrow">
                  Workspace
                </span>

                <h2>Proyek Saya</h2>

                <p>
                  Semua proyek yang Anda simpan
                  dan kerjakan.
                </p>
              </div>

              {!loading && (
                <span className="proyek-count">
                  {projects.length} proyek
                </span>
              )}
            </div>

            {loading ? (
              <div className="project-empty">
                <p>Memuat proyek...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="project-empty">
                <h3>Belum ada proyek</h3>

                <p>
                  Buat proyek pertama Anda untuk
                  mulai menyimpan pekerjaan.
                </p>

                <Link
                  className="button button-primary"
                  to="/proyek/buat"
                >
                  <Plus size={18} />
                  Buat Proyek
                </Link>
              </div>
            ) : (
              <div className="project-grid">
                {projects.map((project) => (
                  <Link
                    className="project-card"
                    key={project.id}
                    to={`/proyek/${project.id}`}
                  >
                    <div className="project-card-top">
                      <div>
                        <span className="status-badge">
                          Proyek
                        </span>

                        <h3>
                          {project.name}
                        </h3>
                      </div>

                      <ArrowRight size={18} />
                    </div>

                    {project.description && (
                      <p className="project-description">
                        {project.description}
                      </p>
                    )}

                    <div className="project-meta">
                      <span>
                        {project.workCount ??
                          project.works?.length ??
                          0}{' '}
                        pekerjaan
                      </span>

                      <strong>
                        {formatRupiah(
                          project.totalCost || 0,
                        )}
                      </strong>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* =========================================
              RIWAYAT HITUNG CEPAT
          ========================================== */}
          <section className="quick-history-section">
            <div className="quick-history-header">
              <div>
                <span className="eyebrow">
                  Hitung Cepat
                </span>

                <h2>
                  Riwayat Hitung Cepat
                </h2>

                <p>
                  Perhitungan yang dilakukan
                  tanpa membuat proyek.
                </p>
              </div>

              {!historyLoading &&
                quickHistory.length > 0 && (
                  <Link
                    className="quick-history-see-all"
                    to="/profil/riwayat"
                  >
                    Lihat Semua
                    <ArrowRight size={16} />
                  </Link>
                )}
            </div>

            {historyError && (
              <div
                className="quick-history-empty"
                role="alert"
              >
                <p>{historyError}</p>
              </div>
            )}

            {historyLoading ? (
              <div className="quick-history-empty">
                <p>
                  Memuat riwayat perhitungan...
                </p>
              </div>
            ) : !historyError &&
              quickHistory.length === 0 ? (
              <div className="quick-history-empty">
                <div className="quick-history-empty-icon">
                  <Clock3 size={22} />
                </div>

                <div>
                  <h3>
                    Belum ada riwayat
                  </h3>

                  <p>
                    Hasil Hitung Cepat yang Anda
                    simpan akan muncul di sini.
                  </p>
                </div>

                <Link
                  className="button button-secondary"
                  to="/hitung"
                >
                  Mulai Hitung
                </Link>
              </div>
            ) : (
              <div className="quick-history-list">
                {quickHistory.map((item) => {
                  const icon = getCalculatorIcon(
                    item.calculatorType,
                    item.calculatorName ||
                      item.title,
                  )

                  return (
                    <Link
                      className="quick-history-item"
                      key={item.id}
                      to={`/riwayat/${item.id}`}
                    >
                      <div className="quick-history-item-icon">
                        {icon ? (
                          <img
                            src={icon}
                            alt=""
                          />
                        ) : (
                          <Clock3 size={20} />
                        )}
                      </div>

                      <div className="quick-history-item-content">
                        <div className="quick-history-item-info">
                          <span className="quick-history-dot" />

                          <span>
                            {item.calculatorName ||
                              item.calculatorType ||
                              'Perhitungan'}
                          </span>

                          <span>
                            •
                          </span>

                          <span>
                            {formatHistoryDate(
                              item.createdAt ||
                                item.created_at,
                            )}
                          </span>
                        </div>

                        <h3>
                          {item.title ||
                            item.calculatorName ||
                            'Perhitungan'}
                        </h3>

                        <p>
                          {item.resultData?.area
                            ? `${Number(
                                item.resultData.area,
                              ).toFixed(2)} m²`
                            : 'Hasil perhitungan tersimpan'}
                        </p>
                      </div>

                      <div className="quick-history-item-cost">
                        <strong>
                          {formatRupiah(
                            item.totalCost ||
                              item.total_cost ||
                              0,
                          )}
                        </strong>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  )
}

export default Projects