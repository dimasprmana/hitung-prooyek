import {
  Blocks,
  Brush,
  CircleDot,
  Droplets,
  Grid3X3,
  Hammer,
  Home,
  Layers3,
  PaintRoller,
  PencilRuler,
  SquareStack,
} from 'lucide-react'
import besiIcon from '../assets/calculator-icons/besi.webp'
import bajaRinganIcon from '../assets/calculator-icons/baja-ringan.webp'
import betonIcon from '../assets/calculator-icons/beton.webp'
import catIcon from '../assets/calculator-icons/cat.webp'
import dindingIcon from '../assets/calculator-icons/dinding.webp'
import keramikIcon from '../assets/calculator-icons/keramik.webp'
import plafonIcon from '../assets/calculator-icons/plafon.webp'
import pondasiIcon from '../assets/calculator-icons/pondasi.webp'
import tanggaIcon from '../assets/calculator-icons/tangga.webp'
import vinylIcon from '../assets/calculator-icons/vinyl.webp'
import wallpaperIcon from '../assets/calculator-icons/wallpaper.webp'

export const calculators = [
  {
    id: 'baja-ringan',
    group: 'Pekerjaan Struktur',
    name: 'Baja Ringan',
    description: 'Hitung luas atap dan kebutuhan baja ringan.',
    icon: Home,
    iconImage: bajaRinganIcon,
    path: '/hitung/baja-ringan',
    available: true,
  },
  {
    id: 'beton',
    group: 'Pekerjaan Struktur',
    name: 'Cor Beton',
    description: 'Hitung volume dan kebutuhan material beton.',
    icon: SquareStack,
    iconImage: betonIcon,
    path: '/hitung/beton',
    available: true,
  },
  {
    id: 'besi',
    group: 'Pekerjaan Struktur',
    name: 'Berat Besi',
    description: 'Estimasi berat dan biaya besi beton.',
    icon: CircleDot,
    iconImage: besiIcon,
    path: '/hitung/besi',
    available: true,
  },
  {
    id: 'pondasi',
    group: 'Pekerjaan Struktur',
    name: 'Pondasi',
    description: 'Hitung material pondasi batu kali sederhana.',
    icon: Layers3,
    iconImage: pondasiIcon,
    path: '/hitung/pondasi',
    available: true,
  },
  {
    id: 'dinding',
    group: 'Pekerjaan Struktur',
    name: 'Dinding',
    description: 'Hitung kebutuhan bata, semen, dan pasir.',
    icon: Blocks,
    iconImage: dindingIcon,
    path: '/hitung/dinding',
    available: true,
  },
  {
    id: 'tangga',
    group: 'Pekerjaan Struktur',
    name: 'Tangga',
    description: 'Form sederhana estimasi beton tangga.',
    icon: PencilRuler,
    iconImage: tanggaIcon,
    path: '/hitung/tangga',
    available: true,
  },
  {
    id: 'keramik',
    group: 'Pekerjaan Finishing',
    name: 'Keramik',
    description: 'Estimasi keramik, perekat, dan nat lantai.',
    icon: Grid3X3,
    iconImage: keramikIcon,
    path: '/hitung/keramik',
    available: true,
  },
  {
    id: 'cat',
    group: 'Pekerjaan Finishing',
    name: 'Cat',
    description: 'Perkirakan kebutuhan cat tembok.',
    icon: PaintRoller,
    iconImage: catIcon,
    path: '/hitung/cat',
    available: true,
  },
  {
    id: 'plafon',
    group: 'Pekerjaan Finishing',
    name: 'Plafon',
    description: 'Hitung rangka dan panel plafon.',
    icon: Hammer,
    iconImage: plafonIcon,
    path: '/hitung/plafon',
    available: true,
  },
  {
    id: 'wallpaper',
    group: 'Pekerjaan Finishing',
    name: 'Wallpaper',
    description: 'Hitung luas wallpaper dinding.',
    icon: Brush,
    iconImage: wallpaperIcon,
    path: '/hitung/wallpaper',
    available: true,
  },
  {
    id: 'vinyl',
    group: 'Pekerjaan Finishing',
    name: 'Vinyl & SPC',
    description: 'Estimasi kebutuhan lantai vinyl atau SPC.',
    icon: Droplets,
    iconImage: vinylIcon,
    path: '/hitung/vinyl',
    available: true,
  },
]

export const popularCalculators = calculators.filter((calculator) =>
  ['dinding', 'beton', 'baja-ringan', 'keramik', 'cat', 'plafon'].includes(calculator.id),
)

export const calculatorGroups = calculators.reduce((groups, calculator) => {
  const group = groups[calculator.group] || []
  return { ...groups, [calculator.group]: [...group, calculator] }
}, {})
