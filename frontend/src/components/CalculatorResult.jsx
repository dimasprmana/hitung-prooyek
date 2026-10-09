import { Folder, RotateCcw, Save } from 'lucide-react'
import areaIcon from '../assets/calculator-icons/result-area.webp'
import brickIcon from '../assets/calculator-icons/result-brick.webp'
import cementIcon from '../assets/calculator-icons/result-cement.webp'
import costIcon from '../assets/calculator-icons/result-cost.webp'
import materialIcon from '../assets/calculator-icons/result-material.webp'
import priceIcon from '../assets/calculator-icons/result-price.webp'
import sandIcon from '../assets/calculator-icons/result-sand.webp'
import summaryIcon from '../assets/calculator-icons/result-summary.webp'
import { formatRupiah } from '../utils/currency'

const resultIcons = {
  'bata-merah': brickIcon,
  semen: cementIcon,
  pasir: sandIcon,
}

function formatQuantity(value) {
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 2,
  }).format(value)
}

function CalculatorResult({ result, onReset, onSaveHistory, onSaveProject }) {
  const measureLabel = result?.volume ? 'Volume' : result?.weight ? 'Berat' : 'Luas Bersih'
  const measureUnit = result?.volume ? 'm3' : result?.weight ? 'kg' : 'm2'
  const measureValue = Number(result?.volume || result?.weight || result?.cleanArea || result?.area || 0)

  return (
    <aside className="panel result-panel estimate-card">
      <div className="estimate-header">
        <img src={summaryIcon} alt="" loading="lazy" decoding="async" />
        <div>
          <h2>Hasil Estimasi</h2>
          <p>Berikut adalah hasil perhitungan kebutuhan material {result?.label?.toLowerCase() || 'pekerjaan'}.</p>
        </div>
      </div>
      {result ? (
        <>
          <div className="estimate-overview">
            <div className="estimate-overview-card">
              <img src={areaIcon} alt="" loading="lazy" decoding="async" />
              <div>
                <span>{measureLabel}</span>
                <strong>{formatQuantity(measureValue)} {measureUnit}</strong>
              </div>
            </div>
            <div className="estimate-overview-card total">
              <img src={costIcon} alt="" loading="lazy" decoding="async" />
              <div>
                <span>Total Estimasi Biaya</span>
                <strong>{formatRupiah(result.totalCost)}</strong>
              </div>
            </div>
          </div>

          <div className="estimate-material-section">
            <div className="estimate-section-title">
              <h3>Kebutuhan Material</h3>
              <p>Jumlah material sudah termasuk cadangan/waste sesuai input.</p>
            </div>
            {result.items.map((item) => (
              <article className="estimate-material-card" key={`${item.materialId || item.material}-${item.unit}`}>
                <div className="estimate-material-main">
                  <span className="estimate-row-icon">
                    <img
                      src={resultIcons[item.materialId] || materialIcon}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                  <div className="estimate-material-info">
                    <strong>{item.material || item.name}</strong>
                    <small>Material yang perlu disiapkan</small>
                  </div>
                </div>

                <div className="estimate-material-values">
                  <div>
                    <span>Jumlah</span>
                    <strong>{formatQuantity(item.quantity)} {item.unit}</strong>
                  </div>
                  <div>
                    <span>
                      <img src={priceIcon} alt="" loading="lazy" decoding="async" />
                      Harga Satuan
                    </span>
                    <strong>{formatRupiah(item.unitPrice || 0)}</strong>
                  </div>
                  <div className="subtotal">
                    <span>Subtotal</span>
                    <strong>{formatRupiah(item.total || item.totalCost || 0)}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="estimate-actions">
            <button className="button button-secondary" type="button" onClick={onSaveHistory}>
              <Save size={18} />
              Simpan Riwayat
            </button>
            <button className="button button-primary" type="button" onClick={onSaveProject}>
              <Folder size={18} />
              Simpan ke Proyek
            </button>
            <button className="button button-ghost" type="button" onClick={onReset}>
              <RotateCcw size={18} />
              Hitung Ulang
            </button>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <p>Hasil akan muncul setelah Anda menekan tombol Hitung Sekarang.</p>
        </div>
      )}
    </aside>
  )
}

export default CalculatorResult
