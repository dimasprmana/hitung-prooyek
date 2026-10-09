import { useEffect, useState } from 'react'
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router'

import {
  ArrowLeft,
  Calculator,
  Trash2,
} from 'lucide-react'

import {
  deleteCalculationHistory,
  getCalculationHistoryById,
} from '../services/historyApi'

import { formatRupiah } from '../utils/currency'

import '../styles/history-detail.css'

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

function formatDate(value) {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function formatLabel(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[\_-]/g, ' ')
    .replace(/^./, (char) =>
      char.toUpperCase(),
    )
}

function formatValue(value) {
  if (value === null || value === undefined) {
    return '-'
  }

  if (typeof value === 'boolean') {
    return value ? 'Ya' : 'Tidak'
  }

  if (typeof value === 'number') {
    return value.toLocaleString('id-ID')
  }

  if (typeof value === 'object') {
    return '-'
  }

  return String(value)
}

function HistoryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [history, setHistory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let active = true

    getCalculationHistoryById(id)
      .then((response) => {
        if (!active) return

        setHistory(response.data)
        setError('')
      })
      .catch((requestError) => {
        if (!active) return

        setError(
          requestError.message ||
            'Riwayat tidak dapat dimuat.',
        )
      })
      .finally(() => {
        if (!active) return

        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id])

  async function handleDelete() {
    const confirmed = window.confirm(
      'Apakah Anda yakin ingin menghapus riwayat ini?',
    )

    if (!confirmed) return

    setDeleting(true)
    setError('')

    try {
      await deleteCalculationHistory(id)

      navigate('/proyek', {
        replace: true,
      })
    } catch (requestError) {
      setError(
        requestError.message ||
          'Riwayat gagal dihapus.',
      )

      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <main className="page history-detail-page">
        <div className="container">
          <div className="history-detail-loading">
            Memuat detail riwayat...
          </div>
        </div>
      </main>
    )
  }

  if (error || !history) {
    return (
      <main className="page history-detail-page">
        <div className="container">
          <Link
            className="history-back-link"
            to="/proyek"
          >
            <ArrowLeft size={18} />
            Kembali ke Proyek
          </Link>

          <div className="history-detail-error">
            <h2>
              Riwayat tidak ditemukan
            </h2>

            <p>
              {error ||
                'Data riwayat yang Anda cari tidak tersedia.'}
            </p>
          </div>
        </div>
      </main>
    )
  }

  const calculatorType =
    history.calculatorType ||
    history.calculator_type ||
    'dinding'

  const calculatorName =
    history.calculatorName ||
    history.calculator_name ||
    history.title ||
    'Perhitungan'

  const title =
    history.title ||
    calculatorName

  const inputData =
    history.inputData ||
    history.input_data ||
    {}

  const resultData =
    history.resultData ||
    history.result_data ||
    {}

  const totalCost =
    history.totalCost ??
    history.total_cost ??
    resultData.totalCost ??
    resultData.total_cost ??
    0

  const createdAt =
    history.createdAt ||
    history.created_at ||
    history.created

  const icon = getCalculatorIcon(
    calculatorType,
    calculatorName,
  )

  const resultEntries = Object.entries(
    resultData,
  ).filter(
    ([key]) =>
      key !== 'totalCost' &&
      key !== 'total_cost',
  )

  return (
    <main className="page history-detail-page">
      <div className="container">
        {/* =========================================
            BACK
        ========================================== */}
        <Link
          className="history-back-link"
          to="/proyek"
        >
          <ArrowLeft size={18} />
          Kembali ke Proyek
        </Link>

        {/* =========================================
            HEADER
        ========================================== */}
        <div className="history-detail-header">
          <div className="history-detail-title-wrap">
            <div className="history-detail-icon">
              {icon ? (
                <img
                  src={icon}
                  alt=""
                />
              ) : (
                <Calculator size={28} />
              )}
            </div>

            <div>
              <span className="eyebrow">
                Riwayat Hitung Cepat
              </span>

              <h1>{title}</h1>

              <p>
                {calculatorName}

                <span> • </span>

                {formatDate(createdAt)}
              </p>
            </div>
          </div>

          <div className="history-detail-actions">
            <Link
              className="button button-primary"
              to={`/hitung/${calculatorType}?history=${history.id}`}
            >
              <Calculator size={18} />
              Gunakan Kembali
            </Link>

            <button
              className="button button-danger"
              type="button"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 size={18} />

              {deleting
                ? 'Menghapus...'
                : 'Hapus'}
            </button>
          </div>
        </div>

        {/* =========================================
            DETAIL
        ========================================== */}
        <div className="history-detail-grid">
          {/* PARAMETER */}
          <section className="history-detail-card">
            <div className="history-detail-card-header">
              <div>
                <span className="eyebrow">
                  Parameter
                </span>

                <h2>
                  Data Perhitungan
                </h2>
              </div>
            </div>

            <div className="history-input-list">
              {Object.entries(inputData)
                .length === 0 ? (
                <p className="history-no-data">
                  Tidak ada data input.
                </p>
              ) : (
                Object.entries(inputData).map(
                  ([key, value]) => (
                    <div
                      className="history-input-row"
                      key={key}
                    >
                      <span>
                        {formatLabel(key)}
                      </span>

                      <strong>
                        {formatValue(value)}
                      </strong>
                    </div>
                  ),
                )
              )}
            </div>
          </section>

          {/* HASIL */}
          <section className="history-detail-card">
            <div className="history-detail-card-header">
              <div>
                <span className="eyebrow">
                  Hasil
                </span>

                <h2>
                  Hasil Perhitungan
                </h2>
              </div>
            </div>

            <div className="history-result-list">
              {resultEntries.length === 0 ? (
                <p className="history-no-data">
                  Tidak ada detail hasil.
                </p>
              ) : (
                resultEntries.map(
                  ([key, value]) => (
                    <div
                      className="history-result-row"
                      key={key}
                    >
                      <span>
                        {formatLabel(key)}
                      </span>

                      <strong>
                        {typeof value ===
                        'number'
                          ? value.toLocaleString(
                              'id-ID',
                            )
                          : formatValue(
                              value,
                            )}
                      </strong>
                    </div>
                  ),
                )
              )}
            </div>

            <div className="history-total">
              <span>
                Total Estimasi Biaya
              </span>

              <strong>
                {formatRupiah(totalCost)}
              </strong>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export default HistoryDetail