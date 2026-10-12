
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { CheckCircle2,X,AlertTriangle,Upload,Trash2,Search,} from 'lucide-react'
import AdminPageHeader from '../../components/AdminPageHeader'
import AdminMaterialImportModal from '../../components/AdminMaterialImportModal'
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

  // Pencarian material
  const [searchTerm, setSearchTerm] = useState('')

  // Hapus satu material
  const [deleteMaterial, setDeleteMaterial] =
    useState(null)
  const [deleting, setDeleting] = useState(false)

  // Hapus semua material
  const [showDeleteAllModal, setShowDeleteAllModal] =
    useState(false)
  const [deletingAll, setDeletingAll] = useState(false)

  // Import material
  const [showImportModal, setShowImportModal] =
    useState(false)

  // =========================
  // MEMUAT MATERIAL
  // =========================

  async function loadMaterials() {
    setLoading(true)

    try {
      const response = await getAdminMaterials()

      setMaterials(
        Array.isArray(response.data)
          ? response.data
          : [],
      )

      setError('')
    } catch (requestError) {
      setError(
        requestError.message ||
          'Material gagal dimuat.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    Promise.resolve().then(loadMaterials)
  }, [])

  // =========================
  // NOTIFIKASI
  // =========================

  useEffect(() => {
    if (!message) return

    const timer = setTimeout(() => {
      setMessage('')
    }, 3000)

    return () => clearTimeout(timer)
  }, [message])

  useEffect(() => {
    if (location.state?.message) {
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname,
      )
    }
  }, [location.state])

  // =========================
  // FILTER PENCARIAN
  // =========================

  const query = searchTerm.trim().toLowerCase()

  const filteredMaterials = materials.filter(
    (material) => {
      if (!query) return true

      return [
        material.name,
        material.category,
        material.unit,
        material.status,
      ].some((value) =>
        String(value ?? '')
          .toLowerCase()
          .includes(query),
      )
    },
  )

  // =========================
  // HAPUS SATU MATERIAL
  // =========================

  function handleDeleteClick(material) {
    setError('')
    setDeleteMaterial(material)
  }

  function handleCloseDeleteModal() {
    if (deleting) return

    setDeleteMaterial(null)
  }

  async function handleConfirmDelete() {
    if (!deleteMaterial || deleting) return

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

  // =========================
  // HAPUS SEMUA MATERIAL
  // =========================

  function handleDeleteAllClick() {
    if (
      loading ||
      deletingAll ||
      materials.length === 0
    ) {
      return
    }

    setError('')
    setShowDeleteAllModal(true)
  }

  function handleCloseDeleteAllModal() {
    if (deletingAll) return

    setShowDeleteAllModal(false)
  }

  async function handleConfirmDeleteAll() {
    if (
      deletingAll ||
      materials.length === 0
    ) {
      return
    }

    const targets = [...materials]
    let deletedCount = 0

    try {
      setDeletingAll(true)
      setError('')

      // Menghapus material satu per satu
      // melalui fungsi API yang sudah tersedia.
      for (const material of targets) {
        await deleteAdminMaterial(material.id)
        deletedCount += 1
      }

      setMaterials([])
      setSearchTerm('')
      setShowDeleteAllModal(false)

      setMessage(
        `Berhasil menghapus ${deletedCount} material.`,
      )
    } catch (requestError) {
      setShowDeleteAllModal(false)

      // Muat ulang data jika sebagian penghapusan gagal.
      await loadMaterials()

      setError(
        `Penghapusan berhenti setelah ${deletedCount} dari ${targets.length} material. ${
          requestError.message ||
          'Silakan periksa koneksi atau backend.'
        }`,
      )
    } finally {
      setDeletingAll(false)
    }
  }

  // =========================
  // RENDER HALAMAN
  // =========================

  return (
    <div className="admin-page">
      {/* NOTIFIKASI BERHASIL */}
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

      {/* MODAL HAPUS SATU MATERIAL */}
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
                {deleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HAPUS SEMUA MATERIAL */}
      {showDeleteAllModal && (
        <div
          className="admin-modal-overlay"
          onMouseDown={handleCloseDeleteAllModal}
        >
          <div
            className="admin-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-all-material-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="admin-delete-icon">
              <AlertTriangle size={24} />
            </div>

            <div className="admin-delete-content">
              <h2 id="delete-all-material-title">
                Hapus Semua Material?
              </h2>

              <p>
                Anda akan menghapus seluruh{' '}
                <strong>
                  {materials.length} material
                </strong>{' '}
                yang sudah dimuat dari server.
              </p>

              <p>
                Tindakan ini tidak dapat dibatalkan.
                Pastikan Anda sudah yakin sebelum
                melanjutkan.
              </p>
            </div>

            <div className="admin-delete-actions">
              <button
                className="admin-button secondary"
                type="button"
                onClick={handleCloseDeleteAllModal}
                disabled={deletingAll}
              >
                Batal
              </button>

              <button
                className="admin-button danger"
                type="button"
                onClick={handleConfirmDeleteAll}
                disabled={deletingAll}
              >
                <Trash2 size={15} />

                {deletingAll
                  ? 'Menghapus...'
                  : `Hapus Semua (${materials.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IMPORT EXCEL */}
      {showImportModal && (
        <AdminMaterialImportModal
          onClose={() => setShowImportModal(false)}
          onImported={() => {
            setShowImportModal(false)
            setMessage('Import material selesai.')
            loadMaterials()
          }}
        />
      )}

      {/* HEADER */}
      <AdminPageHeader
        eyebrow="Master Data"
        title="Material"
        description="Kelola daftar material yang digunakan HitungProyek."
        action={
          <div className="admin-material-toolbar">
            <button
              type="button"
              className="admin-button secondary"
              onClick={() => setShowImportModal(true)}
            >
              <Upload size={15} />
              Import Excel
            </button>

            <button
              type="button"
              className="admin-button danger"
              onClick={handleDeleteAllClick}
              disabled={
                loading ||
                materials.length === 0 ||
                deletingAll
              }
            >
              <Trash2 size={15} />
              Hapus Semua ({materials.length})
            </button>

            <Link
              className="admin-button primary"
              to="/admin/materials/create"
            >
              + Tambah Material
            </Link>
          </div>
        }
      />

      {/* TABEL DAN PENCARIAN */}
      <section className="admin-panel">
        {/* INPUT PENCARIAN */}
        <div className="admin-material-search">
          <div className="admin-material-search-input">
            <Search size={19} />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Cari nama, kategori, unit, atau status..."
              aria-label="Cari material"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Hapus pencarian"
                title="Hapus pencarian"
              >
                <X size={17} />
              </button>
            )}
          </div>

          {!loading && !error && (
            <span className="admin-material-search-count">
              Menampilkan {filteredMaterials.length} dari{' '}
              {materials.length} material
            </span>
          )}
        </div>

        {/* PESAN ERROR */}
        {error && (
          <div
            role="alert"
            className="admin-material-error"
          >
            {error}
          </div>
        )}

        {/* STATUS LOADING */}
        {loading ? (
          <p>Memuat material...</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Kategori</th>
                  <th>Unit</th>
                  <th>Harga Saat Ini</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {materials.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="admin-material-empty"
                    >
                      {error
                        ? 'Data material belum dapat dimuat.'
                        : 'Belum ada material.'}
                    </td>
                  </tr>
                ) : filteredMaterials.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="admin-material-empty"
                    >
                      Material "{searchTerm}" tidak ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredMaterials.map((material) => (
                    <tr key={material.id}>
                      <td>
                        <strong>{material.name}</strong>
                      </td>

                      <td>{material.category}</td>

                      <td>{material.unit}</td>

                      <td>
                        {formatRupiah(material.price)}
                      </td>

                      <td>
                        <span
                          className={`admin-status ${
                            material.status === 'Aktif'
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
                            handleDeleteClick(material)
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
