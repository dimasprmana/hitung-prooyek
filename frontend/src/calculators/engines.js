const prices = {
  bataMerah: 1000,
  bataRingan75: 11500,
  bataRingan100: 14500,
  batako: 3500,
  semen: 72000,
  pasir: 280000,
  split: 310000,
  besi: 14500,
  bendrat: 22000,
  bajaKanalC: 82000,
  rengBaja: 42000,
  sekrupBaja: 85000,
  gentengMetal: 68000,
  spandek: 76000,
  gentengBeton: 95000,
  gentengKeramik: 135000,
  keramik: 120000,
  granit: 185000,
  homogeneousTile: 240000,
  perekatKeramik: 88000,
  natKeramik: 18000,
  catInterior: 60000,
  catEksterior: 85000,
  primer: 70000,
  gypsum: 65000,
  grc: 78000,
  pvc: 52000,
  hollow: 36000,
  sekrupPlafon: 55000,
  batuKali: 185000,
  wallpaper: 45000,
  lemWallpaper: 35000,
  vinylSticker: 145000,
  vinylPlank: 175000,
  spc: 225000,
  underlayer: 120000,
  skirting: 42000,
}

const concreteMixes = {
  'K-175': { cement: 6.2, sand: 0.54, split: 0.82 },
  'K-200': { cement: 6.7, sand: 0.52, split: 0.82 },
  'K-225': { cement: 7.2, sand: 0.5, split: 0.8 },
  'K-250': { cement: 7.8, sand: 0.48, split: 0.78 },
  'K-300': { cement: 8.8, sand: 0.45, split: 0.76 },
}

const wallMaterials = {
  'Bata Merah': {
    id: 'bata-merah',
    name: 'Bata Merah',
    unit: 'pcs',
    price: prices.bataMerah,
    perM2: 70,
    mortarCement: 0.22,
    mortarSand: 0.04,
  },
  'Bata Ringan AAC 7.5 cm': {
    id: 'bata-ringan-75',
    name: 'Bata Ringan AAC 7.5 cm',
    unit: 'pcs',
    price: prices.bataRingan75,
    perM2: 8.3,
    mortarCement: 0.08,
    mortarSand: 0,
  },
  'Bata Ringan AAC 10 cm': {
    id: 'bata-ringan-100',
    name: 'Bata Ringan AAC 10 cm',
    unit: 'pcs',
    price: prices.bataRingan100,
    perM2: 8.3,
    mortarCement: 0.1,
    mortarSand: 0,
  },
  Batako: {
    id: 'batako',
    name: 'Batako',
    unit: 'pcs',
    price: prices.batako,
    perM2: 12.5,
    mortarCement: 0.16,
    mortarSand: 0.035,
  },
}

