import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft,ArrowRight,Calculator,Check,FileText,Layers3,Save,} from 'lucide-react'
import {aggregateMaterials,calculateByType,} from '../calculators/engines'
import {getInitialInput,prepareCalculatorInput,} from '../calculators/fields'
import CalculatorForm from '../components/CalculatorForm'
import MaterialResultTable from '../components/MaterialResultTable'

import { calculatorGroups } from '../data/calculators'
import { makeWorkFromCalculation } from '../utils/calculationWork'
import { createProject } from '../services/projectApi'
import { formatRupiah } from '../utils/currency'

import '../styles/project-create.css'

const PROJECT_STEPS = [
  {
    id: 1,
    label: 'Informasi',
    description: 'Data dasar proyek',
    icon: FileText,
  },
  {
    id: 2,
    label: 'Pekerjaan',
    description: 'Pilih pekerjaan',
    icon: Layers3,
  },
  {
    id: 3,
    label: 'Detail',
    description: 'Isi kalkulator',
    icon: Calculator,
  },
  {
    id: 4,
    label: 'Hasil',
    description: 'Rekap estimasi',
    icon: Save,
  },
]

function ProjectCreate() {
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [info, setInfo] = useState({
    name: '',
    note: '',
    waste: '5',
  })
  const [selected, setSelected] = useState(['dinding'])
  const [inputs, setInputs] = useState({})
  const [preview, setPreview] = useState(null)
  const [message, setMessage] = useState('')

  const calculatorMap = useMemo(() => {
    return Object.values(calculatorGroups)
      .flat()
      .reduce((result, calculator) => {
        result[calculator.id] = calculator
        return result
      }, {})
  }, [])

  function getInput(type) {
    return (
      inputs[type] ||
      getInitialInput(type, {
        waste: info.waste,
      })
    )
  }

  function updateInfo(name, value) {
    setInfo((current) => ({
      ...current,
      [name]: value,
    }))

    setPreview(null)
  }

  function updateInput(type, event) {
    const {
      name,
      value,
      checked,
      type: inputType,
    } = event.target

    setInputs((current) => ({
      ...current,
      [type]: {
        ...getInput(type),
        [name]:
          inputType === 'checkbox'
            ? checked
            : value,
      },
    }))

    setPreview(null)
  }

  function toggleWork(type) {
    setSelected((current) => {
      if (current.includes(type)) {
        return current.filter(
          (item) => item !== type,
        )
      }

      return [...current, type]
    })

    setPreview(null)
  }

  function goToStep(nextStep) {
    if (nextStep === 3 && selected.length === 0) {
      setMessage(
        'Pilih minimal satu pekerjaan terlebih dahulu.',
      )
      setStep(2)
      return
    }

    if (nextStep === 4 && !preview) {
      return
    }

    setMessage('')
    setStep(nextStep)
  }

  function continueFromInfo() {
    if (!info.name.trim()) {
      setMessage('Nama proyek wajib diisi.')
      return
    }

    setMessage('')
    setStep(2)
  }

  function continueFromWorks() {
    if (selected.length === 0) {
      setMessage(
        'Pilih minimal satu pekerjaan untuk proyek ini.',
      )
      return
    }

    setMessage('')
    setStep(3)
  }

  function calculateProject(event) {
    event.preventDefault()

    if (!info.name.trim()) {
      setMessage('Nama proyek wajib diisi.')
      setStep(1)
      return
    }

    if (selected.length === 0) {
      setMessage('Pilih minimal satu pekerjaan.')
      setStep(2)
      return
    }

    try {
      const works = selected.map((type) => {
        const input = getInput(type)

        const result = calculateByType(
          type,
          prepareCalculatorInput(type, input),
        )

        return makeWorkFromCalculation(
          type,
          result.label,
          input,
          result,
        )
      })

      const totalCost = works.reduce(
        (total, work) =>
          total + work.totalCost,
        0,
      )

      setPreview({
        works,
        totalCost,
      })

      setMessage('')
      setStep(4)
    } catch (error) {
      console.error(error)

      setMessage(
        'Perhitungan belum dapat diproses. Periksa kembali input pada setiap pekerjaan.',
      )
    }
  }

  async function save() {
    if (!preview) return

    const payload = {
      name: info.name.trim(),
      note: info.note.trim(),
      works: preview.works,
      totalCost: preview.totalCost,
      status: 'Berjalan',
    }

    try {
      const response = await createProject(payload)
      navigate(`/proyek/${response.data.id}`)
    } catch (error) {
      setMessage(
        error.message ||
          'Proyek gagal disimpan ke database.',
      )
    }
  }

  return (
    <main className="page proyek-page project-create-page">
      <section className="section project-create-section">
        <div className="container project-create-container">
          {/* Tombol kembali di kiri */}
          <div className="project-create-back">
            <button
              className="project-back-button"
              type="button"
              onClick={() => navigate('/proyek')}
            >
              <ArrowLeft size={18} />
              Kembali ke Proyek
            </button>
          </div>

          {/* Header */}
          <header className="project-create-header">
            <span className="eyebrow">
              Proyek Baru
            </span>

            <h1>
              Rencanakan beberapa pekerjaan
              dalam satu proyek
            </h1>

            <p>
              Pilih pekerjaan, lengkapi setiap kalkulator,
              lalu lihat rekap material dan estimasi biaya
              proyek.
            </p>
          </header>

          {/* Step horizontal di atas */}
          <div className="project-create-stepper">
            {PROJECT_STEPS.map((item) => {
              const Icon = item.icon
              const isActive = step === item.id
              const isDone = item.id < step
              const isDisabled =
                (item.id === 3 &&
                  selected.length === 0) ||
                (item.id === 4 && !preview)

              return (
                <button
                  key={item.id}
                  className={`project-step ${
                    isActive ? 'active' : ''
                  } ${isDone ? 'done' : ''}`}
                  type="button"
                  disabled={isDisabled}
                  onClick={() =>
                    goToStep(item.id)
                  }
                >
                  <span className="project-step-icon">
                    {isDone && !isActive ? (
                      <Check size={16} />
                    ) : (
                      <Icon size={17} />
                    )}
                  </span>

                  <span className="project-step-text">
                    <strong>
                      {item.id}. {item.label}
                    </strong>

                    <small>
                      {item.description}
                    </small>
                  </span>
                </button>
              )
            })}
          </div>

          {/* Ringkasan horizontal */}
          <div className="project-create-summary">
            <div>
              <span>Nama Proyek</span>
              <strong>
                {info.name.trim() || 'Belum diisi'}
              </strong>
            </div>

            <div>
              <span>Pekerjaan</span>
              <strong>
                {selected.length} pekerjaan
              </strong>
            </div>

            <div>
              <span>Cadangan Default</span>
              <strong>
                {info.waste || 0}%
              </strong>
            </div>
          </div>

          {message && (
            <div
              className="project-create-message"
              role="alert"
            >
              {message}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <section className="project-create-panel">
              <div className="project-panel-heading">
                <span>01</span>

                <div>
                  <h2>Informasi Proyek</h2>
                  <p>
                    Isi informasi dasar proyek sebelum
                    memilih pekerjaan.
                  </p>
                </div>
              </div>

              <div className="project-create-form">
                <label className="project-field">
                  <span>
                    Nama Proyek
                    <b>*</b>
                  </span>

                  <input
                    type="text"
                    placeholder="Contoh: Renovasi Rumah"
                    value={info.name}
                    onChange={(event) =>
                      updateInfo(
                        'name',
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label className="project-field">
                  <span>Catatan</span>

                  <textarea
                    rows="4"
                    placeholder="Tambahkan catatan proyek jika diperlukan..."
                    value={info.note}
                    onChange={(event) =>
                      updateInfo(
                        'note',
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label className="project-field">
                  <span>
                    Cadangan Material Default
                  </span>

                  <div className="project-input-unit">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      step="1"
                      value={info.waste}
                      onChange={(event) =>
                        updateInfo(
                          'waste',
                          event.target.value,
                        )
                      }
                    />

                    <span>%</span>
                  </div>

                  <small>
                    Digunakan sebagai nilai waste awal
                    pada kalkulator yang mendukung
                    cadangan material.
                  </small>
                </label>
              </div>

              <div className="project-actions project-actions-end">
                <button
                  className="button button-primary"
                  type="button"
                  onClick={continueFromInfo}
                >
                  Pilih Pekerjaan
                  <ArrowRight size={18} />
                </button>
              </div>
            </section>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <section className="project-create-panel">
              <div className="project-panel-heading">
                <span>02</span>

                <div>
                  <h2>Pilih Pekerjaan</h2>
                  <p>
                    Pilih satu atau beberapa pekerjaan
                    yang ingin dimasukkan ke proyek.
                  </p>
                </div>
              </div>

              <div className="project-work-groups">
                {Object.entries(
                  calculatorGroups,
                ).map(
                  ([group, calculators]) => (
                    <section
                      className="project-work-group"
                      key={group}
                    >
                      <div className="project-work-group-heading">
                        <h3>{group}</h3>

                        <span>
                          {
                            calculators.filter(
                              (calculator) =>
                                selected.includes(
                                  calculator.id,
                                ),
                            ).length
                          }{' '}
                          dipilih
                        </span>
                      </div>

                      <div className="project-work-grid">
                        {calculators.map(
                          (calculator) => {
                            const isSelected =
                              selected.includes(
                                calculator.id,
                              )

                            return (
                              <label
                                className={`project-work-card ${
                                  isSelected
                                    ? 'selected'
                                    : ''
                                }`}
                                key={calculator.id}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() =>
                                    toggleWork(
                                      calculator.id,
                                    )
                                  }
                                />

                                <span className="project-work-check">
                                  {isSelected && (
                                    <Check size={15} />
                                  )}
                                </span>

                                <span className="project-work-copy">
                                  <strong>
                                    {calculator.name}
                                  </strong>

                                  <small>
                                    Tambahkan ke proyek
                                  </small>
                                </span>
                              </label>
                            )
                          },
                        )}
                      </div>
                    </section>
                  ),
                )}
              </div>

              <div className="project-actions">
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft size={18} />
                  Kembali
                </button>

                <button
                  className="button button-primary"
                  type="button"
                  disabled={selected.length === 0}
                  onClick={continueFromWorks}
                >
                  Isi Detail
                  <ArrowRight size={18} />
                </button>
              </div>
            </section>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <form onSubmit={calculateProject}>
              <section className="project-create-panel">
                <div className="project-panel-heading">
                  <span>03</span>

                  <div>
                    <h2>Detail Pekerjaan</h2>
                    <p>
                      Lengkapi input pada setiap
                      kalkulator yang dipilih.
                    </p>
                  </div>
                </div>

                <div className="project-detail-note">
                  <strong>
                    {selected.length} pekerjaan dipilih
                  </strong>

                  <span>
                    Buka setiap pekerjaan dan isi data
                    secara berurutan.
                  </span>
                </div>

                <div className="project-work-accordions">
                  {selected.map(
                    (type, index) => {
                      const calculator =
                        calculatorMap[type]

                      return (
                        <details
                          className="project-work-accordion"
                          key={type}
                          open={index === 0}
                        >
                          <summary>
                            <span className="project-accordion-number">
                              {String(
                                index + 1,
                              ).padStart(2, '0')}
                            </span>

                            <span className="project-accordion-title">
                              <strong>
                                {calculator?.name ||
                                  type}
                              </strong>

                              <small>
                                Isi data pekerjaan
                              </small>
                            </span>

                            <span className="project-accordion-badge">
                              Kalkulator
                            </span>
                          </summary>

                          <div className="project-calculator-shell">
                            <CalculatorForm
                              type={type}
                              form={getInput(type)}
                              onChange={(event) =>
                                updateInput(
                                  type,
                                  event,
                                )
                              }
                              title={null}
                              showSubmit={false}
                            />
                          </div>
                        </details>
                      )
                    },
                  )}
                </div>

                <div className="project-actions">
                  <button
                    className="button button-secondary"
                    type="button"
                    onClick={() => setStep(2)}
                  >
                    <ArrowLeft size={18} />
                    Kembali
                  </button>

                  <button
                    className="button button-primary"
                    type="submit"
                  >
                    Hitung Proyek
                    <Calculator size={18} />
                  </button>
                </div>
              </section>
            </form>
          )}

          {/* STEP 4 */}
          {step === 4 && preview && (
            <section className="project-create-panel">
              <div className="project-panel-heading">
                <span>04</span>

                <div>
                  <h2>Hasil Proyek</h2>
                  <p>
                    Rekap pekerjaan, material, dan
                    estimasi biaya proyek.
                  </p>
                </div>
              </div>

              <div className="project-result-summary">
                <div>
                  <span>Jumlah Pekerjaan</span>

                  <strong>
                    {preview.works.length}
                  </strong>
                </div>

                <div className="total">
                  <span>Total Estimasi</span>

                  <strong>
                    {formatRupiah(
                      preview.totalCost,
                    )}
                  </strong>
                </div>
              </div>

              <div className="project-result-jobs">
                {preview.works.map(
                  (work, index) => (
                    <article
                      className="project-result-job"
                      key={work.id}
                    >
                      <span>
                        {String(
                          index + 1,
                        ).padStart(2, '0')}
                      </span>

                      <h3>
                        {work.title}
                      </h3>

                      <strong>
                        {formatRupiah(
                          work.totalCost,
                        )}
                      </strong>
                    </article>
                  ),
                )}
              </div>

              <div className="project-material-summary">
                <div>
                  <h3>Rekap Material</h3>
                  <p>
                    Material yang sama digabungkan
                    menjadi satu kebutuhan proyek.
                  </p>
                </div>

                <div className="project-material-table">
                  <MaterialResultTable
                    items={aggregateMaterials(
                      preview.works,
                    )}
                  />
                </div>
              </div>

              <div className="project-actions">
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() => setStep(3)}
                >
                  <ArrowLeft size={18} />
                  Kembali
                </button>

                <button
                  className="button button-primary"
                  type="button"
                  onClick={save}
                >
                  <Save size={18} />
                  Simpan Proyek
                </button>
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  )
}

export default ProjectCreate
