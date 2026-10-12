import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Search, PackageOpen, Loader2, AlertCircle } from 'lucide-react'
import { getMaterials } from '../services/materialApi'
import { formatRupiah } from '../utils/currency'

import '../styles/material.css'

const ITEMS_PER_PAGE = 10

function Materials() {
  const [query, setQuery] = useState('')
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    getMaterials()
      .then((response) => {
        setMaterials(response.data || [])
        setError('')
      })
      .catch((err) => setError(err.message || 'Material gagal dimuat.'))
      .finally(() => setLoading(false))
  }, [])

  const filteredMaterials = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim()
    if (!normalizedQuery) return materials

    return materials.filter((material) =>
      [material.name, material.category, material.unit].some((value) =>
        String(value || '').toLowerCase().includes(normalizedQuery)
      )
    )
  }, [materials, query])

  const totalPages = Math.max(1, Math.ceil(filteredMaterials.length / ITEMS_PER_PAGE))
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedMaterials = filteredMaterials.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  useEffect(() => setCurrentPage(1), [query])
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  return (
    <main className="material-page">
      <div className="container">
        {/* Header Section */}
        <header className="page-header">
          <div className="header-content">
            <span className="eyebrow">Referensi Harga</span>
            <h1>Daftar Material</h1>
            <p>Lihat referensi harga material untuk membantu memperkirakan kebutuhan biaya proyek.</p>
          </div>

          <div className="search-container">
            <Search className="search-icon" size={18} />
            <input
              type="search"
              className="search-input"
              placeholder="Cari nama, kategori, atau satuan..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </header>

        {/* Table Section */}
        <section className="table-section">
          <div className="table-responsive">
            <table className="material-table">
              <thead>
                <tr>
                  <th className="col-num">No</th>
                  <th>Nama Material</th>
                  <th>Kategori</th>
                  <th>Satuan</th>
                  <th className="col-price">Harga</th>
                </tr>
              </thead>
              <tbody>
                {/* State: Loading */}
                {loading && (
                  <tr>
                    <td colSpan="5">
                      <div className="empty-state">
                        <Loader2 className="spinner" size={28} />
                        <p>Memuat data material...</p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* State: Error */}
                {!loading && error && (
                  <tr>
                    <td colSpan="5">
                      <div className="empty-state error">
                        <AlertCircle size={28} />
                        <p>{error}</p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* State: Empty */}
                {!loading && !error && filteredMaterials.length === 0 && (
                  <tr>
                    <td colSpan="5">
                      <div className="empty-state">
                        <PackageOpen size={32} />
                        <p>Tidak ada material yang ditemukan.</p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Data Rows */}
                {!loading && !error && paginatedMaterials.map((material, index) => (
                  <tr key={material.id}>
                    <td className="col-num">{startIndex + index + 1}</td>
                    <td className="font-semibold text-navy">{material.name}</td>
                    <td>{material.category}</td>
                    <td><span className="badge-unit">{material.unit}</span></td>
                    <td className="col-price font-bold text-navy">
                      {formatRupiah(material.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pagination Section */}
        {!loading && !error && filteredMaterials.length > 0 && (
          <footer className="pagination-footer">
            <p className="pagination-info">
              Menampilkan <strong>{startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filteredMaterials.length)}</strong> dari <strong>{filteredMaterials.length}</strong> material
            </p>

            <nav className="pagination-controls">
              <button
                className="btn-page"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`btn-page ${currentPage === page ? 'active' : ''}`}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                className="btn-page"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <ChevronRight size={18} />
              </button>
            </nav>
          </footer>
        )}
      </div>
    </main>
  )
}

export default Materials