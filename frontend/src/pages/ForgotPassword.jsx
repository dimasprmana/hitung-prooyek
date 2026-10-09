import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, KeyRound } from 'lucide-react'
import { forgotPassword } from '../services/authApi'
import '../styles/forgot-password.css'

function ForgotPassword() {
  const [form, setForm] = useState({
    email: '',
  })

  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))

    setMessage('')
    setSuccess(false)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.email.trim()) {
      setSuccess(false)
      setMessage('Email wajib diisi.')
      return
    }

    try {
      setLoading(true)
      setMessage('')

      const response = await forgotPassword({
        email: form.email.trim(),
      })

      setSuccess(true)

      setMessage(
        response.message ||
          'Jika email terdaftar, instruksi reset password akan diproses.',
      )
    } catch (error) {
      setSuccess(false)

      setMessage(
        error.message ||
          'Permintaan reset password gagal diproses.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="forgot-page">
      <section className="forgot-card">
        <div className="forgot-icon">
          <KeyRound size={24} />
        </div>

        <header>
          <span>KEAMANAN AKUN</span>

          <h1>Lupa Password</h1>

          <p>
            Masukkan email akun untuk memulai
            proses reset password.
          </p>
        </header>

        <form
          className="forgot-form"
          onSubmit={handleSubmit}
        >
          <label>
            <span>Email</span>

            <input
              type="email"
              name="email"
              value={form.email}
              placeholder="nama@email.com"
              onChange={handleChange}
              autoComplete="email"
            />
          </label>

          {message && (
            <div
              className={`forgot-message ${
                success ? 'success' : 'error'
              }`}
            >
              {message}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading
              ? 'Memproses...'
              : 'Kirim Instruksi Reset'}
          </button>
        </form>

        <Link className="forgot-back" to="/login">
          <ArrowLeft size={16} />
          Kembali ke Login
        </Link>

        <small className="forgot-note">
          Jika email terdaftar, Anda akan
          mendapatkan instruksi untuk mengatur
          password baru.
        </small>
      </section>
    </main>
  )
}

export default ForgotPassword