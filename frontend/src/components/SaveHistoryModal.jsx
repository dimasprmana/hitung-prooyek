import { useState } from 'react'

function SaveHistoryModal({ open, defaultTitle, onClose, onSave }) {
  const [title, setTitle] = useState(defaultTitle)

  if (!open) return null

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h2>Simpan Riwayat</h2>
        <label>
          Nama Perhitungan
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <div className="button-row">
          <button className="button button-secondary" type="button" onClick={onClose}>Batal</button>
          <button className="button button-primary" type="button" onClick={() => onSave(title)}>Simpan</button>
        </div>
      </div>
    </div>
  )
}

export default SaveHistoryModal
