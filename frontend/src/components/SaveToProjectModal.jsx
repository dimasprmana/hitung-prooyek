import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  createProject as createApiProject,
  getProjects as getApiProjects,
} from '../services/projectApi'

function SaveToProjectModal({ open, onClose, onSave }) {
  const [projects, setProjects] = useState([])
  const [projectId, setProjectId] = useState('')
  const [newProjectName, setNewProjectName] = useState('')
  const [savedProject, setSavedProject] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return

    getApiProjects()
      .then((response) => {
        const nextProjects = response.data || []
        setProjects(nextProjects)
        setProjectId(nextProjects[0]?.id || '')
        setError('')
      })
      .catch((requestError) => {
        setError(
          requestError.message ||
            'Proyek gagal dimuat.',
        )
      })
  }, [open])

  if (!open) return null

  async function createProject() {
    if (!newProjectName.trim()) return

    try {
      const response = await createApiProject({
        name: newProjectName.trim(),
        note: '',
        works: [],
      })
      const project = response.data
      const nextProjects = [...projects, project]
      setProjects(nextProjects)
      setProjectId(project.id)
      setError('')
    } catch (requestError) {
      setError(
        requestError.message ||
          'Proyek gagal dibuat.',
      )
      return
    }
    setNewProjectName('')
  }

  async function saveSelected() {
    const project = await onSave(projectId)
    if (!project) return
    setSavedProject(project)
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        {savedProject ? (
          <>
            <h2>Berhasil disimpan</h2>
            <p className="success-message">Berhasil disimpan ke {savedProject.name}.</p>
            <div className="button-row">
              <button className="button button-secondary" type="button" onClick={onClose}>Tetap di Sini</button>
              <Link className="button button-primary" to={`/proyek/${savedProject.id}`}>Lihat Proyek</Link>
            </div>
          </>
        ) : (
          <>
            <h2>Simpan ke Proyek</h2>
            {error && <p className="success-message">{error}</p>}
            <label>
              Pilih Proyek
              <select value={projectId} onChange={(event) => setProjectId(event.target.value)}>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </label>
            <div className="divider" />
            <label>
              Buat Proyek Baru
              <input
                placeholder="Nama project"
                value={newProjectName}
                onChange={(event) => setNewProjectName(event.target.value)}
              />
            </label>
            <button className="button button-secondary" type="button" onClick={createProject}>
              + Buat Proyek Baru
            </button>
            <div className="button-row">
              <button className="button button-secondary" type="button" onClick={onClose}>Batal</button>
              <button className="button button-primary" type="button" onClick={saveSelected} disabled={!projectId}>Simpan</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SaveToProjectModal
