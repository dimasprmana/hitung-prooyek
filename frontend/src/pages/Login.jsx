import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import '../styles/login.css'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const [loginSuccess, setLoginSuccess] = useState(false)
  const [successUser, setSuccessUser] = useState(null)

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

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.email.trim() || !form.password) {
      setMessage('Email dan password wajib diisi.')
      return
    }

    try {
      setLoading(true)
      setMessage('')

      const user = await login(
        form.email.trim(),
        form.password,
      )

      setSuccessUser(user)
      setLoginSuccess(true)
    } catch (error) {
      setMessage(error.message || 'Login gagal.')
    } finally {
      setLoading(false)
    }
  }

  /* =========================================
     OTOMATIS PINDAH SETELAH POPUP SELESAI
  ========================================== */
  useEffect(() => {
    if (!loginSuccess) return

    const timer = setTimeout(() => {
      if (successUser?.role === 'admin') {
        navigate('/admin/login')
        return
      }

      navigate('/profil')
    }, 1500)

    return () => clearTimeout(timer)
  }, [loginSuccess, successUser, navigate])

  return (
    <main className="login-page">
      <section className="login-card">
        <Link className="login-brand" to="/">
          Hitung<span>Proyek</span>
        </Link>

        <header className="login-header">
          <h1>Masuk</h1>

          <p>
            Masuk untuk melanjutkan proyek dan
            perhitungan Anda.
          </p>
        </header>

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >
          <label className="login-field">
            <span>Email</span>

            <input
              type="email"
              name="email"
              value={form.email}
              placeholder="Masukkan email"
              onChange={handleChange}
              autoComplete="email"
            />
          </label>

          <label className="login-field">
            <span>Password</span>

            <div className="login-password">
              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                name="password"
                value={form.password}
                placeholder="Masukkan password"
                onChange={handleChange}
                autoComplete="current-password"
              />

              <button
                type="button"
                aria-label={
                  showPassword
                    ? 'Sembunyikan password'
                    : 'Tampilkan password'
                }
                onClick={() =>
                  setShowPassword(
                    (value) => !value,
                  )
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </label>

          <div className="login-forgot">
            <Link to="/forgot-password">
              Lupa password?
            </Link>
          </div>

          {message && (
            <div className="login-message">
              {message}
            </div>
          )}

          <button
            className="login-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Memproses...'
              : 'Masuk'}
          </button>
        </form>

        <p className="login-switch">
          Belum punya akun?{' '}
          <Link to="/register">
            Daftar
          </Link>
        </p>

        <Link
          className="login-back"
          to="/"
        >
          Kembali ke Beranda
        </Link>
      </section>

      {/* =========================================
          LOGIN SUCCESS POPUP
      ========================================== */}
      {loginSuccess && (
        <div
          className="login-success-overlay"
          role="status"
          aria-live="polite"
        >
          <div className="login-success-popup">

            <div className="login-success-icon">
              <CheckCircle2 size={38} />
            </div>

            <div className="login-success-content">
              <h2>
                Login Berhasil
              </h2>

              <p>
                Anda berhasil masuk ke
                HitungProyek.
              </p>
            </div>

            {/* Progress waktu */}
            <div className="login-success-progress">
              <span />
            </div>

          </div>
        </div>
      )}
    </main>
  )
}

export default Login