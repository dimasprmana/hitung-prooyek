import '../styles/admin-stat-card.css'
function AdminStatCard({ label, value, helper }) {
  return (
    <article className="admin-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{helper}</small>
    </article>
  )
}

export default AdminStatCard
