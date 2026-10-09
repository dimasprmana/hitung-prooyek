import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft,ChevronRight,Search,} from 'lucide-react'
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
      .catch((requestError) => {
        setError(
          requestError.message ||
            'Material gagal dimuat.',
        )
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredMaterials = useMemo(() => {
    const normalizedQuery = query
      .toLowerCase()
      .trim()

    if (!normalizedQuery) {
      return materials
    }

    return materials.filter((material) =>
      [
        material.name,
        material.category,
        material.unit,
      ].some((value) =>
        String(value || '')
          .toLowerCase()
          .includes(normalizedQuery),
      ),
    )
  }, [materials, query])

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredMaterials.length / ITEMS_PER_PAGE,
    ),
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [query])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const startIndex =
    (currentPage - 1) * ITEMS_PER_PAGE

  const endIndex = Math.min(
    startIndex + ITEMS_PER_PAGE,
    filteredMaterials.length,
  )

  const paginatedMaterials =
    filteredMaterials.slice(
      startIndex,
      endIndex,
    )

  function goToPage(page) {
    if (page < 1 || page > totalPages) {
      return
    }

    setCurrentPage(page)
  }

  return (
    <main className="page material-page">
      <section className="section">
        <div className="container">
          <div className="page-heading-row">
            <div className="page-title compact">
              <span className="eyebrow">
                Referensi Harga
              </span>

              <h1>Daftar Material</h1>

              <p>
                Lihat referensi harga material untuk membantu
                memperkirakan kebutuhan biaya proyek.
              </p>
            </div>

            <label className="search-field">
              <Search size={18} />

              <input
                type="search"
                placeholder="Cari material..."
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
              />
            </label>
          </div>

          <div className="panel table-wrap">
            <table className="material-table">
              <thead>
                <tr>
                  <th className="column-number">
                    No
                  </th>

                  <th>Nama Material</th>
                  <th>Kategori</th>
                  <th>Satuan</th>

                  <th className="column-price">
                    Harga
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan="5"
                      className="table-message"
                    >
                      Memuat material...
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td
                      colSpan="5"
                      className="table-message error"
                    >
                      {error}
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  filteredMaterials.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="table-message"
                      >
                        Belum ada material.
                      </td>
                    </tr>
                  )}

                {!loading &&
                  !error &&
                  paginatedMaterials.map(
                    (material, index) => (
                      <tr key={material.id}>
                        <td className="column-number">
                          {startIndex + index + 1}
                        </td>

                        <td>
                          <strong className="material-name">
                            {material.name}
                          </strong>
                        </td>

                        <td>
                          {material.category}
                        </td>

                        <td>
                          {material.unit}
                        </td>

                        <td className="material-price">
                          {formatRupiah(
                            material.price,
                          )}
                        </td>
                      </tr>
                    ),
                  )}
              </tbody>
            </table>
          </div>

          {!loading &&
            !error &&
            filteredMaterials.length > 0 && (
              <div className="material-pagination">
                <p className="pagination-info">
                  Menampilkan{' '}
                  <strong>
                    {startIndex + 1}–{endIndex}
                  </strong>{' '}
                  dari{' '}
                  <strong>
                    {filteredMaterials.length}
                  </strong>{' '}
                  material
                </p>

                <div className="pagination-buttons">
                  <button
                    type="button"
                    className="pagination-button arrow"
                    onClick={() =>
                      goToPage(currentPage - 1)
                    }
                    disabled={currentPage === 1}
                    aria-label="Halaman sebelumnya"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => {
                      const page = index + 1

                      return (
                        <button
                          key={page}
                          type="button"
                          className={`pagination-button ${
                            currentPage === page
                              ? 'active'
                              : ''
                          }`}
                          onClick={() =>
                            goToPage(page)
                          }
                        >
                          {page}
                        </button>
                      )
                    },
                  )}

                  <button
                    type="button"
                    className="pagination-button arrow"
                    onClick={() =>
                      goToPage(currentPage + 1)
                    }
                    disabled={
                      currentPage === totalPages
                    }
                    aria-label="Halaman berikutnya"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
        </div>
      </section>
    </main>
  )
}

export default Materials
