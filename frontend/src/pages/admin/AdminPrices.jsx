import { useEffect, useMemo, useState } from 'react'
import AdminPageHeader from '../../components/AdminPageHeader'
import {
  createAdminMaterialPrice,
  getAdminMaterialPrices,
  getAdminMaterials,
} from '../../services/adminApi'
import { formatRupiah } from '../../utils/currency'
import '../../styles/admin-prices.css'

function AdminPrices() {
  const [materials, setMaterials] = useState([])
  const [selectedMaterialId, setSelectedMaterialId] = useState('')
  const [prices, setPrices] = useState([])
  const [form, setForm] = useState({
    price: '',
    region: '',
    effectiveDate: new Date().toISOString().slice(0, 10),
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const selectedMaterial = useMemo(
    () =>
      materials.find(
        (material) =>
          String(material.id) === String(selectedMaterialId),
      ),
    [materials, selectedMaterialId],
  )

  useEffect(() => {
    getAdminMaterials()
      .then((response) => {
        const items = response.data || []
        setMaterials(items)
        setSelectedMaterialId(items[0]?.id || '')
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

  useEffect(() => {
    if (!selectedMaterialId) {
      return
    }

    getAdminMaterialPrices(selectedMaterialId)
      .then((response) => {
        setPrices(response.data || [])
        setError('')
      })
      .catch((requestError) => {
        setError(
          requestError.message ||
            'Harga material gagal dimuat.',
        )
      })
  }, [selectedMaterialId])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
    setMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!selectedMaterialId || !form.price) {
      setError('Pilih material dan isi harga.')
      return
    }

    try {
      await createAdminMaterialPrice(selectedMaterialId, {
        price: Number(form.price),
        region: form.region.trim(),
        effectiveDate: form.effectiveDate,
      })

      const response = await getAdminMaterialPrices(selectedMaterialId)
      setPrices(response.data || [])
      setForm((current) => ({
        ...current,
        price: '',
      }))
      setMessage('Harga material berhasil disimpan.')
      setError('')
    } catch (requestError) {
      setError(
        requestError.message ||
          'Harga material gagal disimpan.',
      )
    }
  }

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Material"
        title="Harga Material"
        description="Pantau harga terbaru dan riwayat perubahan harga."
      />

      <section className="admin-panel">
        {loading && <p>Memuat material...</p>}
        {error && <p role="alert">{error}</p>}
        {message && <p>{message}</p>}

        {!loading && (
          <>
            <form className="admin-form" onSubmit={handleSubmit}>
              <label>
                <span>Material</span>
                <select
                  className="admin-input"
                  value={selectedMaterialId}
                  onChange={(event) =>
                    setSelectedMaterialId(event.target.value)
                  }
                >
                  {materials.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Harga Baru</span>
                <input
                  className="admin-input"
                  type="number"
                  min="0"
                  step="1"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                />
              </label>

              <label>
                <span>Wilayah</span>
                <input
                  className="admin-input"
                  name="region"
                  value={form.region}
                  onChange={handleChange}
                  placeholder="Contoh: Jakarta"
                />
              </label>

              <label>
                <span>Tanggal Berlaku</span>
                <input
                  className="admin-input"
                  type="date"
                  name="effectiveDate"
                  value={form.effectiveDate}
                  onChange={handleChange}
                />
              </label>

              <button className="admin-button primary" type="submit">
                + Tambah Harga
              </button>
            </form>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Harga</th>
                    <th>Wilayah</th>
                    <th>Tanggal Berlaku</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.length === 0 ? (
                    <tr>
                      <td colSpan="4">Belum ada riwayat harga.</td>
                    </tr>
                  ) : (
                    prices.map((item) => (
                      <tr key={item.id}>
                        <td><strong>{selectedMaterial?.name || '-'}</strong></td>
                        <td>{formatRupiah(item.price)}</td>
                        <td>{item.region || '-'}</td>
                        <td>{item.effectiveDate || item.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

export default AdminPrices
