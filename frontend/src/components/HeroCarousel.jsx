import { useEffect, useState } from 'react'
import heroBlueprint from '../assets/images/hero-house-blueprint.webp'
import heroModern from '../assets/images/hero-house-modern.webp'
import heroDesain from '../assets/images/rumah-desain-hitam.webp'

const slides = [
  {
    image: heroModern,
    alt: 'Visual rumah modern untuk estimasi proyek',
  },
  {
    image: heroBlueprint,
    alt: 'Visual perencanaan rumah di atas blueprint',
  },

  {
    image: heroDesain,
    alt: 'Visual desain interior rumah',
  }
]

function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return undefined

    const interval = window.setInterval(() => {
      setCurrentSlide((current) => (current + 1) % slides.length)
    }, 4000)

    return () => window.clearInterval(interval)
  }, [isPaused])

  return (
    <div
      className="hero-carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="hero-carousel-track"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div className="hero-slide" key={slide.image}>
            <img
              src={slide.image}
              alt={slide.alt}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding={index === 0 ? 'sync' : 'async'}
              fetchPriority={index === 0 ? 'high' : 'auto'}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default HeroCarousel
