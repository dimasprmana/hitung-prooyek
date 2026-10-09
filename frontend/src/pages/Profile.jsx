import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Link,
  Navigate,
  useNavigate,
} from 'react-router'

import {
  ArrowRight,
  Bell,
  Calculator,
  Camera,
  ChevronRight,
  FolderKanban,
  KeyRound,
  LogOut,
  Pencil,
  Settings,
  UserRound,
  X,
} from 'lucide-react'

import { useAuth } from '../context/useAuth'
import { getCalculationHistory } from '../services/historyApi'
import { getProjects } from '../services/projectApi'

import { formatRupiah } from '../utils/currency'

import '../styles/profile.css'

function formatDate(value) {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function getProjectName(project) {
  return (
    project?.name ||
    project?.title ||
    'Proyek Tanpa Nama'
  )
}

function getHistoryName(item) {
  return (
    item?.title ||
    item?.calculatorName ||
    item?.calculatorType ||
    'Hitung Cepat'
  )
}

function Profile() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const {
    loading,
    logout,
    updateCurrentUser,
    user,
  } = useAuth()

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
  })

  const [editOpen, setEditOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const [message, setMessage] = useState('')
  const [projects, setProjects] = useState([])
  const [history, setHistory] = useState([])
  const [dataError, setDataError] = useState('')

  useEffect(() => {
    if (!user) return

    Promise.all([
      getProjects(),
      getCalculationHistory(),
    ])
      .then(([projectResponse, historyResponse]) => {
        setProjects(projectResponse.data || [])
        setHistory(historyResponse.data || [])
        setDataError('')
      })
      .catch((error) => {
        setDataError(
          error.message ||
            'Data profil gagal dimuat.',
        )
      })
  }, [user])

  const recentProjects = useMemo(() => {
    return [...projects]
      .sort(
        (a, b) =>
          new Date(
            b.updatedAt ||
              b.createdAt ||
              0,
          ) -
          new Date(
            a.updatedAt ||
              a.createdAt ||
              0,
          ),
      )
      .slice(0, 3)
  }, [projects])

  const recentHistory = useMemo(() => {
    return [...history]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0),
      )
      .slice(0, 3)
  }, [history])

  if (loading) {
    return null
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  function openEditProfile() {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      avatar: user?.avatar || '',
    })

    setMessage('')
    setEditOpen(true)
  }

  function closeEditProfile() {
    setEditOpen(false)
    setMessage('')
  }

  function handleChange(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))

    if (message) {
      setMessage('')
    }
  }

  function handleAvatarButton() {
    fileInputRef.current?.click()
  }

  function handleAvatarChange(event) {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage('File harus berupa gambar.')
      return
    }

    const maxSize = 2 * 1024 * 1024

    if (file.size > maxSize) {
      setMessage(
        'Ukuran foto maksimal 2 MB.',
      )
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      setForm((current) => ({
        ...current,
        avatar: reader.result,
      }))

      setMessage('')
    }

    reader.readAsDataURL(file)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (
      !form.name.trim() ||
      !form.email.trim()
    ) {
      setMessage(
        'Nama dan email wajib diisi.',
      )
      return
    }

    const updatedData = {
      name: form.name.trim(),
      email: form.email.trim(),
      avatar: form.avatar || '',
    }

    try {
      await updateCurrentUser(updatedData)

      setMessage(
        'Profil berhasil diperbarui.',
      )

      setTimeout(() => {
        setEditOpen(false)
        setMessage('')
      }, 700)
    } catch (error) {
      setMessage(
        error.message ||
          'Profil gagal diperbarui.',
      )
    }
  }

  function openLogoutModal() {
    setLogoutOpen(true)
  }

  function closeLogoutModal() {
    if (loggingOut) return
    setLogoutOpen(false)
  }

  async function handleLogout() {
    if (loggingOut) return

    setLoggingOut(true)

    try {
      await logout()
      navigate('/login', {
        replace: true,
      })
    } catch (error) {
      setLoggingOut(false)
      setLogoutOpen(false)
      setDataError(
        error.message ||
          'Gagal keluar dari akun.',
      )
    }
  }

  return (
    <main className="profile-page">
      <div className="profile-container">
        {/* HEADER */}
        <header className="profile-heading">
          <div>
            <h1>Profil Saya</h1>

            <p>
              Kelola informasi akun dan lihat
              aktivitas proyek Anda.
            </p>
          </div>
        </header>

        {/* PROFILE + STAT */}
        {dataError && (
          <div className="profile-message">
            {dataError}
          </div>
        )}

        <section className="profile-summary-grid">
          {/* USER CARD */}
          <article className="profile-user-card">
            <div className="profile-user-decoration" />

            <div className="profile-avatar-wrap">
              <div className="profile-avatar">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                  />
                ) : (
                  <span>
                    {user.name
                      ?.charAt(0)
                      ?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>

              <button
                type="button"
                className="profile-camera-button"
                onClick={openEditProfile}
                aria-label="Ubah foto profil"
              >
                <Camera size={19} />
              </button>
            </div>

            <div className="profile-user-copy">
              <h2>{user.name}</h2>

              <p className="profile-email">
                {user.email}
              </p>

              <span className="profile-role">
                User
              </span>

              <p className="profile-description">
                Menghitung kebutuhan material
                jadi lebih mudah bersama
                HitungProyek.
              </p>

              <button
                type="button"
                className="profile-edit-button"
                onClick={openEditProfile}
              >
                <Pencil size={17} />
                Edit Profil
              </button>
            </div>
          </article>

          {/* STATS */}
          <div className="profile-stat-stack">
            <Link
              to="/proyek"
              className="profile-stat-card profile-stat-project"
            >
              <span className="profile-stat-icon">
                <FolderKanban size={29} />
              </span>

              <div className="profile-stat-copy">
                <span>Total Proyek</span>

                <strong>
                  {projects.length}
                </strong>

                <p>
                  Proyek yang pernah dibuat
                </p>
              </div>

              <div className="profile-stat-chart">
                <span />
                <span />
                <span />
              </div>
            </Link>

            <Link
              to="/profil/riwayat"
              className="profile-stat-card profile-stat-calculation"
            >
              <span className="profile-stat-icon">
                <Calculator size={29} />
              </span>

              <div className="profile-stat-copy">
                <span>
                  Total Hitung Cepat
                </span>

                <strong>
                  {history.length}
                </strong>

                <p>
                  Perhitungan yang dilakukan
                </p>
              </div>

              <div className="profile-stat-bars">
                <span />
                <span />
                <span />
              </div>
            </Link>
          </div>
        </section>

        {/* BOTTOM CONTENT */}
        <section className="profile-content-grid">
          {/* RIWAYAT PROYEK */}
          <article className="profile-card">
            <div className="profile-card-heading">
              <span className="profile-heading-icon">
                <FolderKanban size={23} />
              </span>

              <div className="profile-heading-copy">
                <h2>Riwayat Proyek</h2>

                <p>
                  {recentProjects.length > 0
                    ? `${recentProjects.length} proyek terbaru Anda`
                    : 'Proyek terbaru Anda'}
                </p>
              </div>

              <Link
                to="/proyek"
                className="profile-see-all"
              >
                Lihat Semua
                <ArrowRight size={15} />
              </Link>
            </div>

            {recentProjects.length === 0 ? (
              <div className="profile-empty">
                <span className="profile-empty-icon">
                  <FolderKanban size={25} />
                </span>

                <strong>
                  Belum ada proyek
                </strong>

                <p>
                  Proyek yang Anda buat akan
                  muncul di sini.
                </p>

                <Link to="/proyek/buat">
                  Buat Proyek
                </Link>
              </div>
            ) : (
              <div className="profile-history-list">
                {recentProjects.map(
                  (project) => (
                    <Link
                      key={project.id}
                      to={`/proyek/${project.id}`}
                      className="profile-history-item"
                    >
                      <div className="profile-history-main">
                        <div className="profile-project-thumbnail">
                          {project.image ||
                          project.thumbnail ? (
                            <img
                              src={
                                project.image ||
                                project.thumbnail
                              }
                              alt=""
                            />
                          ) : (
                            <FolderKanban
                              size={21}
                            />
                          )}
                        </div>

                        <div className="profile-history-info">
                          <strong>
                            {getProjectName(
                              project,
                            )}
                          </strong>

                          <span>
                            {formatDate(
                              project.updatedAt ||
                                project.createdAt,
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="profile-history-right">
                        <span>
                          Estimasi Biaya
                        </span>

                        <strong>
                          {formatRupiah(
                            Number(
                              project.totalCost ||
                                0,
                            ),
                          )}
                        </strong>
                      </div>
                    </Link>
                  ),
                )}
              </div>
            )}
          </article>

          {/* HITUNG CEPAT */}
          <article className="profile-card">
            <div className="profile-card-heading">
              <span className="profile-heading-icon">
                <Calculator size={23} />
              </span>

              <div className="profile-heading-copy">
                <h2>
                  Riwayat Hitung Cepat
                </h2>

                <p>
                  {recentHistory.length > 0
                    ? `${recentHistory.length} perhitungan terbaru Anda`
                    : 'Perhitungan terbaru Anda'}
                </p>
              </div>

              <Link
                to="/profil/riwayat"
                className="profile-see-all"
              >
                Lihat Semua
                <ArrowRight size={15} />
              </Link>
            </div>

            {recentHistory.length === 0 ? (
              <div className="profile-empty">
                <span className="profile-empty-icon">
                  <Calculator size={25} />
                </span>

                <strong>
                  Belum ada perhitungan
                </strong>

                <p>
                  Hasil Hitung Cepat yang
                  disimpan akan muncul di sini.
                </p>

                <Link to="/hitung">
                  Mulai Menghitung
                </Link>
              </div>
            ) : (
              <div className="profile-history-list">
                {recentHistory.map(
                  (item, index) => (
                    <div
                      className="profile-history-item"
                      key={
                        item.id ||
                        `${item.createdAt}-${index}`
                      }
                    >
                      <div className="profile-history-main">
                        <div
                          className={`profile-calculator-thumbnail profile-calculator-${
                            index % 3
                          }`}
                        >
                          <Calculator
                            size={22}
                          />
                        </div>

                        <div className="profile-history-info">
                          <strong>
                            {getHistoryName(
                              item,
                            )}
                          </strong>

                          <span>
                            {formatDate(
                              item.createdAt,
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="profile-history-right">
                        <span>
                          Estimasi Material
                        </span>

                        <strong>
                          {formatRupiah(
                            Number(
                              item.totalCost ||
                                0,
                            ),
                          )}
                        </strong>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </article>

          {/* PENGATURAN */}
          <article className="profile-card profile-settings-card">
            <div className="profile-card-heading profile-settings-heading">
              <span className="profile-heading-icon">
                <Settings size={23} />
              </span>

              <div className="profile-heading-copy">
                <h2>Pengaturan Akun</h2>

                <p>
                  Kelola akun dan keamanan Anda.
                </p>
              </div>
            </div>

            <div className="profile-account-menu">
              <button
                type="button"
                onClick={openEditProfile}
              >
                <span className="profile-menu-icon">
                  <UserRound size={22} />
                </span>

                <div>
                  <strong>
                    Ubah Profil
                  </strong>

                  <span>
                    Edit nama, email, dan
                    foto profil
                  </span>
                </div>

                <ChevronRight size={20} />
              </button>

              <Link to="/forgot-password">
                <span className="profile-menu-icon">
                  <KeyRound size={22} />
                </span>

                <div>
                  <strong>
                    Ganti Password
                  </strong>

                  <span>
                    Perbarui kata sandi
                    akun Anda
                  </span>
                </div>

                <ChevronRight size={20} />
              </Link>

              <button type="button">
                <span className="profile-menu-icon">
                  <Bell size={22} />
                </span>

                <div>
                  <strong>
                    Notifikasi
                  </strong>

                  <span>
                    Atur preferensi
                    notifikasi
                  </span>
                </div>

                <ChevronRight size={20} />
              </button>
            </div>

            {/* LOGOUT */}
            <button
              type="button"
              className="profile-logout-button"
              onClick={openLogoutModal}
            >
              <LogOut size={17} />
              Keluar dari akun
            </button>
          </article>
        </section>
      </div>

      {/* MODAL EDIT PROFILE */}
      {editOpen && (
        <div
          className="profile-modal-backdrop"
          onMouseDown={closeEditProfile}
        >
          <div
            className="profile-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="profile-modal-header">
              <div>
                <span>PROFIL</span>

                <h2>Edit Profil</h2>

                <p>
                  Perbarui informasi akun
                  Anda.
                </p>
              </div>

              <button
                type="button"
                className="profile-modal-close"
                onClick={closeEditProfile}
                aria-label="Tutup"
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="profile-form"
              onSubmit={handleSubmit}
            >
              <div className="profile-edit-avatar">
                <div className="profile-edit-avatar-image">
                  {form.avatar ? (
                    <img
                      src={form.avatar}
                      alt="Preview profil"
                    />
                  ) : (
                    <span>
                      {form.name
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        'U'}
                    </span>
                  )}
                </div>

                <div>
                  <strong>
                    Foto Profil
                  </strong>

                  <p>
                    JPG, PNG atau WEBP.
                    Maksimal 2 MB.
                  </p>

                  <button
                    type="button"
                    onClick={
                      handleAvatarButton
                    }
                  >
                    <Camera size={16} />
                    Pilih Foto
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={
                    handleAvatarChange
                  }
                />
              </div>

              <label>
                <span>
                  Nama Lengkap
                </span>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nama lengkap"
                />
              </label>

              <label>
                <span>Email</span>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                />
              </label>

              {message && (
                <div className="profile-message">
                  {message}
                </div>
              )}

              <div className="profile-modal-actions">
                <button
                  type="button"
                  className="profile-cancel-button"
                  onClick={
                    closeEditProfile
                  }
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="profile-save-button"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI LOGOUT */}
      {logoutOpen && (
        <div
          className="profile-modal-backdrop profile-logout-backdrop"
          onMouseDown={closeLogoutModal}
        >
          <div
            className="profile-logout-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="profile-modal-close profile-logout-close"
              onClick={closeLogoutModal}
              disabled={loggingOut}
              aria-label="Tutup"
            >
              <X size={20} />
            </button>

            <div className="profile-logout-icon">
              <LogOut size={25} />
            </div>

            <div className="profile-logout-content">
              <h2>Keluar dari akun?</h2>

              <p>
                Apakah Anda yakin ingin keluar
                dari akun HitungProyek?
              </p>
            </div>

            <div className="profile-logout-actions">
              <button
                type="button"
                className="profile-logout-cancel"
                onClick={closeLogoutModal}
                disabled={loggingOut}
              >
                Batal
              </button>

              <button
                type="button"
                className="profile-logout-confirm"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                <LogOut size={17} />

                {loggingOut
                  ? 'Keluar...'
                  : 'Keluar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Profile