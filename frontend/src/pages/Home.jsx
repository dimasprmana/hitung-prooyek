import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight,BarChart3,Calculator,ClipboardList,Layers3,Ruler,} from 'lucide-react'
import CalculatorCard from '../components/CalculatorCard'
import CalculatorFilter from '../components/CalculatorFilter'
import HeroCarousel from '../components/HeroCarousel'
import '../styles/home.css'
import { calculators, popularCalculators } from '../data/calculators'
import hitungCepatIllustration from '../assets/images/hitung-cepat-illustration.webp'
import proyekIllustration from '../assets/images/proyek-illustration.webp'

function filterCalculators(items, filter) {
  if (filter === 'struktur') {
    return items.filter((item) => item.group === 'Pekerjaan Struktur')
  }

  if (filter === 'finishing') {
    return items.filter((item) => item.group === 'Pekerjaan Finishing')
  }

  return items
}

function Home() {
  const [filter, setFilter] = useState('semua')

  const filteredCalculators = useMemo(
    () => filterCalculators(calculators, filter),
    [filter],
  )

  return (
    <div className="page home-page">
      {/* HERO */}
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">
              Hitung material lebih mudah
            </span>

            <h1>
              Hitung kebutuhan material proyek dengan lebih cepat
            </h1>

            <p>
              Hitung kebutuhan satu pekerjaan dengan cepat atau
              rencanakan beberapa pekerjaan dalam satu proyek.
            </p>

            <div className="hero-actions">
              <Link
                className="button button-primary"
                to="/hitung"
              >
                Hitung Sekarang
              </Link>

              <Link
                className="button button-secondary"
                to="/proyek/buat"
              >
                Buat Proyek
              </Link>
            </div>
          </div>

          <HeroCarousel />
        </div>
      </section>

      {/* CARA MENGGUNAKAN */}
      <section className="section usage-section">
        <div className="container">
          <div className="section-heading usage-heading">
            <h2>
              Pilih cara menghitung sesuai kebutuhan Anda
            </h2>

            <p>
              Gunakan Hitung Cepat untuk satu pekerjaan,
              atau buat Proyek untuk menggabungkan beberapa
              pekerjaan dalam satu estimasi.
            </p>
          </div>

          <div className="usage-grid">
            {/* HITUNG CEPAT */}
            <article className="usage-card usage-card-quick">
              <div className="usage-card-header">
                <div className="usage-card-badges">
                  <span className="usage-number">
                    01
                  </span>

                  <span className="usage-type">
                    Hitung Cepat
                  </span>
                </div>
              </div>

              <div className="usage-card-content">
                <div className="usage-card-copy">
                  <h3>
                    Hitung satu pekerjaan secara langsung.
                  </h3>

                  <p>
                    Cocok jika Anda hanya ingin mengetahui
                    kebutuhan material dan estimasi biaya
                    untuk satu jenis pekerjaan.
                  </p>

                  <div className="usage-example">
                    <span className="usage-example-label">
                      Contoh pekerjaan
                    </span>

                    <div className="usage-tags">
                      <span>Dinding</span>
                      <span>Keramik</span>
                      <span>Cat Tembok</span>
                      <span>Plafon</span>
                      <span>Baja Ringan</span>
                    </div>
                  </div>
                </div>

                <div className="usage-illustration">
                  <img
                    src={hitungCepatIllustration}
                    alt="Ilustrasi Hitung Cepat HitungProyek"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>

              <div className="usage-steps">
                <div className="usage-step">
                  <span className="usage-step-icon">
                    <ClipboardList size={18} />
                  </span>

                  <div>
                    <strong>1. Pilih</strong>
                    <small>jenis pekerjaan</small>
                  </div>
                </div>

                <ArrowRight
                  className="usage-step-arrow"
                  size={18}
                />

                <div className="usage-step">
                  <span className="usage-step-icon">
                    <Ruler size={18} />
                  </span>

                  <div>
                    <strong>2. Isi</strong>
                    <small>data ukuran</small>
                  </div>
                </div>

                <ArrowRight
                  className="usage-step-arrow"
                  size={18}
                />

                <div className="usage-step">
                  <span className="usage-step-icon">
                    <BarChart3 size={18} />
                  </span>

                  <div>
                    <strong>3. Lihat hasil</strong>
                    <small>estimasi material</small>
                  </div>
                </div>
              </div>
            </article>

            {/* PROYEK */}
            <article className="usage-card usage-card-project">
              <div className="usage-card-header">
                <div className="usage-card-badges">
                  <span className="usage-number">
                    02
                  </span>

                  <span className="usage-type">
                    Proyek
                  </span>
                </div>

                <span className="usage-recommended">
                  Direkomendasikan
                </span>
              </div>

              <div className="usage-card-content">
                <div className="usage-card-copy">
                  <h3>
                    Hitung beberapa pekerjaan dalam satu proyek.
                  </h3>

                  <p>
                    Cocok untuk merencanakan beberapa bagian
                    bangunan sekaligus dan melihat total
                    kebutuhan material serta estimasi biaya.
                  </p>

                  <div className="usage-example">
                    <span className="usage-example-label">
                      Contoh pekerjaan
                    </span>

                    <div className="usage-tags">
                      <span>Pondasi</span>
                      <span>Beton</span>
                      <span>Dinding</span>
                      <span>Baja Ringan</span>
                      <span>Keramik</span>
                      <span>Cat</span>
                    </div>
                  </div>
                </div>

                <div className="usage-illustration">
                  <img
                    src={proyekIllustration}
                    alt="Ilustrasi Proyek HitungProyek"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>

              <div className="usage-steps">
                <div className="usage-step">
                  <span className="usage-step-icon">
                    <Layers3 size={18} />
                  </span>

                  <div>
                    <strong>1. Pilih</strong>
                    <small>beberapa pekerjaan</small>
                  </div>
                </div>

                <ArrowRight
                  className="usage-step-arrow"
                  size={18}
                />

                <div className="usage-step">
                  <span className="usage-step-icon">
                    <Calculator size={18} />
                  </span>

                  <div>
                    <strong>2. Hitung</strong>
                    <small>setiap pekerjaan</small>
                  </div>
                </div>

                <ArrowRight
                  className="usage-step-arrow"
                  size={18}
                />

                <div className="usage-step">
                  <span className="usage-step-icon">
                    <ClipboardList size={18} />
                  </span>

                  <div>
                    <strong>3. Lihat rekap</strong>
                    <small>total estimasi</small>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* KALKULATOR */}
      <section className="section compact-section">
        <div className="container">
          <div className="section-heading">
            <h2>
              Kalkulator yang Anda butuhkan
            </h2>

            <p>
              Pilih satu pekerjaan untuk menghitung kebutuhan
              material secara cepat.
            </p>
          </div>

          <CalculatorFilter
            activeFilter={filter}
            onChange={setFilter}
          />

          <div className="card-grid">
            {(filter === 'semua'
              ? popularCalculators
              : filteredCalculators
            ).map((calculator) => (
              <CalculatorCard
                key={calculator.id}
                calculator={calculator}
                backTo="/"
                backLabel="Beranda"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
