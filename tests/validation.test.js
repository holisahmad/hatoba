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

