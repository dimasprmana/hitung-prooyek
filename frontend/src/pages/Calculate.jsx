import { useMemo, useState } from 'react'
import CalculatorCard from '../components/CalculatorCard'
import CalculatorFilter from '../components/CalculatorFilter'
import {
  calculatorGroups,
  calculators as allCalculators,
} from '../data/calculators'

import hitungCepatIllustration from '../assets/images/hitung-cepat-illustration.webp'

import '../styles/hitung.css'

function filterCalculators(filter) {
  if (filter === 'struktur') {
    return allCalculators.filter(
      (item) => item.group === 'Pekerjaan Struktur',
    )
  }

  if (filter === 'finishing') {
    return allCalculators.filter(
      (item) => item.group === 'Pekerjaan Finishing',
    )
  }

  return allCalculators
}

function Calculate() {
  const [filter, setFilter] = useState('semua')

  const calculators = useMemo(
    () => filterCalculators(filter),
    [filter],
  )

  return (
    <main className="page hitung-page">
      {/* =========================
          HERO
      ========================== */}
      <section className="hitung-hero-section">
        <div className="container hitung-hero">
          <div className="hitung-hero-copy">
            <span className="eyebrow">
              Hitung Cepat
            </span>

            <h1>
              Pilih kalkulator sesuai pekerjaan Anda
            </h1>

            <p>
              Pilih jenis pekerjaan, masukkan ukuran, lalu
              lihat estimasi kebutuhan material dan biaya
              secara cepat.
            </p>
          </div>

          <div className="hitung-hero-visual">
            <div className="hitung-hero-glow" />

            <img
              src={hitungCepatIllustration}
              alt="Ilustrasi kalkulator estimasi material HitungProyek"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      </section>

      {/* =========================
          DAFTAR KALKULATOR
      ========================== */}
      <section className="section hitung-calculator-section">
        <div className="container">
          <div className="hitung-toolbar">
            <CalculatorFilter
              activeFilter={filter}
              onChange={setFilter}
            />
          </div>

          {filter === 'semua' ? (
            Object.entries(calculatorGroups).map(
              ([group, groupCalculators]) => (
                <div
                  className="calculator-group"
                  key={group}
                >
                  <div className="calculator-group-heading">
                    <h2>{group}</h2>

                    <span>
                      {groupCalculators.length} kalkulator
                    </span>
                  </div>

                  <div className="card-grid">
                    {groupCalculators.map((calculator) => (
                      <CalculatorCard
                        key={calculator.id}
                        calculator={calculator}
                        backTo="/hitung"
                        backLabel="Hitung"
                      />
                    ))}
                  </div>
                </div>
              ),
            )
          ) : (
            <div className="card-grid">
              {calculators.map((calculator) => (
                <CalculatorCard
                  key={calculator.id}
                  calculator={calculator}
                  backTo="/hitung"
                  backLabel="Hitung"
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default Calculate