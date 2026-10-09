function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading-row">
      <div className="page-title compact">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  )
}

export default PageHeader
