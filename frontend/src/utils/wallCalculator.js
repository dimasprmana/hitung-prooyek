const WALL_PRICES = {
  brick: 1000,
  cement: 72000,
  sand: 280000,
}

export function calculateRedBrickWall({ length, height, openingArea, waste }) {
  const grossArea = Math.max(Number(length) || 0, 0) * Math.max(Number(height) || 0, 0)
  const cleanArea = Math.max(grossArea - Math.max(Number(openingArea) || 0, 0), 0)
  const wasteMultiplier = 1 + Math.max(Number(waste) || 0, 0) / 100

  const bricks = Math.ceil(cleanArea * 70 * wasteMultiplier)
  const cement = Math.ceil(cleanArea * 0.22 * wasteMultiplier * 10) / 10
  const sand = Math.ceil(cleanArea * 0.04 * wasteMultiplier * 100) / 100

  const items = [
    {
      material: 'Bata Merah',
      quantity: bricks,
      unit: 'pcs',
      unitPrice: WALL_PRICES.brick,
      total: bricks * WALL_PRICES.brick,
    },
    {
      material: 'Semen',
      quantity: cement,
      unit: 'sak',
      unitPrice: WALL_PRICES.cement,
      total: cement * WALL_PRICES.cement,
    },
    {
      material: 'Pasir',
      quantity: sand,
      unit: 'm3',
      unitPrice: WALL_PRICES.sand,
      total: sand * WALL_PRICES.sand,
    },
  ]

  return {
    grossArea,
    cleanArea,
    totalCost: items.reduce((sum, item) => sum + item.total, 0),
    items,
  }
}
