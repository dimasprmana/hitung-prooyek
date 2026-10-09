import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'

function CalculatorCard({ calculator, backTo = '/hitung', backLabel = 'Hitung' }) {
  const Icon = calculator.icon

  return (
    <article className="calculator-card">
      <div className="card-icon">
        {calculator.iconImage ? (
          <img src={calculator.iconImage} alt="" loading="lazy" decoding="async" />
        ) : (
          <Icon size={24} />
        )}
      </div>
      <div>
        <span className="card-kicker">{calculator.group?.replace('Pekerjaan ', '')}</span>
        <h3>Kalkulator {calculator.name}</h3>
        <p>{calculator.description}</p>
      </div>
      {calculator.available ? (
        <Link
          className="card-action"
          to={calculator.path}
          state={{ from: backTo, fromLabel: backLabel }}
          aria-label={`Buka kalkulator ${calculator.name}`}
        >
          <span>Hitung</span>
          <ArrowRight size={18} />
        </Link>
      ) : (
        <span className="status-badge">Segera tersedia</span>
      )}
    </article>
  )
}

export default CalculatorCard
