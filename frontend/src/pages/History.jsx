import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import SaveToProjectModal from '../components/SaveToProjectModal'
import { makeWorkFromCalculation } from '../utils/calculationWork'
import { deleteCalculationHistory, getCalculationHistory } from '../services/historyApi'
import { addProjectWork } from '../services/projectApi'
import { calculators } from '../data/calculators'
import { formatRupiah } from '../utils/currency'

function History() {
  const [history, setHistory] = useState([])
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getCalculationHistory()
      .then((response) => setHistory(response.data || []))
      .catch((requestError) => {
        setError(
          requestError.message ||
            'Riwayat gagal dimuat.',
        )
      })
      .finally(() => setLoading(false))
  }, [])

  async function remove(id) {
    try {
      await deleteCalculationHistory(id)
      setHistory((current) =>
        current.filter((item) => item.id !== id),
      )
    } catch (requestError) {
      setError(
        requestError.message ||
          'Riwayat gagal dihapus.',
      )
    }
  }

  async function saveEntryToProject(projectId) {
    const calculator = calculators.find((item) => item.id === selectedEntry.calculatorType)
    const work = makeWorkFromCalculation(
      selectedEntry.calculatorType,
      selectedEntry.title || calculator?.name || 'Perhitungan',
      selectedEntry.inputData,
      selectedEntry.resultData,
    )

    try {
      const response = await addProjectWork(projectId, work)
      return response.data
    } catch (requestError) {
      setError(
        requestError.message ||
          'Riwayat gagal disimpan ke proyek.',
      )
      return null
    }
  }

  return (
    <section className="section page">
      <div className="container">
        <div className="page-title">
          <span className="eyebrow">Profil</span>
          <h1>Riwayat Perhitungan</h1>
          <p>Gunakan ulang input lama atau simpan hasilnya ke proyek.</p>
        </div>

        {error && <p role="alert">{error}</p>}
        {loading && <p>Memuat riwayat...</p>}

        {!loading && !error && <div className="history-grid">
          {history.map((entry) => {
            const calculator = calculators.find((item) => item.id === entry.calculatorType)
            return (
              <article className="project-card" key={entry.id}>
                <div>
                  <span className="status-badge">{calculator?.name || entry.calculatorType}</span>
                  <h2>{entry.title}</h2>
                  <p>{new Date(entry.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
                <div className="project-meta">
                  <span>{entry.resultData?.area ? `${Number(entry.resultData.area).toFixed(2)} m2` : 'Hasil tersimpan'}</span>
                  <strong>{formatRupiah(entry.totalCost)}</strong>
                </div>
                <div className="button-row">
                  <Link className="button button-secondary" to={`/hitung/${entry.calculatorType}?history=${entry.id}`}>Lihat</Link>
                  <Link className="button button-secondary" to={`/hitung/${entry.calculatorType}?history=${entry.id}`}>Gunakan Lagi</Link>
                  <button className="button button-primary" type="button" onClick={() => setSelectedEntry(entry)}>Simpan ke Proyek</button>
                  <button className="button button-secondary" type="button" onClick={() => remove(entry.id)}>Hapus</button>
                </div>
              </article>
            )
          })}
          {history.length === 0 && (
            <div className="empty-state">
              <p>Belum ada riwayat perhitungan.</p>
              <Link className="button button-primary" to="/hitung">Mulai Menghitung</Link>
            </div>
          )}
        </div>}
      </div>

      <SaveToProjectModal
        open={Boolean(selectedEntry)}
        onClose={() => setSelectedEntry(null)}
        onSave={saveEntryToProject}
      />
    </section>
  )
}

export default History
