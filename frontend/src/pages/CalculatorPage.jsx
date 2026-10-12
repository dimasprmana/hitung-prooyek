import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { calculateByType } from '../calculators/engines'
import { getInitialInput, prepareCalculatorInput } from '../calculators/fields'
import CalculatorForm from '../components/CalculatorForm'
import CalculatorResult from '../components/CalculatorResult'
import SaveHistoryModal from '../components/SaveHistoryModal'
import SaveToProjectModal from '../components/SaveToProjectModal'
import { calculators } from '../data/calculators'
import { makeWorkFromCalculation } from '../utils/calculationWork'
import {
  getCalculationHistoryById,
  saveCalculationHistory,
} from '../services/historyApi'
import { addProjectWork } from '../services/projectApi'
import { getMaterials } from '../services/materialApi'

function loadHistoryInput(search) {
  const historyId = new URLSearchParams(search).get('history')
  if (!historyId) return null
  return null
}

function CalculatorPage() {
  const { type = 'dinding' } = useParams()
  const location = useLocation()
  const calculator = calculators.find((item) => item.id === type)
  const backTo = location.state?.from || '/hitung'
  const backLabel = location.state?.fromLabel || 'Hitung'
  const loadedInput = useMemo(() => loadHistoryInput(location.search), [location.search])
  const [formState, setFormState] = useState(() => ({
    type,
    input: getInitialInput(type, loadedInput || {}),
  }))
  const [materials, setMaterials] = useState([])
  const [loadingMaterials, setLoadingMaterials] = useState(true)
  const [materialsError, setMaterialsError] = useState('')
  const [resultState, setResultState] = useState(null)
  const [message, setMessage] = useState('')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [projectOpen, setProjectOpen] = useState(false)
  const form = formState.type === type ? formState.input : getInitialInput(type, loadedInput || {})
  const result = resultState?.type === type ? resultState.value : null

  useEffect(() => {
    let isMounted = true
    setLoadingMaterials(true)

    getMaterials()
      .then((response) => {
        if (!isMounted) return
        const items = Array.isArray(response?.data) ? response.data : []
        setMaterials(items)
        setMaterialsError('')
      })
      .catch((error) => {
        if (!isMounted) return
        setMaterialsError(error.message || 'Data material gagal dimuat dari database.')
      })
      .finally(() => {
        if (isMounted) {
          setLoadingMaterials(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [type])

  useEffect(() => {
    const historyId = new URLSearchParams(location.search).get('history')
    if (!historyId || loadedInput) return

    getCalculationHistoryById(historyId)
      .then((response) => {
        if (response.data?.inputData) {
          setFormState({
            type,
            input: getInitialInput(type, response.data.inputData),
          })
        }
      })
      .catch(() => {})
  }, [loadedInput, location.search, type])

  if (!calculator) {
    return (
      <section className="section page">
        <div className="container">
          <div className="empty-state">
            <p>Kalkulator tidak ditemukan.</p>
          </div>
        </div>
      </section>
    )
  }

  function updateField(event) {
    const { name, value, type: inputType, checked } = event.target
    setFormState({
      type,
      input: {
        ...form,
        [name]: inputType === 'checkbox' ? checked : value,
      },
    })
    setMessage('')
  }

  function calculate(event) {
    event.preventDefault()
    if (loadingMaterials) {
      setMessage('Sedang memuat data harga material...')
      return
    }
    if (materialsError) {
      setMessage(`Harga material gagal dimuat: ${materialsError}`)
      return
    }
    try {
      setResultState({
        type,
        value: calculateByType(type, prepareCalculatorInput(type, form), materials),
      })
      setMessage('')
    } catch (error) {
      setMessage(error.message)
    }
  }

  function reset() {
    setFormState({ type, input: getInitialInput(type) })
    setResultState(null)
    setMessage('')
  }

  async function saveHistoryEntry(title) {
    if (!result) return
    const entry = {
      title: title || calculator.name,
      category: calculator.group,
      calculatorType: type,
      calculatorName: calculator.name,
      inputData: form,
      resultData: result,
      totalCost: result.totalCost,
    }

    try {
      await saveCalculationHistory(entry)
    } catch (error) {
      setMessage(
        error.message ||
          'Riwayat gagal disimpan ke database.',
      )
      return
    }
    setHistoryOpen(false)
    setMessage('Riwayat berhasil disimpan.')
  }

  async function saveToProject(projectId) {
    const work = makeWorkFromCalculation(type, calculator.name, form, result)
    let project

    try {
      const response = await addProjectWork(projectId, work)
      project = response.data
    } catch (error) {
      setMessage(
        error.message ||
          'Hasil gagal disimpan ke proyek.',
      )
      return null
    }
    setMessage(`Berhasil disimpan ke ${project.name}.`)
    return project
  }

  return (
    <section className="section page hitung-page">
      <div className="container">
        <div className="calculator-detail-shell">
          <Link className="calculator-back-link" to={backTo}>
            <ArrowLeft size={18} />
            Kembali ke {backLabel}
          </Link>

          <div className="page-title calculator-detail-title">
            <span className="eyebrow">Kalkulator {calculator.group}</span>
            <h1>{calculator.name}</h1>
            <p>{calculator.description}</p>
          </div>
        </div>

        {materialsError && (
          <p className="form-note" role="alert" style={{ marginBottom: '1rem', color: '#b91c1c' }}>
            {materialsError}
          </p>
        )}
        {message && <p className="success-message">{message}</p>}

        <div className="calculator-layout">
          <CalculatorForm type={type} form={form} onChange={updateField} onSubmit={calculate} />
          <CalculatorResult
            result={result}
            onReset={reset}
            onSaveHistory={() => setHistoryOpen(true)}
            onSaveProject={() => setProjectOpen(true)}
          />
        </div>
      </div>

      <SaveHistoryModal
        open={historyOpen}
        defaultTitle={`${calculator.name} ${new Date().toLocaleDateString('id-ID')}`}
        onClose={() => setHistoryOpen(false)}
        onSave={saveHistoryEntry}
      />
      <SaveToProjectModal open={projectOpen && Boolean(result)} onClose={() => setProjectOpen(false)} onSave={saveToProject} />
    </section>
  )
}

export default CalculatorPage
