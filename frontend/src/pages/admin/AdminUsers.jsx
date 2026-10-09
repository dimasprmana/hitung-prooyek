import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import AdminPageHeader from '../../components/AdminPageHeader'
import { getAdminUsers } from '../../services/adminApi'
import '../../styles/admin-users.css'

function AdminUsers() {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAdminUsers()
      .then((response) => {
        setUsers(response.data || [])
        setError('')
      })
      .catch((requestError) => {
        setError(requestError.message || 'User gagal dimuat.')
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredUsers = useMemo(() => {
    const value = query.toLowerCase().trim()

    if (!value) return users

    return users.filter((user) =>
      [user.name, user.email, user.role].some((item) =>
        String(item || '').toLowerCase().includes(value),
      ),
    )
  }, [query, users])

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Manajemen"
        title="User"
        description="Lihat akun user dan status pengguna HitungProyek."
      />

      <section className="admin-panel">
        <div className="admin-toolbar">
          <input
            className="admin-input"
            type="search"
            placeholder="Cari nama atau email..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <span className="admin-count">
            {filteredUsers.length} user
          </span>
        </div>

        {loading && <p>Memuat user...</p>}
        {error && <p role="alert">{error}</p>}

        {!loading && !error && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Dibuat</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5">Belum ada user.</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td><strong>{user.name}</strong></td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{user.created_at || user.createdAt}</td>
                      <td className="admin-table-action">
                        <Link
                          className="admin-link-button"
                          to={`/admin/users/${user.id}`}
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminUsers
