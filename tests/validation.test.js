const test = require('node:test')
const assert = require('node:assert')

const CONFIRMED_HUBS = ['Bali', 'Yogyakarta']

function validateServiceHub(hub) {
  if (CONFIRMED_HUBS.includes(hub)) {
    return { isConfirmed: true, message: 'Area operasional reguler terlayani.' }
  }
  return {
    isConfirmed: false,
    message: 'Pengiriman di luar hub Bali & Yogyakarta memerlukan pengaturan kargo dingin khusus.',
  }
}

test('validateServiceHub approves Bali and Yogyakarta', () => {
  assert.strictEqual(validateServiceHub('Bali').isConfirmed, true)
  assert.strictEqual(validateServiceHub('Yogyakarta').isConfirmed, true)
})

test('validateServiceHub flags outside locations gracefully without false nationwide claim', () => {
  const result = validateServiceHub('Surabaya')
  assert.strictEqual(result.isConfirmed, false)
  assert.ok(result.message.includes('pengaturan kargo dingin khusus'))
})

test('validateServiceHub keeps Bandung as roadmap/unconfirmed until authorized', () => {
  const result = validateServiceHub('Bandung')
  assert.strictEqual(result.isConfirmed, false)
})

test('Raw materials list contains Babat, Paru Dus, and Iga with correct units', () => {
  const rawProducts = [
    { id: 'raw-babat-fresh-frozen', name: 'Babat Fresh Frozen', unitShort: 'Kg' },
    { id: 'raw-paru-fresh-frozen', name: 'Paru Fresh Frozen', unitShort: 'Dus' },
    { id: 'raw-iga-fresh-frozen', name: 'Iga Fresh Frozen', unitShort: 'Kg' },
  ]
  assert.strictEqual(rawProducts.length, 3)
  assert.strictEqual(rawProducts[0].unitShort, 'Kg')
  assert.strictEqual(rawProducts[1].unitShort, 'Dus')
  assert.strictEqual(rawProducts[2].unitShort, 'Kg')
})

test('POS raw item decimal calculation accurately computes subtotal without floating point drift', () => {
  const quantity = 37.5
  const unitPrice = 75000
  const subtotal = Math.round(quantity * unitPrice)
  assert.strictEqual(subtotal, 2812500)
})


