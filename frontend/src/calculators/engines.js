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

export function resolveMaterial(materials = [], identifier, fallback = {}) {
  const fallbackPrice = Number(fallback.price) || 0
  const fallbackUnit = fallback.unit ?? ''
  const fallbackName = fallback.name ?? String(identifier || '')
  const fallbackId = fallback.id ?? identifier

  if (!Array.isArray(materials) || materials.length === 0) {
    return {
      id: fallbackId,
      name: fallbackName,
      unit: fallbackUnit,
      price: fallbackPrice,
      fromDb: false,
    }
  }

  const byId = materials.find((m) => String(m.id) === String(identifier))
  if (byId) {
    return {
      id: byId.id,
      name: byId.name,
      unit: byId.unit,
      price: Number(byId.price) || 0,
      fromDb: true,
    }
  }

  const clean = (str) =>
    String(str || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '')

  const key = clean(identifier)

  const byExact = materials.find((m) => clean(m.name) === key)
  if (byExact) {
    return {
      id: byExact.id,
      name: byExact.name,
      unit: byExact.unit,
      price: Number(byExact.price) || 0,
      fromDb: true,
    }
  }

  const byPartial = materials.find((m) => {
    const matKey = clean(m.name)
    return (
      (key.length >= 3 && matKey.includes(key)) ||
      (matKey.length >= 3 && key.includes(matKey))
    )
  })
  if (byPartial) {
    return {
      id: byPartial.id,
      name: byPartial.name,
      unit: byPartial.unit,
      price: Number(byPartial.price) || 0,
      fromDb: true,
    }
  }

  return {
    id: fallbackId,
    name: fallbackName,
    unit: fallbackUnit,
    price: fallbackPrice,
    fromDb: false,
  }
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

function concreteItems(volume, input, materials = []) {
  const wasteVolume = withWaste(volume, input.waste)
  const mix = input.concreteGrade === 'Campuran Manual'
    ? manualConcreteMix(input)
    : concreteMixes[input.concreteGrade] || concreteMixes['K-225']

  const matSemen = resolveMaterial(materials, 'semen', {
    id: 'semen',
    name: 'Semen Portland',
    unit: 'sak',
    price: prices.semen,
  })
  const matPasir = resolveMaterial(materials, 'pasir', {
    id: 'pasir',
    name: 'Pasir Beton',
    unit: 'm3',
    price: prices.pasir,
  })
  const matSplit = resolveMaterial(materials, 'split', {
    id: 'split',
    name: 'Batu Split',
    unit: 'm3',
    price: prices.split,
  })

  return compact([
    item(matSemen.id, matSemen.name, wasteVolume * mix.cement, matSemen.unit, matSemen.price, false, 'Kebutuhan semen untuk campuran beton.'),
    item(matPasir.id, matPasir.name, wasteVolume * mix.sand, matPasir.unit, matPasir.price, false, 'Agregat halus untuk campuran beton.'),
    item(matSplit.id, matSplit.name, wasteVolume * mix.split, matSplit.unit, matSplit.price, false, 'Agregat kasar untuk campuran beton.'),
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

export function calculateWall(input, materials = []) {
  const grossArea = number(input.length) * number(input.height)
  const cleanArea = Math.max(grossArea - number(input.openingArea), 0)
  const defaultWallMat = wallMaterials[input.wallType] || wallMaterials['Bata Merah']
  const wallMatResolved = resolveMaterial(materials, input.wallType || 'Bata Merah', {
    id: defaultWallMat.id,
    name: defaultWallMat.name,
    unit: defaultWallMat.unit,
    price: defaultWallMat.price,
  })

  const matSemen = resolveMaterial(materials, 'semen', {
    id: 'semen',
    name: 'Semen Portland',
    unit: 'sak',
    price: prices.semen,
  })
  const matPasir = resolveMaterial(materials, 'pasir', {
    id: 'pasir',
    name: 'Pasir',
    unit: 'm3',
    price: prices.pasir,
  })

  const wallArea = withWaste(cleanArea, input.waste)
  const finishMultiplier = input.finishSides === '1 sisi' ? 1 : 2
  const finishArea = cleanArea * finishMultiplier
  const plasterVolume = input.includePlaster ? withWaste(finishArea * (number(input.plasterThickness, 15) / 1000), input.waste) : 0
  const acianArea = input.includeAcian ? withWaste(finishArea, input.waste) : 0

  const items = compact([
    item(wallMatResolved.id, wallMatResolved.name, wallArea * defaultWallMat.perM2, wallMatResolved.unit, wallMatResolved.price, true, 'Material utama pasangan dinding.'),
    item(matSemen.id, 'Semen Pasangan Dinding', wallArea * defaultWallMat.mortarCement, matSemen.unit, matSemen.price, false, 'Semen untuk mortar pasangan dinding.'),
    item(matPasir.id, 'Pasir Pasangan Dinding', wallArea * defaultWallMat.mortarSand, matPasir.unit, matPasir.price, false, 'Pasir untuk mortar pasangan dinding.'),
    input.includePlaster && item(matSemen.id, 'Semen Plester', plasterVolume * 8.5, matSemen.unit, matSemen.price, false, 'Semen untuk plester sesuai sisi finishing.'),
    input.includePlaster && item(matPasir.id, 'Pasir Plester', plasterVolume * 1.15, matPasir.unit, matPasir.price, false, 'Pasir untuk pekerjaan plester.'),
    input.includeAcian && item(matSemen.id, 'Semen Acian', acianArea * 0.08, matSemen.unit, matSemen.price, false, 'Semen untuk acian permukaan dinding.'),
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

export function calculateConcrete(input, materials = []) {
  const volume = number(input.length) * number(input.width) * number(input.thickness) * number(input.count, 1)
  const items = concreteItems(volume, input, materials)

  return { label: 'Cor Beton', volume, area: volume, items, totalCost: total(items) }
}

export function calculateSteel(input, materials = []) {
  const diameter = number(input.diameter, 10)
  const length = number(input.lengthPerBar, 12)
  const count = number(input.barCount)
  const weightPerMeter = (diameter * diameter) / 162
  const weight = withWaste(weightPerMeter * length * count, input.waste)

  const matBesi = resolveMaterial(materials, 'besi', {
    id: 'besi',
    name: input.steelType || 'Besi Beton',
    unit: 'kg',
    price: prices.besi,
  })
  const matBendrat = resolveMaterial(materials, 'bendrat', {
    id: 'bendrat',
    name: 'Kawat Bendrat',
    unit: 'kg',
    price: prices.bendrat,
  })

  const items = compact([
    item(matBesi.id, input.steelType || matBesi.name, weight, matBesi.unit, matBesi.price, false, 'Berat besi berdasarkan diameter dan total panjang.'),
    item(matBendrat.id, matBendrat.name, weight * 0.015, matBendrat.unit, matBendrat.price, false, 'Cadangan kawat ikat untuk pekerjaan pembesian.'),
  ])

  return { label: 'Berat Besi', weight, area: weight, items, totalCost: total(items) }
}

export function calculateFoundation(input, materials = []) {
  const isFootplate = input.foundationType === 'Footplat'
  const volume = number(input.length) * number(input.width) * number(input.height)
  const wasteVolume = withWaste(volume, input.waste)

  if (isFootplate) {
    const matBesi = resolveMaterial(materials, 'besi', {
      id: 'besi',
      name: 'Besi Beton',
      unit: 'kg',
      price: prices.besi,
    })
    const matBendrat = resolveMaterial(materials, 'bendrat', {
      id: 'bendrat',
      name: 'Kawat Bendrat',
      unit: 'kg',
      price: prices.bendrat,
    })

    const items = [
      ...concreteItems(volume, input, materials),
      input.includeRebar && item(matBesi.id, `Tulangan ${input.rebarDiameter || 'D10'}`, wasteVolume * 85, matBesi.unit, matBesi.price, false, 'Estimasi kebutuhan tulangan footplat dari volume beton.'),
      input.includeRebar && item(matBendrat.id, matBendrat.name, wasteVolume * 1.2, matBendrat.unit, matBendrat.price, false, 'Kawat ikat tulangan footplat.'),
    ].filter(Boolean)

    return { label: 'Pondasi Footplat', volume, area: volume, items, totalCost: total(items) }
  }

  const matBatuKali = resolveMaterial(materials, 'batu-kali', {
    id: 'batu-kali',
    name: 'Batu Kali',
    unit: 'm3',
    price: prices.batuKali,
  })
  const matSemen = resolveMaterial(materials, 'semen', {
    id: 'semen',
    name: 'Semen Adukan Pondasi',
    unit: 'sak',
    price: prices.semen,
  })
  const matPasir = resolveMaterial(materials, 'pasir', {
    id: 'pasir',
    name: 'Pasir Adukan Pondasi',
    unit: 'm3',
    price: prices.pasir,
  })

  const items = compact([
    item(matBatuKali.id, matBatuKali.name, wasteVolume * 1.2, matBatuKali.unit, matBatuKali.price, false, 'Material utama pondasi batu kali.'),
    item(matSemen.id, matSemen.name, wasteVolume * mortarCement(input.mortarMix), matSemen.unit, matSemen.price, false, 'Semen untuk adukan pasangan batu kali.'),
    item(matPasir.id, matPasir.name, wasteVolume * mortarSand(input.mortarMix), matPasir.unit, matPasir.price, false, 'Pasir untuk adukan pasangan batu kali.'),
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

export function calculateRoof(input, materials = []) {
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

  const matKanal = resolveMaterial(materials, 'kanal-c', {
    id: 'kanal-c',
    name: 'Kanal C Baja Ringan',
    unit: 'batang',
    price: prices.bajaKanalC,
  })
  const matReng = resolveMaterial(materials, 'reng', {
    id: 'reng-baja',
    name: 'Reng Baja Ringan',
    unit: 'batang',
    price: prices.rengBaja,
  })
  const matSekrup = resolveMaterial(materials, 'sekrup-baja', {
    id: 'sekrup-baja',
    name: 'Sekrup Baja Ringan',
    unit: 'pcs',
    price: prices.sekrupBaja / 1000,
  })

  const items = compact([
    item(matKanal.id, matKanal.name, channelBars, matKanal.unit, matKanal.price, true, 'Rangka utama dan kuda-kuda baja ringan.'),
    item(matReng.id, matReng.name, battenBars, matReng.unit, matReng.price, true, 'Reng untuk dudukan penutup atap.'),
    item(matSekrup.id, matSekrup.name, frameArea * 8, matSekrup.unit, matSekrup.price, true, 'Sekrup untuk sambungan rangka dan reng.'),
    input.includeRoofCover && roofCoverItem(input.roofType, coverWasteArea, materials),
  ])

  return { label: 'Baja Ringan', area: roofArea, items, totalCost: total(items) }
}

function roofCoverItem(type, area, materials = []) {
  const map = {
    'Genteng Metal': ['genteng-metal', 'Genteng Metal', prices.gentengMetal],
    Spandek: ['spandek', 'Spandek', prices.spandek],
    'Genteng Beton': ['genteng-beton', 'Genteng Beton', prices.gentengBeton],
    'Genteng Keramik': ['genteng-keramik', 'Genteng Keramik', prices.gentengKeramik],
    Custom: ['penutup-atap-custom', 'Penutup Atap Custom', prices.spandek],
  }
  const [defaultId, defaultName, defaultPrice] = map[type] || map['Genteng Metal']
  const mat = resolveMaterial(materials, defaultName, {
    id: defaultId,
    name: defaultName,
    unit: 'm2',
    price: defaultPrice,
  })
  return item(mat.id, mat.name, area, mat.unit || 'm2', mat.price, false, 'Penutup atap sesuai pilihan input.')
}

export function calculateTile(input, materials = []) {
  const area = number(input.area)
  const wasteArea = withWaste(area, input.waste)
  const boxCoverage = number(input.boxCoverage, 1.44)
  const tileType = tilePrice(input.tileType, materials)
  const adhesiveKg = input.includeAdhesive ? withWaste(area * number(input.adhesiveConsumption, 4), input.waste) : 0
  const groutKg = input.includeGrout ? withWaste(area * 0.25, input.waste) : 0
  const patternWaste = input.installPattern === 'Diagonal' ? 1.03 : 1

  const matPerekat = resolveMaterial(materials, 'perekat', {
    id: 'perekat-keramik',
    name: 'Perekat Keramik',
    unit: 'sak',
    price: prices.perekatKeramik,
  })
  const matNat = resolveMaterial(materials, 'nat', {
    id: 'nat-keramik',
    name: 'Nat Keramik',
    unit: 'kg',
    price: prices.natKeramik,
  })

  const items = compact([
    item(tileType.id, tileType.name, (wasteArea * patternWaste) / boxCoverage, tileType.unit || 'dus', tileType.price, true, 'Material lantai sesuai jenis dan ukuran input.'),
    input.includeAdhesive && item(matPerekat.id, matPerekat.name, adhesiveKg / 20, matPerekat.unit || 'sak', matPerekat.price, true, 'Perekat untuk pemasangan keramik/granit.'),
    input.includeGrout && item(matNat.id, matNat.name, groutKg, matNat.unit || 'kg', matNat.price, false, 'Nat untuk mengisi celah antar keramik.'),
  ])

  return { label: 'Keramik', area: wasteArea, items, totalCost: total(items) }
}

function tilePrice(type, materials = []) {
  if (type === 'Granit') {
    return resolveMaterial(materials, 'Granit', { id: 'granit', name: 'Granit', unit: 'dus', price: prices.granit })
  }
  if (type === 'Homogeneous Tile') {
    return resolveMaterial(materials, 'Homogeneous Tile', { id: 'homogeneous-tile', name: 'Homogeneous Tile', unit: 'dus', price: prices.homogeneousTile })
  }
  return resolveMaterial(materials, 'Keramik', { id: 'keramik', name: 'Keramik', unit: 'dus', price: prices.keramik })
}

export function calculatePaint(input, materials = []) {
  const area = number(input.area)
  const coats = number(input.coats, 2)
  const coverage = number(input.coverage, 10)
  const defaultPaintPrice = input.paintType === 'Eksterior' ? prices.catEksterior : prices.catInterior
  const paintMat = resolveMaterial(materials, 'Cat Tembok', {
    id: 'cat-tembok',
    name: `Cat Tembok ${input.paintType || 'Interior'}`,
    unit: 'liter',
    price: defaultPaintPrice,
  })
  const primerMat = resolveMaterial(materials, 'primer', {
    id: 'primer',
    name: 'Primer / Sealer',
    unit: 'liter',
    price: prices.primer,
  })

  const liters = withWaste((area * coats) / coverage, input.waste)
  const primerLiters = input.usePrimer
    ? withWaste((area * number(input.primerCoats, 1)) / number(input.primerCoverage, 10), input.waste)
    : 0
  const items = compact([
    item(paintMat.id, paintMat.name, liters, paintMat.unit || 'liter', paintMat.price, false, 'Cat utama sesuai jumlah lapisan dan daya sebar.'),
    input.usePrimer && item(primerMat.id, primerMat.name, primerLiters, primerMat.unit || 'liter', primerMat.price, false, 'Lapisan dasar sebelum cat utama.'),
  ])

  return { label: 'Cat Tembok', area, items, totalCost: total(items) }
}

export function calculateCeiling(input, materials = []) {
  const area = number(input.area)
  const wasteArea = withWaste(area, input.waste)
  const board = ceilingBoard(input, materials)
  const mainHollow = (area / number(input.mainHollowSpacing, 0.8)) / number(input.hollowLength, 4)
  const secondaryHollow = (area / number(input.secondaryHollowSpacing, 0.6)) / number(input.hollowLength, 4)
  const dropArea = input.hasDropCeiling
    ? 2 * (number(input.dropLength) + number(input.dropWidth)) * number(input.dropHeight)
    : 0
  const totalBoardArea = withWaste(area + dropArea, input.waste)

  const matHollowUtama = resolveMaterial(materials, 'hollow', {
    id: 'hollow-utama',
    name: `Rangka ${input.frameType || 'Hollow'}`,
    unit: 'batang',
    price: prices.hollow,
  })
  const matHollowPembagi = resolveMaterial(materials, 'hollow', {
    id: 'hollow-pembagi',
    name: 'Hollow Pembagi',
    unit: 'batang',
    price: prices.hollow,
  })
  const matSekrup = resolveMaterial(materials, 'sekrup-plafon', {
    id: 'sekrup-plafon',
    name: 'Sekrup Plafon',
    unit: 'pcs',
    price: prices.sekrupPlafon / 1000,
  })

  const items = compact([
    item(board.id, board.name, totalBoardArea / board.coverage, board.unit, board.price, true, 'Panel/plafon utama sesuai jenis pilihan.'),
    item(matHollowUtama.id, matHollowUtama.name, withWaste(mainHollow, input.frameWaste || 5), matHollowUtama.unit || 'batang', matHollowUtama.price, true, 'Hollow utama plafon.'),
    item(matHollowPembagi.id, matHollowPembagi.name, withWaste(secondaryHollow, input.frameWaste || 5), matHollowPembagi.unit || 'batang', matHollowPembagi.price, true, 'Hollow pembagi/rangka silang plafon.'),
    item(matSekrup.id, matSekrup.name, wasteArea * 12, matSekrup.unit || 'pcs', matSekrup.price, true, 'Sekrup untuk pemasangan panel plafon.'),
  ])

  return { label: 'Plafon', area: totalBoardArea, items, totalCost: total(items) }
}

function ceilingBoard(input, materials = []) {
  if (input.ceilingType === 'PVC') {
    const mat = resolveMaterial(materials, 'pvc', {
      id: 'plafon-pvc',
      name: 'Panel PVC',
      unit: 'batang',
      price: prices.pvc,
    })
    return {
      id: mat.id,
      name: mat.name,
      coverage: number(input.panelWidth, 0.2) * number(input.panelLength, 4),
      unit: mat.unit || 'batang',
      price: mat.price,
    }
  }

  const isGrc = input.ceilingType === 'GRC'
  const mat = resolveMaterial(materials, isGrc ? 'GRC' : 'Papan Gypsum', {
    id: isGrc ? 'grc' : 'gypsum',
    name: isGrc ? 'Papan GRC' : 'Papan Gypsum',
    unit: 'lembar',
    price: isGrc ? prices.grc : prices.gypsum,
  })

  return {
    id: mat.id,
    name: mat.name,
    coverage: number(input.boardLength, 2.4) * number(input.boardWidth, 1.2),
    unit: mat.unit || 'lembar',
    price: mat.price,
  }
}

export function calculateStairs(input, materials = []) {
  const steps = number(input.stepCount)
  const width = number(input.width)
  const tread = number(input.tread, 0.3)
  const stairArea = steps * width * tread
  const landingArea = input.includeLanding ? number(input.landingLength) * number(input.landingWidth) : 0
  const thickness = number(input.slabThickness, 12) / 100
  const volume = (stairArea + landingArea) * thickness
  const items = concreteItems(volume, input, materials)

  return { label: 'Tangga', volume, area: stairArea + landingArea, items, totalCost: total(items) }
}

export function calculateWallpaper(input, materials = []) {
  const area = number(input.area)
  const wasteArea = withWaste(area, input.waste)
  const rollArea = number(input.rollWidth, 0.53) * number(input.rollLength, 10)
  const repeatWaste = input.motifType === 'Bermotif' ? 1.08 : 1
  const rolls = (wasteArea * repeatWaste) / rollArea

  const matWallpaper = resolveMaterial(materials, 'Wallpaper', {
    id: 'wallpaper',
    name: `Wallpaper ${input.motifType || 'Polos'}`,
    unit: 'roll',
    price: prices.wallpaper,
  })
  const matLem = resolveMaterial(materials, 'lem-wallpaper', {
    id: 'lem-wallpaper',
    name: 'Lem Wallpaper',
    unit: 'pak',
    price: prices.lemWallpaper,
  })

  const items = compact([
    item(matWallpaper.id, matWallpaper.name, rolls, matWallpaper.unit || 'roll', matWallpaper.price, true, 'Jumlah roll wallpaper sesuai lebar dan panjang roll.'),
    item(matLem.id, matLem.name, wasteArea / 20, matLem.unit || 'pak', matLem.price, true, 'Lem untuk pemasangan wallpaper.'),
  ])

  return { label: 'Wallpaper', area: wasteArea, items, totalCost: total(items) }
}

export function calculateVinyl(input, materials = []) {
  const area = number(input.area)
  const wasteArea = withWaste(area, input.waste)
  const material = vinylMaterial(input.vinylType, materials)
  const boxCoverage = input.productMethod === 'Berdasarkan Ukuran Plank'
    ? (number(input.plankLength) / 1000) * (number(input.plankWidth) / 1000) * number(input.piecesPerBox, 1)
    : number(input.boxCoverage, 2.2)
  const patternWaste = input.installPattern === 'Diagonal' ? 1.03 : 1

  const matUnderlayer = resolveMaterial(materials, 'underlayer', {
    id: 'underlayer',
    name: 'Underlayer',
    unit: 'roll',
    price: prices.underlayer,
  })
  const matSkirting = resolveMaterial(materials, 'skirting', {
    id: 'skirting',
    name: 'Skirting',
    unit: 'batang',
    price: prices.skirting,
  })

  const items = compact([
    item(material.id, material.name, (wasteArea * patternWaste) / boxCoverage, material.unit || 'box', material.price, true, 'Material lantai vinyl/SPC sesuai metode produk.'),
    input.includeUnderlayer && item(matUnderlayer.id, matUnderlayer.name, wasteArea / number(input.underlayerCoverage, 20), matUnderlayer.unit || 'roll', matUnderlayer.price, true, 'Lapisan bawah untuk lantai vinyl/SPC.'),
    input.includeSkirting && item(matSkirting.id, matSkirting.name, perimeter(input) / number(input.skirtingLength, 2.4), matSkirting.unit || 'batang', matSkirting.price, true, 'Lis skirting tepi ruangan.'),
  ])

  return { label: 'Vinyl & SPC', area: wasteArea, items, totalCost: total(items) }
}

function vinylMaterial(type, materials = []) {
  if (type === 'Vinyl Sticker') {
    return resolveMaterial(materials, 'Vinyl Sticker', { id: 'vinyl-sticker', name: 'Vinyl Sticker', unit: 'box', price: prices.vinylSticker })
  }
  if (type === 'Vinyl Plank') {
    return resolveMaterial(materials, 'Vinyl Plank', { id: 'vinyl-plank', name: 'Vinyl Plank', unit: 'box', price: prices.vinylPlank })
  }
  return resolveMaterial(materials, 'Vinyl & SPC', { id: 'vinyl-spc', name: 'SPC Click Lock', unit: 'box', price: prices.spc })
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

export function calculateByType(type, input, materials = []) {
  const engine = calculatorEngines[type]
  if (!engine) throw new Error(`Calculator type tidak dikenal: ${type}`)
  return engine(input, materials)
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
