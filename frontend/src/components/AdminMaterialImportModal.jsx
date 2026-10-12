import { useRef, useState } from 'react'
import { X,Upload,Download,CheckCircle2,AlertTriangle,FileSpreadsheet,} from 'lucide-react'
import { confirmAdminMaterialImport,downloadMaterialTemplate,previewAdminMaterialImport,} from '../services/adminApi'
import { formatRupiah } from '../utils/currency'
import '../styles/admin-material-import.css'

// =========================================================
// STEP CONSTANTS
// =========================================================
const STEP_UPLOAD = 'upload'
const STEP_PREVIEW = 'preview'
const STEP_IMPORTING = 'importing'
const STEP_DONE = 'done'

function AdminMaterialImportModal({ onClose, onImported }) {
  const fileInputRef = useRef(null)

  const [step, setStep] = useState(STEP_UPLOAD)
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const [preview, setPreview] = useState(null) // { summary, rows }
  const [importResult, setImportResult] = useState(null) // { inserted, skipped, failed }

  const [downloadingTemplate, setDownloadingTemplate] = useState(false)

  // -------------------------------------------------------
  // Template Download
  // -------------------------------------------------------
  async function handleDownloadTemplate() {
    setDownloadingTemplate(true)
    try {
      const blob = await downloadMaterialTemplate()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'template_import_material.xlsx'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      // Non-critical – just silently fail so as not to block upload flow
    } finally {
      setDownloadingTemplate(false)
    }
  }

  // -------------------------------------------------------
  // File Selection & Validation (frontend side)
  // -------------------------------------------------------
  function validateAndSelectFile(file) {
    if (!file) return
    setUploadError('')

    const ext = file.name.split('.').pop().toLowerCase()
    if (ext !== 'xlsx') {
      setUploadError('Hanya file Excel (.xlsx) yang didukung.')
      return
    }

    const MAX_MB = 5
    if (file.size > MAX_MB * 1024 * 1024) {
      setUploadError(`Ukuran file melebihi batas maksimum ${MAX_MB} MB.`)
      return
    }

    if (file.size === 0) {
      setUploadError('File kosong tidak dapat diproses.')
      return
    }

    setSelectedFile(file)
  }

  function handleFileChange(event) {
    validateAndSelectFile(event.target.files?.[0] || null)
  }

  function handleDrop(event) {
    event.preventDefault()
    setDragOver(false)
    validateAndSelectFile(event.dataTransfer.files?.[0] || null)
  }

  function handleDragOver(event) {
    event.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave() {
    setDragOver(false)
  }

  // -------------------------------------------------------
  // Upload & Preview
  // -------------------------------------------------------
  async function handleUploadPreview() {
    if (!selectedFile) {
      setUploadError('Pilih file Excel terlebih dahulu.')
      return
    }

    setUploading(true)
    setUploadError('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await previewAdminMaterialImport(formData)
      const previewData = response?.data ?? response

      setPreview(previewData)
      setStep(STEP_PREVIEW)
    } catch (err) {
      setUploadError(err?.message || 'File tidak dapat diproses. Pastikan file valid.')
    } finally {
      setUploading(false)
    }
  }

  // -------------------------------------------------------
  // Confirm Import
  // -------------------------------------------------------
  async function handleConfirmImport() {
    if (!preview?.rows) return

    setStep(STEP_IMPORTING)

    try {
      const response = await confirmAdminMaterialImport(preview.rows)
      const result = response?.data ?? response
      setImportResult(result)
      setStep(STEP_DONE)
    } catch (err) {
      // Go back to preview with an error note
      setUploadError(err?.message || 'Terjadi kesalahan saat menyimpan data.')
      setStep(STEP_PREVIEW)
    }
  }

  // -------------------------------------------------------
  // Reset / Back
  // -------------------------------------------------------
  function handleReset() {
    setStep(STEP_UPLOAD)
    setSelectedFile(null)
    setPreview(null)
    setImportResult(null)
    setUploadError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleFinish() {
    onImported?.()
    onClose()
  }

  // -------------------------------------------------------
  // Row badge helper
  // -------------------------------------------------------
  function RowBadge({ row }) {
    if (row.isDuplicate) {
      return <span className="import-row-badge duplicate">Duplikat</span>
    }
    if (!row.isValid) {
      return <span className="import-row-badge invalid">Tidak Valid</span>
    }
    return <span className="import-row-badge valid">Siap Diimpor</span>
  }

  // -------------------------------------------------------
  // Modal cannot be closed while uploading or importing
  // -------------------------------------------------------
  function handleOverlayMouseDown() {
    if (step === STEP_IMPORTING || uploading) return
    onClose()
  }

  // -------------------------------------------------------
  // Render
  // -------------------------------------------------------
  return (
    <div
      className="import-modal-overlay"
      onMouseDown={handleOverlayMouseDown}
    >
      <div
        className="import-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-modal-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* ========== HEADER ========== */}
        <div className="import-modal-header">
          <div>
            <h2 id="import-modal-title">Import Material dari Excel</h2>
            <p>Unggah file Excel (.xlsx) untuk menambahkan banyak material sekaligus.</p>
          </div>

          <button
            type="button"
            className="import-modal-close"
            onClick={onClose}
            disabled={step === STEP_IMPORTING || uploading}
            aria-label="Tutup modal"
          >
            <X size={17} />
          </button>
        </div>

        {/* ========== BODY ========== */}
        <div className="import-modal-body">

          {/* ── STEP: UPLOAD ── */}
          {step === STEP_UPLOAD && (
            <>
              {/* Template hint */}
              <p className="import-template-hint">
                Belum punya file Excel?{' '}
                <button
                  type="button"
                  className="import-template-link"
                  onClick={handleDownloadTemplate}
                  disabled={downloadingTemplate}
                >
                  <Download size={13} />
                  {downloadingTemplate ? 'Mengunduh...' : 'Unduh Template Excel'}
                </button>
                . Isi sesuai format lalu unggah kembali.
              </p>

              {/* Error banner */}
              {uploadError && (
                <div className="import-error-banner" role="alert">
                  <AlertTriangle size={16} />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Drop zone */}
              <div
                className={`import-drop-zone${dragOver ? ' drag-over' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
                }}
                aria-label="Area unggah file Excel"
              >
                <FileSpreadsheet size={38} />
                <span className="import-drop-zone-label">
                  {selectedFile
                    ? selectedFile.name
                    : 'Klik atau seret file .xlsx ke sini'}
                </span>
                <span className="import-drop-zone-sub">
                  Maksimum 5 MB · Hanya format .xlsx
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                className="import-drop-zone-file"
                onChange={handleFileChange}
              />
            </>
          )}

          {/* ── STEP: PREVIEW ── */}
          {step === STEP_PREVIEW && preview && (
            <>
              {uploadError && (
                <div className="import-error-banner" role="alert">
                  <AlertTriangle size={16} />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Summary cards */}
              <div className="import-summary">
                <div className="import-summary-card">
                  <span className="card-count">{preview.summary.totalRows}</span>
                  <span className="card-label">Total Baris</span>
                </div>
                <div className="import-summary-card valid">
                  <span className="card-count">{preview.summary.validCount}</span>
                  <span className="card-label">Siap Diimpor</span>
                </div>
                <div className="import-summary-card invalid">
                  <span className="card-count">{preview.summary.invalidCount}</span>
                  <span className="card-label">Tidak Valid</span>
                </div>
                <div className="import-summary-card duplicate">
                  <span className="card-count">{preview.summary.duplicateCount}</span>
                  <span className="card-label">Duplikat</span>
                </div>
              </div>

              {/* Preview table */}
              <p className="import-preview-title">
                Detail Baris Data
              </p>
              <div className="import-table-wrap">
                <table className="import-table">
                  <thead>
                    <tr>
                      <th>Baris</th>
                      <th>Nama Material</th>
                      <th>Kategori</th>
                      <th>Satuan</th>
                      <th>Harga</th>
                      <th>Status</th>
                      <th>Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((row) => (
                      <tr
                        key={row.rowNumber}
                        className={
                          row.isDuplicate
                            ? 'row-duplicate'
                            : !row.isValid
                            ? 'row-invalid'
                            : ''
                        }
                      >
                        <td>{row.rowNumber}</td>
                        <td>{row.name || <em style={{ color: '#9a97b0' }}>kosong</em>}</td>
                        <td>{row.category || '—'}</td>
                        <td>{row.unit || '—'}</td>
                        <td>{formatRupiah(row.price)}</td>
                        <td>{row.status}</td>
                        <td>
                          <RowBadge row={row} />
                          {row.errors?.length > 0 && (
                            <div className="import-row-errors">
                              {row.errors.map((err, i) => (
                                <div key={i}>• {err}</div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── STEP: IMPORTING ── */}
          {step === STEP_IMPORTING && (
            <div className="import-loading">
              <div className="admin-loading-spinner" />
              <p>Menyimpan data material ke database…</p>
            </div>
          )}

          {/* ── STEP: DONE ── */}
          {step === STEP_DONE && importResult && (
            <div className="import-result">
              <div className="import-result-icon">
                <CheckCircle2 size={26} />
              </div>
              <h3>Import Selesai</h3>
              <p>
                <strong>{importResult.inserted}</strong> material berhasil ditambahkan.
                {importResult.skipped > 0 && (
                  <> {importResult.skipped} dilewati (duplikat / tidak valid).</>
                )}
                {importResult.failed > 0 && (
                  <> {importResult.failed} gagal disimpan.</>
                )}
              </p>
            </div>
          )}
        </div>

        {/* ========== FOOTER ========== */}
        <div className="import-modal-footer">
          {step === STEP_UPLOAD && (
            <>
              <button
                type="button"
                className="admin-button secondary"
                onClick={onClose}
                disabled={uploading}
              >
                Batal
              </button>
              <button
                type="button"
                className="admin-button primary"
                onClick={handleUploadPreview}
                disabled={uploading || !selectedFile}
              >
                {uploading ? (
                  'Memproses...'
                ) : (
                  <>
                    <Upload size={15} /> Preview Data
                  </>
                )}
              </button>
            </>
          )}

          {step === STEP_PREVIEW && preview && (
            <>
              <button
                type="button"
                className="admin-button secondary"
                onClick={handleReset}
              >
                Ganti File
              </button>
              <button
                type="button"
                className="admin-button primary"
                disabled={preview.summary.validCount === 0}
                onClick={handleConfirmImport}
              >
                Impor {preview.summary.validCount} Data Valid
              </button>
            </>
          )}

          {step === STEP_DONE && (
            <button
              type="button"
              className="admin-button primary"
              onClick={handleFinish}
            >
              Selesai
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminMaterialImportModal
