import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import {
  CheckCircle2,
  X,
  AlertTriangle,
} from 'lucide-react'

import AdminPageHeader from '../../components/AdminPageHeader'
import {
  deleteAdminMaterial,
  getAdminMaterials,
} from '../../services/adminApi'
import { formatRupiah } from '../../utils/currency'
import '../../styles/admin-materials.css'

function AdminMaterials() {
  const location = useLocation()

  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [message, setMessage] = useState(
    location.state?.message || '',
  )

  // Material yang akan dihapus
  const [deleteMaterial, setDeleteMaterial] =
    useState(null)

  const [deleting, setDeleting] = useState(false)

  function loadMaterials() {
    setLoading(true)

    getAdminMaterials()
      .then((response) => {
        setMaterials(response.data || [])
        setError('')
      })
      .catch((requestError) => {
        setError(
          requestError.message ||
            'Material gagal dimuat.',
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    Promise.resolve().then(loadMaterials)
  }, [])

  // Toast otomatis hilang setelah 3 detik
  useEffect(() => {
    if (!message) {
      return
    }

    const timer = setTimeout(() => {
      setMessage('')
    }, 3000)

    return () => clearTimeout(timer)
  }, [message])

  // Hapus state message dari URL history
  useEffect(() => {
    if (location.state?.message) {
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname,
      )
    }
  }, [location.state])

  // Buka modal konfirmasi
  function handleDeleteClick(material) {
    setError('')
    setDeleteMaterial(material)
  }

  // Tutup modal
  function handleCloseDeleteModal() {
    if (deleting) {
      return
    }

    setDeleteMaterial(null)
  }

  // Konfirmasi hapus
  async function handleConfirmDelete() {
    if (!deleteMaterial) {
      return
    }

    try {
      setDeleting(true)
      setError('')

      await deleteAdminMaterial(deleteMaterial.id)

      setMaterials((current) =>
        current.filter(
          (material) =>
            material.id !== deleteMaterial.id,
        ),
      )

      setDeleteMaterial(null)
      setMessage('Material berhasil dihapus.')
    } catch (requestError) {
      setError(
        requestError.message ||
          'Material gagal dihapus.',
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="admin-page">
      {/* =========================
          TOAST NOTIFICATION
      ========================== */}
      {message && (
        <div className="admin-toast success">
          <CheckCircle2 size={20} />

          <span>{message}</span>

          <button
            type="button"
            onClick={() => setMessage('')}
            aria-label="Tutup notifikasi"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* =========================
          DELETE MODAL
      ========================== */}
      {deleteMaterial && (
        <div
          className="admin-modal-overlay"
          onMouseDown={handleCloseDeleteModal}
        >
          <div
            className="admin-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-material-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="admin-delete-icon">
              <AlertTriangle size={22} />
            </div>

            <div className="admin-delete-content">
              <h2 id="delete-material-title">
                Hapus Material
              </h2>

              <p>
                Apakah Anda yakin ingin menghapus
                material berikut?
              </p>

              <strong>
                "{deleteMaterial.name}"
              </strong>
            </div>

            <div className="admin-delete-actions">
              <button
                className="admin-button secondary"
                type="button"
                onClick={handleCloseDeleteModal}
                disabled={deleting}
              >
                Batal
              </button>

              <button
                className="admin-button danger"
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting
                  ? 'Menghapus...'
                  : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminPageHeader
        eyebrow="Master Data"
        title="Material"
        description="Kelola daftar material yang digunakan HitungProyek."
        action={
          <Link
            className="admin-button primary"
            to="/admin/materials/create"
          >
            + Tambah Material
          </Link>
        }
      />

      <section className="admin-panel">
        {loading && (
          <p>Memuat material...</p>
        )}

        {error && (
          <p role="alert">{error}</p>
        )}

        {!loading && !error && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Kategori</th>
                  <th>Unit</th>
                  <th>Harga Saat Ini</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {materials.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      Belum ada material.
                    </td>
                  </tr>
                ) : (
                  materials.map((material) => (
                    <tr key={material.id}>
                      <td>
                        <strong>
                          {material.name}
                        </strong>
                      </td>

                      <td>
                        {material.category}
                      </td>

                      <td>
                        {material.unit}
                      </td>

                      <td>
                        {formatRupiah(
                          material.price,
                        )}
                      </td>

                      <td>
                        <span
                          className={`admin-status ${
                            material.status ===
                            'Aktif'
                              ? 'active'
                              : 'inactive'
                          }`}
                        >
                          {material.status}
                        </span>
                      </td>

                      <td className="admin-table-action">
                        <Link
                          className="admin-link-button"
                          to={`/admin/materials/${material.id}/edit`}
                        >
                          Edit
                        </Link>

                        <button
                          className="admin-link-button danger-link"
                          type="button"
                          onClick={() =>
                            handleDeleteClick(
                              material,
                            )
                          }
                        >
                          Hapus
                        </button>
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

export default AdminMaterials