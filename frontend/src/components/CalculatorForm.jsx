import { calculatorFields } from '../calculators/fields'

function isVisible(item, form) {
  if (!item.showWhen) return true
  const value = form[item.showWhen.field]
  return item.showWhen.equals.includes(value)
}

function hasUsableValue(value) {
  if (Array.isArray(value)) {
    return value.some((item) => Number(item.width) > 0 && Number(item.height) > 0 && Number(item.quantity) > 0)
  }

  return Number(value) > 0
}

function makeChange(name, value, type = 'text') {
  return { target: { name, value, type, checked: Boolean(value) } }
}

function OpeningRows({ field, rows = [], onChange }) {
  function updateRow(id, key, value) {
    onChange(makeChange(field.name, rows.map((row) => (row.id === id ? { ...row, [key]: value } : row))))
  }

  function addRow() {
    onChange(
      makeChange(field.name, [
        ...rows,
        {
          id: `${field.name}-${Date.now()}`,
          width: '',
          height: '',
          quantity: '1',
        },
      ]),
    )
  }

  function removeRow(id) {
    onChange(makeChange(field.name, rows.filter((row) => row.id !== id)))
  }

  return (
    <div className="dynamic-field-group">
      <div className="dynamic-field-heading">
        <h4>{field.label}</h4>
        <button className="button button-secondary dynamic-add" type="button" onClick={addRow}>
          {field.addLabel}
        </button>
      </div>

      {(rows.length ? rows : []).map((row, index) => (
        <div className="dynamic-field-row" key={row.id}>
          <label>
            Lebar
            <span className="field-control">
              <input min="0" step="0.01" type="number" value={row.width ?? ''} onChange={(event) => updateRow(row.id, 'width', event.target.value)} />
              <span>m</span>
            </span>
          </label>
          <label>
            Tinggi
            <span className="field-control">
              <input min="0" step="0.01" type="number" value={row.height ?? ''} onChange={(event) => updateRow(row.id, 'height', event.target.value)} />
              <span>m</span>
            </span>
          </label>
          <label>
            Jumlah
            <input min="0" step="1" type="number" value={row.quantity ?? ''} onChange={(event) => updateRow(row.id, 'quantity', event.target.value)} />
          </label>
          <button className="dynamic-remove" type="button" onClick={() => removeRow(row.id)} disabled={rows.length === 1}>
            Hapus {index + 1}
          </button>
        </div>
      ))}
    </div>
  )
}

function FieldControl({ field, form, onChange }) {
  const value = form[field.name] ?? ''

  if (field.type === 'dynamic-openings') {
    return <OpeningRows field={field} rows={value} onChange={onChange} />
  }

  if (field.type === 'checkbox') {
    return (
      <label className="checkbox-line">
        <input
          name={field.name}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(makeChange(field.name, event.target.checked, 'checkbox'))}
        />
        <span>{field.label}</span>
      </label>
    )
  }

  if (field.type === 'radio') {
    return (
      <div className="form-field full-span">
        <span className="field-label">{field.label}</span>
        <div className="radio-card-group">
          {field.options.map((option) => (
            <label className={`radio-card ${value === option ? 'selected' : ''}`} key={option}>
              <input
                name={field.name}
                type="radio"
                value={option}
                checked={value === option}
                onChange={(event) => onChange(makeChange(field.name, event.target.value))}
              />
              {option}
            </label>
          ))}
        </div>
      </div>
    )
  }

  return (
    <label className="form-field">
      <span className="field-label">{field.label}</span>
      <span className="field-control">
        {field.type === 'select' ? (
          <select name={field.name} value={value} onChange={onChange}>
            {field.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            name={field.name}
            type="number"
            min={field.min ?? '0'}
            max={field.max}
            step={field.step ?? '0.01'}
            value={value}
            onChange={onChange}
          />
        )}
        {field.unit && <span>{field.unit}</span>}
      </span>
    </label>
  )
}

function FormSection({ section, form, onChange }) {
  const visibleFields = section.fields.filter((field) => isVisible(field, form))
  if (visibleFields.length === 0) return null

  const content = (
    <>
      {!section.advanced && (
        <div className="form-section-heading">
          <h3>{section.title}</h3>
          {section.description && <p>{section.description}</p>}
        </div>
      )}
      <div className="input-grid">
        {visibleFields.map((field) => (
          <FieldControl field={field} form={form} key={field.name} onChange={onChange} />
        ))}
      </div>
    </>
  )

  if (section.advanced) {
    return (
      <details className="advanced-options">
        <summary>{section.title}</summary>
        {content}
      </details>
    )
  }

  return <section className="calculator-form-section">{content}</section>
}

function CalculatorForm({ type, form, onChange, onSubmit, title = 'Input Ukuran', showSubmit = true }) {
  const sections = calculatorFields[type] || []
  const isValid = sections.some((section) =>
    section.fields.some((field) => field.name !== 'waste' && isVisible(field, form) && hasUsableValue(form[field.name])),
  )
  const Wrapper = onSubmit ? 'form' : 'div'

  return (
    <Wrapper className="panel form-panel calculator-input-form" onSubmit={onSubmit}>
      <h2>{title}</h2>
      {sections.map((section) => (
        <FormSection form={form} key={section.title} onChange={onChange} section={section} />
      ))}
      {showSubmit && (
        <button className="button button-primary full-width" type="submit" disabled={!isValid}>
          Hitung Sekarang
        </button>
      )}
    </Wrapper>
  )
}

export default CalculatorForm