function number(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function withWaste(value, waste = 0) {
  return value * (1 + number(waste) / 100)
}

function money(quantity, unitPrice) {
  return Math.round(quantity * unitPrice)
}

function item(materialId, name, quantity, unit, unitPrice, round = true, note = '') {
  if (!Number.isFinite(quantity) || quantity <= 0) return null
  const safeQuantity = round ? Math.ceil(quantity) : Math.ceil(quantity * 100) / 100
  return {
    materialId,
    material: name,
    name,
    quantity: safeQuantity,
    unit,
    unitPrice,
    total: money(safeQuantity, unitPrice),
    totalCost: money(safeQuantity, unitPrice),
    note,
  }
}

function compact(items) {
  return items.filter(Boolean)
}

function total(items) {
  return items.reduce((sum, current) => sum + current.total, 0)
}

function concreteItems(volume, input) {
  const wasteVolume = withWaste(volume, input.waste)
  const mix = input.concreteGrade === 'Campuran Manual'
    ? manualConcreteMix(input)
    : concreteMixes[input.concreteGrade] || concreteMixes['K-225']

  return compact([
    item('semen', 'Semen Portland', wasteVolume * mix.cement, 'sak', prices.semen, false, 'Kebutuhan semen untuk campuran beton.'),
    item('pasir', 'Pasir Beton', wasteVolume * mix.sand, 'm3', prices.pasir, false, 'Agregat halus untuk campuran beton.'),
    item('split', 'Batu Split', wasteVolume * mix.split, 'm3', prices.split, false, 'Agregat kasar untuk campuran beton.'),
  ])
}

function manualConcreteMix(input) {
  const cement = number(input.cementRatio, 1)
  const sand = number(input.sandRatio, 2)
  const split = number(input.aggregateRatio, 3)
  const ratioTotal = cement + sand + split

  return {
    cement: 7.2 * (cement / 1),
    sand: 0.5 * (sand / ratioTotal) * 6,
    split: 0.8 * (split / ratioTotal) * 6,
  }
}

export function calculateWall(input) {
  const grossArea = number(input.length) * number(input.height)
  const cleanArea = Math.max(grossArea - number(input.openingArea), 0)
  const material = wallMaterials[input.wallType] || wallMaterials['Bata Merah']
  const wallArea = withWaste(cleanArea, input.waste)
  const finishMultiplier = input.finishSides === '1 sisi' ? 1 : 2
  const finishArea = cleanArea * finishMultiplier
  const plasterVolume = input.includePlaster ? withWaste(finishArea * (number(input.plasterThickness, 15) / 1000), input.waste) : 0
  const acianArea = input.includeAcian ? withWaste(finishArea, input.waste) : 0

  const items = compact([
    item(material.id, material.name, wallArea * material.perM2, material.unit, material.price, true, 'Material utama pasangan dinding.'),
    item('semen-pasangan', 'Semen Pasangan Dinding', wallArea * material.mortarCement, 'sak', prices.semen, false, 'Semen untuk mortar pasangan dinding.'),
    item('pasir-pasangan', 'Pasir Pasangan Dinding', wallArea * material.mortarSand, 'm3', prices.pasir, false, 'Pasir untuk mortar pasangan dinding.'),
    input.includePlaster && item('semen-plester', 'Semen Plester', plasterVolume * 8.5, 'sak', prices.semen, false, 'Semen untuk plester sesuai sisi finishing.'),
    input.includePlaster && item('pasir-plester', 'Pasir Plester', plasterVolume * 1.15, 'm3', prices.pasir, false, 'Pasir untuk pekerjaan plester.'),
    input.includeAcian && item('semen-acian', 'Semen Acian', acianArea * 0.08, 'sak', prices.semen, false, 'Semen untuk acian permukaan dinding.'),
  ])

  return {
    label: 'Dinding',
    area: cleanArea,
    cleanArea,
    grossArea,
    items,
    totalCost: total(items),
  }
}

export function calculateConcrete(input) {
  const volume = number(input.length) * number(input.width) * number(input.thickness) * number(input.count, 1)
  const items = concreteItems(volume, input)

  return { label: 'Cor Beton', volume, area: volume, items, totalCost: total(items) }
}

export function calculateSteel(input) {
  const diameter = number(input.diameter, 10)
  const length = number(input.lengthPerBar, 12)
  const count = number(input.barCount)
  const weightPerMeter = (diameter * diameter) / 162
  const weight = withWaste(weightPerMeter * length * count, input.waste)
  const items = compact([
    item('besi', input.steelType || 'Besi Beton', weight, 'kg', prices.besi, false, 'Berat besi berdasarkan diameter dan total panjang.'),
    item('bendrat', 'Kawat Bendrat', weight * 0.015, 'kg', prices.bendrat, false, 'Cadangan kawat ikat untuk pekerjaan pembesian.'),
  ])

  return { label: 'Berat Besi', weight, area: weight, items, totalCost: total(items) }
}

export function calculateFoundation(input) {
  const isFootplate = input.foundationType === 'Footplat'
  const volume = number(input.length) * number(input.width) * number(input.height)
  const wasteVolume = withWaste(volume, input.waste)

  if (isFootplate) {
    const items = [
      ...concreteItems(volume, input),
      input.includeRebar && item('besi-footplat', `Tulangan ${input.rebarDiameter || 'D10'}`, wasteVolume * 85, 'kg', prices.besi, false, 'Estimasi kebutuhan tulangan footplat dari volume beton.'),
      input.includeRebar && item('bendrat', 'Kawat Bendrat', wasteVolume * 1.2, 'kg', prices.bendrat, false, 'Kawat ikat tulangan footplat.'),
    ].filter(Boolean)

    return { label: 'Pondasi Footplat', volume, area: volume, items, totalCost: total(items) }
  }

  const items = compact([
    item('batu-kali', 'Batu Kali', wasteVolume * 1.2, 'm3', prices.batuKali, false, 'Material utama pondasi batu kali.'),
    item('semen', 'Semen Adukan Pondasi', wasteVolume * mortarCement(input.mortarMix), 'sak', prices.semen, false, 'Semen untuk adukan pasangan batu kali.'),
    item('pasir', 'Pasir Adukan Pondasi', wasteVolume * mortarSand(input.mortarMix), 'm3', prices.pasir, false, 'Pasir untuk adukan pasangan batu kali.'),
  ])

  return { label: 'Pondasi Batu Kali', volume, area: volume, items, totalCost: total(items) }
}

function mortarCement(mix = '1 : 5') {
  return {
    '1 : 3': 4.8,
    '1 : 4': 4.1,
    '1 : 5': 3.5,
    '1 : 6': 3,
  }[mix] || 3.5
}

function mortarSand(mix = '1 : 5') {
  return {
    '1 : 3': 0.5,
    '1 : 4': 0.53,
    '1 : 5': 0.55,
    '1 : 6': 0.58,
  }[mix] || 0.55
}

export function calculateRoof(input) {
  const baseArea = number(input.length) * number(input.width)
  const slopeFactor = 1 + number(input.slope) / 100
  const roofArea = baseArea * slopeFactor
  const frameArea = withWaste(roofArea, input.waste)
  const trussSpacing = number(input.trussSpacing, 1.2)
  const battenSpacing = number(input.battenSpacing, 0.3)
  const channelLength = number(input.channelLength, 6)
  const battenLength = number(input.battenLength, 6)
  const trussCount = Math.ceil(number(input.length) / trussSpacing) + 1
  const channelBars = (trussCount * number(input.width) * 2.4) / channelLength
  const battenBars = (frameArea / battenSpacing) / battenLength
  const coverWasteArea = withWaste(roofArea, input.roofCoverWaste || 8)

  const items = compact([
    item('kanal-c', 'Kanal C Baja Ringan', channelBars, 'batang', prices.bajaKanalC, true, 'Rangka utama dan kuda-kuda baja ringan.'),
    item('reng-baja', 'Reng Baja Ringan', battenBars, 'batang', prices.rengBaja, true, 'Reng untuk dudukan penutup atap.'),
    item('sekrup-baja', 'Sekrup Baja Ringan', frameArea * 8, 'pcs', prices.sekrupBaja / 1000, true, 'Sekrup untuk sambungan rangka dan reng.'),
    input.includeRoofCover && roofCoverItem(input.roofType, coverWasteArea),
  ])

  return { label: 'Baja Ringan', area: roofArea, items, totalCost: total(items) }
}

function roofCoverItem(type, area) {
  const map = {
    'Genteng Metal': ['genteng-metal', 'Genteng Metal', prices.gentengMetal],
    Spandek: ['spandek', 'Spandek', prices.spandek],
    'Genteng Beton': ['genteng-beton', 'Genteng Beton', prices.gentengBeton],
    'Genteng Keramik': ['genteng-keramik', 'Genteng Keramik', prices.gentengKeramik],
    Custom: ['penutup-atap-custom', 'Penutup Atap Custom', prices.spandek],
  }
  const [id, name, price] = map[type] || map['Genteng Metal']
  return item(id, name, area, 'm2', price, false, 'Penutup atap sesuai pilihan input.')
}

export function calculateTile(input) {
  const area = number(input.area)
  const wasteArea = withWaste(area, input.waste)
  const boxCoverage = number(input.boxCoverage, 1.44)
  const tileType = tilePrice(input.tileType)
  const adhesiveKg = input.includeAdhesive ? withWaste(area * number(input.adhesiveConsumption, 4), input.waste) : 0
  const groutKg = input.includeGrout ? withWaste(area * 0.25, input.waste) : 0
  const patternWaste = input.installPattern === 'Diagonal' ? 1.03 : 1

  const items = compact([
    item(tileType.id, tileType.name, (wasteArea * patternWaste) / boxCoverage, 'dus', tileType.price, true, 'Material lantai sesuai jenis dan ukuran input.'),
    input.includeAdhesive && item('perekat-keramik', 'Perekat Keramik', adhesiveKg / 20, 'sak', prices.perekatKeramik, true, 'Perekat untuk pemasangan keramik/granit.'),
    input.includeGrout && item('nat-keramik', 'Nat Keramik', groutKg, 'kg', prices.natKeramik, false, 'Nat untuk mengisi celah antar keramik.'),
  ])

  return { label: 'Keramik', area: wasteArea, items, totalCost: total(items) }
}

function tilePrice(type) {
  if (type === 'Granit') return { id: 'granit', name: 'Granit', price: prices.granit }
  if (type === 'Homogeneous Tile') return { id: 'homogeneous-tile', name: 'Homogeneous Tile', price: prices.homogeneousTile }
  return { id: 'keramik', name: 'Keramik', price: prices.keramik }
}

export function calculatePaint(input) {
  const area = number(input.area)
  const coats = number(input.coats, 2)
  const coverage = number(input.coverage, 10)
  const paintPrice = input.paintType === 'Eksterior' ? prices.catEksterior : prices.catInterior
  const liters = withWaste((area * coats) / coverage, input.waste)
  const primerLiters = input.usePrimer
    ? withWaste((area * number(input.primerCoats, 1)) / number(input.primerCoverage, 10), input.waste)
    : 0
  const items = compact([
    item('cat-tembok', `Cat Tembok ${input.paintType || 'Interior'}`, liters, 'liter', paintPrice, false, 'Cat utama sesuai jumlah lapisan dan daya sebar.'),
    input.usePrimer && item('primer', 'Primer / Sealer', primerLiters, 'liter', prices.primer, false, 'Lapisan dasar sebelum cat utama.'),
  ])

  return { label: 'Cat Tembok', area, items, totalCost: total(items) }
}

export function calculateCeiling(input) {
  const area = number(input.area)
  const wasteArea = withWaste(area, input.waste)
  const board = ceilingBoard(input)
  const mainHollow = (area / number(input.mainHollowSpacing, 0.8)) / number(input.hollowLength, 4)
  const secondaryHollow = (area / number(input.secondaryHollowSpacing, 0.6)) / number(input.hollowLength, 4)
  const dropArea = input.hasDropCeiling
    ? 2 * (number(input.dropLength) + number(input.dropWidth)) * number(input.dropHeight)
    : 0
  const totalBoardArea = withWaste(area + dropArea, input.waste)

  const items = compact([
    item(board.id, board.name, totalBoardArea / board.coverage, board.unit, board.price, true, 'Panel/plafon utama sesuai jenis pilihan.'),
    item('hollow-utama', `Rangka ${input.frameType || 'Hollow'}`, withWaste(mainHollow, input.frameWaste || 5), 'batang', prices.hollow, true, 'Hollow utama plafon.'),
    item('hollow-pembagi', 'Hollow Pembagi', withWaste(secondaryHollow, input.frameWaste || 5), 'batang', prices.hollow, true, 'Hollow pembagi/rangka silang plafon.'),
    item('sekrup-plafon', 'Sekrup Plafon', wasteArea * 12, 'pcs', prices.sekrupPlafon / 1000, true, 'Sekrup untuk pemasangan panel plafon.'),
  ])

  return { label: 'Plafon', area: totalBoardArea, items, totalCost: total(items) }
}

function ceilingBoard(input) {
  if (input.ceilingType === 'PVC') {
    return {
      id: 'plafon-pvc',
      name: 'Panel PVC',
      coverage: number(input.panelWidth, 0.2) * number(input.panelLength, 4),
      unit: 'batang',
      price: prices.pvc,
    }
  }

  return {
    id: input.ceilingType === 'GRC' ? 'grc' : 'gypsum',
    name: input.ceilingType === 'GRC' ? 'Papan GRC' : 'Papan Gypsum',
    coverage: number(input.boardLength, 2.4) * number(input.boardWidth, 1.2),
    unit: 'lembar',
    price: input.ceilingType === 'GRC' ? prices.grc : prices.gypsum,
  }
}

export function calculateStairs(input) {
  const steps = number(input.stepCount)
  const width = number(input.width)
  const tread = number(input.tread, 0.3)
  const stairArea = steps * width * tread
  const landingArea = input.includeLanding ? number(input.landingLength) * number(input.landingWidth) : 0
  const thickness = number(input.slabThickness, 12) / 100
  const volume = (stairArea + landingArea) * thickness
  const items = concreteItems(volume, input)

  return { label: 'Tangga', volume, area: stairArea + landingArea, items, totalCost: total(items) }
}

export function calculateWallpaper(input) {
  const area = number(input.area)
  const wasteArea = withWaste(area, input.waste)
  const rollArea = number(input.rollWidth, 0.53) * number(input.rollLength, 10)
  const repeatWaste = input.motifType === 'Bermotif' ? 1.08 : 1
  const rolls = (wasteArea * repeatWaste) / rollArea
  const items = compact([
    item('wallpaper', `Wallpaper ${input.motifType || 'Polos'}`, rolls, 'roll', prices.wallpaper, true, 'Jumlah roll wallpaper sesuai lebar dan panjang roll.'),
    item('lem-wallpaper', 'Lem Wallpaper', wasteArea / 20, 'pak', prices.lemWallpaper, true, 'Lem untuk pemasangan wallpaper.'),
  ])

  return { label: 'Wallpaper', area: wasteArea, items, totalCost: total(items) }
}

export function calculateVinyl(input) {
  const area = number(input.area)
  const wasteArea = withWaste(area, input.waste)
  const material = vinylMaterial(input.vinylType)
  const boxCoverage = input.productMethod === 'Berdasarkan Ukuran Plank'
    ? (number(input.plankLength) / 1000) * (number(input.plankWidth) / 1000) * number(input.piecesPerBox, 1)
    : number(input.boxCoverage, 2.2)
  const patternWaste = input.installPattern === 'Diagonal' ? 1.03 : 1
  const items = compact([
    item(material.id, material.name, (wasteArea * patternWaste) / boxCoverage, 'box', material.price, true, 'Material lantai vinyl/SPC sesuai metode produk.'),
    input.includeUnderlayer && item('underlayer', 'Underlayer', wasteArea / number(input.underlayerCoverage, 20), 'roll', prices.underlayer, true, 'Lapisan bawah untuk lantai vinyl/SPC.'),
    input.includeSkirting && item('skirting', 'Skirting', perimeter(input) / number(input.skirtingLength, 2.4), 'batang', prices.skirting, true, 'Lis skirting tepi ruangan.'),
  ])

  return { label: 'Vinyl & SPC', area: wasteArea, items, totalCost: total(items) }
}

function vinylMaterial(type) {
  if (type === 'Vinyl Sticker') return { id: 'vinyl-sticker', name: 'Vinyl Sticker', price: prices.vinylSticker }
  if (type === 'Vinyl Plank') return { id: 'vinyl-plank', name: 'Vinyl Plank', price: prices.vinylPlank }
  return { id: 'vinyl-spc', name: 'SPC Click Lock', price: prices.spc }
}

function perimeter(input) {
  const length = number(input.roomLength)
  const width = number(input.roomWidth)
  return length && width ? 2 * (length + width) : Math.sqrt(number(input.area)) * 4
}

export const calculatorEngines = {
  'baja-ringan': calculateRoof,
  beton: calculateConcrete,
  besi: calculateSteel,
  pondasi: calculateFoundation,
  dinding: calculateWall,
  tangga: calculateStairs,
  keramik: calculateTile,
  cat: calculatePaint,
  plafon: calculateCeiling,
  wallpaper: calculateWallpaper,
  vinyl: calculateVinyl,
}

export function calculateByType(type, input) {
  const engine = calculatorEngines[type]
  if (!engine) throw new Error(`Calculator type tidak dikenal: ${type}`)
  return engine(input)
}

export function aggregateMaterials(works = []) {
  const grouped = new Map()

  works.forEach((work) => {
    ;(work.resultData?.items || []).forEach((material) => {
      const key = `${material.materialId || material.name}-${material.unit}`
      const current = grouped.get(key) || {
        materialId: material.materialId,
        name: material.name || material.material,
        material: material.material || material.name,
        quantity: 0,
        unit: material.unit,
        unitPrice: material.unitPrice || 0,
        totalCost: 0,
      }

      current.quantity += Number(material.quantity) || 0
      current.totalCost += Number(material.total || material.totalCost) || 0
      grouped.set(key, current)
    })
  })

  return Array.from(grouped.values()).map((material) => ({
    ...material,
    quantity: Math.ceil(material.quantity * 100) / 100,
  }))
}
