import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import '../styles/register.css'

function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    if (message) setMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      setMessage('Semua data wajib diisi.')
      return
    }

    if (form.password.length < 6) {
      setMessage('Password minimal 6 karakter.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setMessage('Konfirmasi password tidak sama.')
      return
    }

    try {
      setLoading(true)
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
      })
      navigate('/login')
    } catch (error) {
      setMessage(error.message || 'Pendaftaran gagal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="register-page">
      <section className="register-card">
        <Link className="register-brand" to="/">
          Hitung<span>Proyek</span>
        </Link>

        <header className="register-header">
          <h1>Buat Akun</h1>
          <p>Daftar untuk menyimpan riwayat dan proyek Anda.</p>
        </header>

        <form className="register-form" onSubmit={handleSubmit}>
          <label className="register-field">
            <span>Nama Lengkap</span>
            <input
              type="text"
              name="name"
              value={form.name}
              placeholder="Nama lengkap"
              onChange={handleChange}
            />
          </label>

          <label className="register-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              placeholder="Masukkan email"
              onChange={handleChange}
            />
          </label>

          <label className="register-field">
            <span>Password</span>
            <div className="register-password">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                placeholder="Minimal 6 karakter"
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <label className="register-field">
            <span>Konfirmasi Password</span>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={form.confirmPassword}
              placeholder="Ulangi password"
              onChange={handleChange}
            />
          </label>

          {message && <div className="register-message">{message}</div>}

          <button className="register-submit" type="submit" disabled={loading}>
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <p className="register-switch">
          Sudah punya akun? <Link to="/login">Masuk</Link>
        </p>

        <Link className="register-back" to="/">
          Kembali ke Beranda
        </Link>
      </section>
    </main>
  )
}

export default Register
