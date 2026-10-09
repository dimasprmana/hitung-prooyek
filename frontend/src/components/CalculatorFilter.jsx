function CalculatorFilter({ activeFilter, onChange }) {
  const filters = [
    { label: 'Semua', value: 'semua' },
    { label: 'Struktur', value: 'struktur' },
    { label: 'Finishing', value: 'finishing' },
  ]

  return (
    <div className="filter-tabs" aria-label="Filter kalkulator">
      {filters.map((filter) => (
        <button
          key={filter.value}
          className={`filter-tab ${activeFilter === filter.value ? 'active' : ''}`}
          type="button"
          onClick={() => onChange(filter.value)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}

export default CalculatorFilter
