import '../styles/admin-page-header.css'
function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}) {
  return (
    <div className="admin-page-header">
      <div>
        {eyebrow && <span className="admin-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>

      {action && <div>{action}</div>}
    </div>
  )
}

export default AdminPageHeader
