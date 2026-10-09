import { useEffect, useState } from 'react'
import AdminPageHeader from '../../components/AdminPageHeader'
import { getAdminCalculations } from '../../services/adminApi'
import { formatRupiah } from '../../utils/currency'
import '../../styles/admin-calculations.css'

function AdminCalculations() {
  const [calculations, setCalculations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAdminCalculations()
      .then((response) => {
        setCalculations(response.data || [])
        setError('')
      })
      .catch((requestError) => {
        setError(
          requestError.message ||
            'Riwayat perhitungan gagal dimuat.',
        )
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Monitoring"
        title="Hitung Cepat"
        description="Riwayat penggunaan kalkulator oleh user."
      />

      <section className="admin-panel">
        {loading && <p>Memuat riwayat perhitungan...</p>}
        {error && <p role="alert">{error}</p>}

        {!loading && !error && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Kalkulator</th>
                  <th>Kategori</th>
                  <th>Total</th>
                  <th>Tanggal</th>
                </tr>
              </thead>

              <tbody>
                {calculations.length === 0 ? (
                  <tr>
                    <td colSpan="5">Belum ada perhitungan.</td>
                  </tr>
                ) : (
                  calculations.map((item) => (
                    <tr key={item.id}>
                      <td><strong>{item.user || '-'}</strong></td>
                      <td>{item.calculatorName}</td>
                      <td>{item.category}</td>
                      <td>{formatRupiah(item.totalCost || 0)}</td>
                      <td>{item.createdAt}</td>
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

export default AdminCalculations
