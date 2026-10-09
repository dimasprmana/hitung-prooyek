import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Check, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import '../../styles/admin-login.css'

function AdminLogin() {
  const navigate = useNavigate()
  const { login, logout } = useAuth()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')

  const [loginSuccess, setLoginSuccess] = useState(false)
  const [countdown, setCountdown] = useState(2)

  useEffect(() => {
    if (!loginSuccess) return

    setCountdown(2)

    const countdownTimer = setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          clearInterval(countdownTimer)
          return 0
        }

        return current - 1
      })
    }, 1000)

    const redirectTimer = setTimeout(() => {
      navigate('/admin', {
        replace: true,
      })
    }, 2000)

    return () => {
      clearInterval(countdownTimer)
      clearTimeout(redirectTimer)
    }
  }, [loginSuccess, navigate])

  async function handleSubmit(event) {
    event.preventDefault()

    setMessage('')

    try {
      const user = await login(
        form.email,
        form.password,
      )

      if (user.role !== 'admin') {
        await logout()

        setMessage(
          'Akun ini tidak memiliki akses admin.',
        )

        return
      }

      setLoginSuccess(true)
    } catch (error) {
      setMessage(
        error.message ||
          'Login admin gagal.',
      )
    }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <Link
          className="admin-login-brand"
          to="/"
        >
          Hitung<span>Proyek</span>
        </Link>

        <header>
          <span>ADMIN PANEL</span>

          <h1>Login Admin</h1>

          <p>
            Masuk untuk mengakses dashboard
            admin.
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          <label>
            <span>Email Admin</span>

            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              disabled={loginSuccess}
            />
          </label>

          <label>
            <span>Password</span>

            <div className="admin-login-password">
              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password:
                      event.target.value,
                  }))
                }
                disabled={loginSuccess}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (value) => !value,
                  )
                }
                disabled={loginSuccess}
                aria-label={
                  showPassword
                    ? 'Sembunyikan password'
                    : 'Tampilkan password'
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

          {message && (
            <div className="admin-login-message">
              {message}
            </div>
          )}

          <button
            className="admin-login-submit"
            type="submit"
            disabled={loginSuccess}
          >
            Masuk Admin
          </button>
        </form>
      </section>

      {/* SUCCESS POPUP */}
      {loginSuccess && (
        <div className="admin-login-success-overlay">
          <div className="admin-login-success-popup">
            <div className="admin-login-success-check">
              <Check
                size={30}
                strokeWidth={3}
              />
            </div>

            <h2>Login Berhasil</h2>

            <p>
              Anda berhasil masuk sebagai
              administrator.
            </p>

            <div className="admin-login-success-timer">
              <span>
                Mengarahkan ke dashboard
              </span>

              <strong>
                {countdown}
              </strong>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default AdminLogin