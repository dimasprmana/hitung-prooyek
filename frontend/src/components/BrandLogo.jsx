import iconHitungProyek from '../assets/images/icon-HitungProyek.png'

function BrandLogo({ mode = 'full' }) {
  return (
    <span className={`brand-logo brand-logo-${mode}`} aria-label="HitungProyek">
      <span className="brand-logo-mark" aria-hidden="true">
        <img src={iconHitungProyek} alt="" />
      </span>
      {mode === 'full' && (
        <span className="brand-logo-text">
          <span>Hitung</span>
          <strong>Proyek</strong>
        </span>
      )}
    </span>
  )
}

export default BrandLogo
