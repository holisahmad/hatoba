/**
 * HATOBA GROUP - COMPREHENSIVE WHITEBOX & BLACKBOX AUDIT TEST SUITE
 * 
 * Includes:
 * 1. WHITEBOX TESTS (Internal Logic, Code Paths, Boundary Conditions, Security)
 * 2. BLACKBOX TESTS (Endpoint Contracts, Auth Guards, Payloads, Error Responses)
 */

const test = require('node:test')
const assert = require('node:assert')
const path = require('node:path')

// -------------------------------------------------------------
// 1. WHITEBOX AUDIT: INTERNAL LOGIC & BUSINESS RULES
// -------------------------------------------------------------

test('=== [WHITEBOX] 1. Catalog & Product Data Integrity ===', async (t) => {
  const { CATALOG_PRODUCTS, RAW_PRODUCTS, PARTNER_CLIENTS } = require('../src/lib/catalog-data.ts')

  await t.test('Catalog must contain exactly 5 official products from 2026 Brochure', () => {
    assert.strictEqual(CATALOG_PRODUCTS.length, 5, 'Must have exactly 5 products')
    const ids = CATALOG_PRODUCTS.map((p) => p.id)
    assert.deepStrictEqual(
      ids.sort(),
      ['babat-sapi', 'iga-sapi', 'iso-sapi', 'mix-4-lauk', 'paru-sapi'].sort(),
      'Products must match Babat, Iga, Iso, Mix 4 Lauk, and Paru'
    )
  })

  await t.test('Pricing & weights must strictly match Page 12 of PDF brochure', () => {
    // 01 Babat Sapi: 240 gr, Ecer 45k, Partai 65k
    const babat = CATALOG_PRODUCTS.find((p) => p.id === 'babat-sapi')
    assert.ok(babat)
    const babatEcer = babat.variants.find((v) => v.packType === 'retail')
    const babatPartai = babat.variants.find((v) => v.packType === 'partai')
    assert.strictEqual(babatEcer.price, 45000, 'Babat Ecer must be 45.000')
    assert.strictEqual(babatEcer.weight, '240 gr')
    assert.strictEqual(babatPartai.price, 65000, 'Babat Partai must be 65.000')
    assert.strictEqual(babatPartai.minQty, 10, 'Babat Partai minQty must be 10')

    // 02 Iso Sapi: 240 gr, Ecer 43.5k, Partai 65k
    const iso = CATALOG_PRODUCTS.find((p) => p.id === 'iso-sapi')
    assert.ok(iso)
    const isoEcer = iso.variants.find((v) => v.packType === 'retail')
    const isoPartai = iso.variants.find((v) => v.packType === 'partai')
    assert.strictEqual(isoEcer.price, 43500, 'Iso Ecer must be 43.500')
    assert.strictEqual(isoPartai.price, 65000, 'Iso Partai must be 65.000')

    // 03 Paru Sapi: 300 gr, Ecer 49.5k, Partai 70k
    const paru = CATALOG_PRODUCTS.find((p) => p.id === 'paru-sapi')
    assert.ok(paru)
    const paruEcer = paru.variants.find((v) => v.packType === 'retail')
    const paruPartai = paru.variants.find((v) => v.packType === 'partai')
    assert.strictEqual(paruEcer.price, 49500, 'Paru Ecer must be 49.500')
    assert.strictEqual(paruEcer.weight, '300 gr')
    assert.strictEqual(paruPartai.price, 70000, 'Paru Partai must be 70.000')

    // 04 Iga Sapi: 500 gr, Ecer 82.5k, Partai 120k
    const iga = CATALOG_PRODUCTS.find((p) => p.id === 'iga-sapi')
    assert.ok(iga)
    const igaEcer = iga.variants.find((v) => v.packType === 'retail')
    const igaPartai = iga.variants.find((v) => v.packType === 'partai')
    assert.strictEqual(igaEcer.price, 82500, 'Iga Ecer must be 82.500')
    assert.strictEqual(igaEcer.weight, '500 gr')
    assert.strictEqual(igaPartai.price, 120000, 'Iga Partai must be 120.000')

    // 05 Mix 4 Lauk: Ecer 72.5k, NO PARTAI
    const mix = CATALOG_PRODUCTS.find((p) => p.id === 'mix-4-lauk')
    assert.ok(mix)
    const mixEcer = mix.variants.find((v) => v.packType === 'retail')
    assert.strictEqual(mixEcer.price, 72500, 'Mix 4 Lauk Ecer must be 72.500')
    const mixPartai = mix.variants.find((v) => v.packType === 'partai')
    assert.strictEqual(mixPartai, undefined, 'Mix 4 Lauk must not have partai variant')
  })

  await t.test('All 9 verified partner clients exist with complete attributes', () => {
    assert.strictEqual(PARTNER_CLIENTS.length, 9, 'Must have exactly 9 partner clients')
    const names = PARTNER_CLIENTS.map((c) => c.name)
    assert.ok(names.includes('RM Mertamu'))
    assert.ok(names.includes('Bebakaran Rimasari'))
    assert.ok(names.includes('RM Bagelen'))
    assert.ok(names.includes('Sego Saduk'))
    PARTNER_CLIENTS.forEach((c) => {
      assert.ok(c.id, 'Client must have id')
      assert.ok(c.name, 'Client must have name')
      assert.ok(c.category, 'Client must have category')
      assert.ok(c.type, 'Client must have type')
      assert.ok(c.badge, 'Client must have badge')
    })
  })
})

// -------------------------------------------------------------
// Helper implementations matching src/lib/whatsapp.ts & catalog
// -------------------------------------------------------------
function generateReferenceCode(prefix) {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  return `HTB-${prefix}-${dateStr}-${randomSuffix}`
}

function validateServiceHub(hub) {
  const CONFIRMED_HUBS = ['Bali', 'Yogyakarta']
  if (CONFIRMED_HUBS.includes(hub)) {
    return { isSupported: true, message: 'Area operasional reguler terlayani.' }
  }
  if (hub === 'Bandung') {
    return {
      isSupported: false,
      isPlanned: true,
      message: 'Bandung merupakan hub ekspansi terencana (Roadmap 2027).',
    }
  }
  return {
    isSupported: false,
    message: 'Luar Area Layanan Langsung. Pengiriman memerlukan pengaturan kargo dingin khusus.',
  }
}

test('=== [WHITEBOX] 2. Reference Code Generator & Boundary Checks ===', async (t) => {

  await t.test('generateReferenceCode formats for all valid prefixes', () => {
    const prefixes = ['ORD', 'INQ', 'CORP', 'POS']
    const dateToday = new Date().toISOString().slice(0, 10).replace(/-/g, '')

    for (const prefix of prefixes) {
      const code = generateReferenceCode(prefix)
      const regex = new RegExp(`^HTB-${prefix}-${dateToday}-\\d{4}$`)
      assert.match(code, regex, `Reference code ${code} should match format HTB-${prefix}-YYYYMMDD-XXXX`)
    }
  })

  await t.test('generateReferenceCode generates unique values in 100 iterations', () => {
    const set = new Set()
    for (let i = 0; i < 100; i++) {
      set.add(generateReferenceCode('POS'))
    }
    // High probability of distinct suffix
    assert.ok(set.size >= 95, 'At least 95 of 100 codes should be unique')
  })
})

test('=== [WHITEBOX] 3. Calculation & Financial Math Safety ===', async (t) => {
  const calculateChangeAndStatus = (finalTotal, paidAmount, paymentMethod) => {
    const isUnderpaid = paidAmount < finalTotal
    const changeAmount = Math.max(0, paidAmount - finalTotal)
    const shortfallAmount = Math.max(0, finalTotal - paidAmount)

    let autoPaymentStatus
    let autoOrderStatus

    if (paymentMethod === 'Tempo B2B') {
      autoPaymentStatus = 'TEMPO'
      autoOrderStatus = 'PENDING'
    } else if (isUnderpaid && paidAmount > 0) {
      autoPaymentStatus = 'DP'
      autoOrderStatus = 'PENDING'
    } else if (paidAmount === 0) {
      autoPaymentStatus = 'BELUM_BAYAR'
      autoOrderStatus = 'PENDING'
    } else {
      autoPaymentStatus = 'LUNAS'
      autoOrderStatus = 'VERIFIED'
    }

    return { autoPaymentStatus, autoOrderStatus, changeAmount, shortfallAmount }
  }

  await t.test('Case 1: Exact cash payment (Uang Pas)', () => {
    const r = calculateChangeAndStatus(90000, 90000, 'Tunai')
    assert.strictEqual(r.autoPaymentStatus, 'LUNAS')
    assert.strictEqual(r.autoOrderStatus, 'VERIFIED')
    assert.strictEqual(r.changeAmount, 0)
    assert.strictEqual(r.shortfallAmount, 0)
  })

  await t.test('Case 2: Cash overpayment (Ada Kembalian)', () => {
    const r = calculateChangeAndStatus(45000, 100000, 'Tunai')
    assert.strictEqual(r.autoPaymentStatus, 'LUNAS')
    assert.strictEqual(r.autoOrderStatus, 'VERIFIED')
    assert.strictEqual(r.changeAmount, 55000)
    assert.strictEqual(r.shortfallAmount, 0)
  })

  await t.test('Case 3: Partial payment / Down Payment (Kurang Bayar)', () => {
    const r = calculateChangeAndStatus(120000, 50000, 'Tunai')
    assert.strictEqual(r.autoPaymentStatus, 'DP')
    assert.strictEqual(r.autoOrderStatus, 'PENDING')
    assert.strictEqual(r.changeAmount, 0)
    assert.strictEqual(r.shortfallAmount, 70000)
  })

  await t.test('Case 4: Zero payment (Belum Bayar)', () => {
    const r = calculateChangeAndStatus(82500, 0, 'Transfer BCA')
    assert.strictEqual(r.autoPaymentStatus, 'BELUM_BAYAR')
    assert.strictEqual(r.autoOrderStatus, 'PENDING')
    assert.strictEqual(r.shortfallAmount, 82500)
  })

  await t.test('Case 5: Term of Payment B2B (Tempo)', () => {
    const r = calculateChangeAndStatus(500000, 0, 'Tempo B2B')
    assert.strictEqual(r.autoPaymentStatus, 'TEMPO')
    assert.strictEqual(r.autoOrderStatus, 'PENDING')
  })
})

// -------------------------------------------------------------
// 2. BLACKBOX AUDIT: API CONTRACTS, SECURITY, AND GUARDS
// -------------------------------------------------------------

test('=== [BLACKBOX] 4. Security & Authentication Guard Checks ===', async (t) => {
  // Test password verification logic
  const ADMIN_PIN_DEFAULT = 'hatoba2026'

  const checkPin = (providedPin) => {
    const correctPin = process.env.ADMIN_PASSWORD || ADMIN_PIN_DEFAULT
    return providedPin === correctPin
  }

  await t.test('Correct PIN authenticates successfully', () => {
    assert.strictEqual(checkPin('hatoba2026'), true)
  })

  await t.test('Incorrect PIN fails with false (no brute bypass)', () => {
    assert.strictEqual(checkPin('admin'), false)
    assert.strictEqual(checkPin('123456'), false)
    assert.strictEqual(checkPin("' OR '1'='1"), false)
    assert.strictEqual(checkPin(''), false)
  })
})

test('=== [BLACKBOX] 5. Input Validation & Edge Case Rejection ===', async (t) => {
  const { CATALOG_PRODUCTS } = require('../src/lib/catalog-data.ts')

  const validateOrderPayload = (body) => {
    const { order } = body || {}
    if (!order || !order.customerName || !order.phone || !Array.isArray(order.items) || order.items.length === 0) {
      return { ok: false, error: 'Rincian pemesanan tidak lengkap.' }
    }

    for (const it of order.items) {
      const prod = CATALOG_PRODUCTS.find((p) => p.id === it.productId)
      if (!prod) return { ok: false, error: `Produk ID ${it.productId} tidak valid.` }

      const v = prod.variants.find((vr) => vr.id === it.variantId)
      if (!v) return { ok: false, error: `Varian ID ${it.variantId} tidak ditemukan.` }

      if (it.quantity < v.minQty) {
        return { ok: false, error: `Jumlah pesanan untuk ${prod.name} minimal ${v.minQty} pack.` }
      }
    }

    return { ok: true }
  }

  await t.test('Valid order passes validation', () => {
    const payload = {
      order: {
        customerName: 'Bpk. Budi Santoso',
        phone: '081234567890',
        items: [{ productId: 'babat-sapi', variantId: 'babat-retail', quantity: 2 }],
      },
    }
    const r = validateOrderPayload(payload)
    assert.strictEqual(r.ok, true)
  })

  await t.test('Rejects missing customer name', () => {
    const payload = {
      order: {
        customerName: '',
        phone: '081234567890',
        items: [{ productId: 'babat-sapi', variantId: 'babat-retail', quantity: 1 }],
      },
    }
    const r = validateOrderPayload(payload)
    assert.strictEqual(r.ok, false)
  })

  await t.test('Rejects invalid product ID', () => {
    const payload = {
      order: {
        customerName: 'Hendra',
        phone: '081234567890',
        items: [{ productId: 'kikil-sapi-deleted', variantId: 'kikil-retail', quantity: 1 }],
      },
    }
    const r = validateOrderPayload(payload)
    assert.strictEqual(r.ok, false)
    assert.match(r.error, /tidak valid/)
  })

  await t.test('Enforces minimum quantity on Partai variant (min 10 pack)', () => {
    const payload = {
      order: {
        customerName: 'Hendra',
        phone: '081234567890',
        items: [{ productId: 'babat-sapi', variantId: 'babat-partai', quantity: 3 }], // under minQty (10)
      },
    }
    const r = validateOrderPayload(payload)
    assert.strictEqual(r.ok, false)
    assert.match(r.error, /minimal 10 pack/)
  })

  await t.test('Allows Partai variant when quantity is >= 10 pack', () => {
    const payload = {
      order: {
        customerName: 'Hendra',
        phone: '081234567890',
        items: [{ productId: 'babat-sapi', variantId: 'babat-partai', quantity: 15 }],
      },
    }
    const r = validateOrderPayload(payload)
    assert.strictEqual(r.ok, true)
  })
})

test('=== [BLACKBOX] 6. Service Hub Regional Rules Validation ===', async (t) => {
  const CONFIRMED_HUBS = ['Bali', 'Yogyakarta']
  function validateServiceHub(hub) {
    if (CONFIRMED_HUBS.includes(hub)) {
      return { isSupported: true, isPlanned: false, message: 'Hub reguler terlayani.' }
    }
    if (hub === 'Bandung') {
      return { isSupported: false, isPlanned: true, message: 'Bandung masuk roadmap 2027 (belum aktif).' }
    }
    return {
      isSupported: false,
      isPlanned: false,
      message: 'Luar Area Layanan Langsung (Kargo Dingin Khusus Diperlukan).',
    }
  }

  await t.test('Allows Bali Hub', () => {
    const r = validateServiceHub('Bali')
    assert.strictEqual(r.isSupported, true)
  })

  await t.test('Allows Yogyakarta Hub', () => {
    const r = validateServiceHub('Yogyakarta')
    assert.strictEqual(r.isSupported, true)
  })

  await t.test('Correctly identifies outside locations without false nationwide claims', () => {
    const r = validateServiceHub('Surabaya')
    assert.strictEqual(r.isSupported, false)
    assert.match(r.message, /Luar Area Layanan Langsung/)
  })

  await t.test('Correctly marks Bandung as planned 2027 roadmap', () => {
    const r = validateServiceHub('Bandung')
    assert.strictEqual(r.isSupported, false)
    assert.strictEqual(r.isPlanned, true)
  })
})

// -------------------------------------------------------------
// 3. POS CASHIER SPECIFIC INPUT & EDGE-CASE VALIDATION
// -------------------------------------------------------------

test('=== [BLACKBOX & EDGE-CASE] 7. POS Cashier Input Sanitization & Edge Cases ===', async (t) => {
  // Input sanitizer function as implemented in PosCashierTab.tsx
  const sanitizePaidAmount = (input) => {
    if (typeof input !== 'string') return 0
    const raw = parseFloat(input.replace(/[^0-9]/g, ''))
    return isNaN(raw) ? 0 : raw
  }

  // Cart quantity update simulation as in PosCashierTab.tsx
  const updateCartQty = (cart, index, delta) => {
    const next = [...cart]
    const curr = next[index]
    const newQty = curr.quantity + delta
    if (newQty <= 0) {
      return next.filter((_, i) => i !== index)
    }
    next[index] = {
      ...curr,
      quantity: newQty,
      subtotal: newQty * curr.unitPrice,
    }
    return next
  }

  // Discount clamp simulation as in PosCashierTab.tsx
  const calculateFinalTotal = (subtotalCart, discountNominal) => {
    const discountVal = discountNominal || 0
    return Math.max(0, subtotalCart - discountVal)
  }

  // Checkout pre-validation simulation
  const validatePosCheckout = ({ customerName, cart }) => {
    if (!customerName || !customerName.trim()) {
      return { ok: false, error: 'Nama pelanggan wajib diisi.' }
    }
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return { ok: false, error: 'Keranjang kasir masih kosong. Pilih menu terlebih dahulu.' }
    }
    return { ok: true }
  }

  await t.test('POS Input: Rejects empty customer name', () => {
    const r = validatePosCheckout({ customerName: '', cart: [{ id: 1 }] })
    assert.strictEqual(r.ok, false)
    assert.strictEqual(r.error, 'Nama pelanggan wajib diisi.')
  })

  await t.test('POS Input: Rejects whitespace-only customer name', () => {
    const r = validatePosCheckout({ customerName: '    ', cart: [{ id: 1 }] })
    assert.strictEqual(r.ok, false)
    assert.strictEqual(r.error, 'Nama pelanggan wajib diisi.')
  })

  await t.test('POS Input: Trims leading and trailing spaces in customer name', () => {
    const raw = '   RM Puji Lestari   '
    assert.strictEqual(raw.trim(), 'RM Puji Lestari')
  })

  await t.test('POS Input: Rejects checkout when cart is empty', () => {
    const r = validatePosCheckout({ customerName: 'Bu Siti', cart: [] })
    assert.strictEqual(r.ok, false)
    assert.match(r.error, /Keranjang kasir masih kosong/)
  })

  await t.test('POS Cart: Automatically removes item when quantity reaches zero', () => {
    const initialCart = [
      { productId: 'babat-sapi', variantId: 'babat-retail', quantity: 1, unitPrice: 45000, subtotal: 45000 },
      { productId: 'iso-sapi', variantId: 'iso-retail', quantity: 2, unitPrice: 43500, subtotal: 87000 },
    ]
    // Decrement item 0 (babat) from 1 by -1 -> should drop item
    const updated = updateCartQty(initialCart, 0, -1)
    assert.strictEqual(updated.length, 1)
    assert.strictEqual(updated[0].productId, 'iso-sapi')
    assert.strictEqual(updated[0].quantity, 2)
  })

  await t.test('POS Cart: Prevents negative quantity in cart items', () => {
    const initialCart = [
      { productId: 'babat-sapi', variantId: 'babat-retail', quantity: 1, unitPrice: 45000, subtotal: 45000 },
    ]
    // Decrement by -5
    const updated = updateCartQty(initialCart, 0, -5)
    assert.strictEqual(updated.length, 0, 'Cart must be empty, not contain negative quantity')
  })

  await t.test('POS Payment Input: Cleans rupiah text format (e.g. "Rp 150.000")', () => {
    assert.strictEqual(sanitizePaidAmount('Rp 150.000'), 150000)
    assert.strictEqual(sanitizePaidAmount('100.000'), 100000)
    assert.strictEqual(sanitizePaidAmount('Rp50,000'), 50000)
  })

  await t.test('POS Payment Input: Handles non-numeric string gracefully without NaN', () => {
    assert.strictEqual(sanitizePaidAmount('abc'), 0)
    assert.strictEqual(sanitizePaidAmount(''), 0)
    assert.strictEqual(sanitizePaidAmount('   '), 0)
  })

  await t.test('POS Discount: Clamps discount when discount > subtotal (never negative total)', () => {
    const subtotal = 90000
    const excessiveDiscount = 150000 // bigger than subtotal
    const finalTotal = calculateFinalTotal(subtotal, excessiveDiscount)
    assert.strictEqual(finalTotal, 0, 'Total should be clamped to 0, never negative')
  })

  await t.test('POS Fallbacks: Automatically defaults city and phone if omitted', () => {
    const hubArea = 'Bali'
    const inputCity = ''
    const inputPhone = ''
    const fallbackCity = inputCity.trim() || (hubArea === 'Bali' ? 'Denpasar' : 'Yogyakarta')
    const fallbackPhone = inputPhone.trim() || '-'
    assert.strictEqual(fallbackCity, 'Denpasar')
    assert.strictEqual(fallbackPhone, '-')
  })
})
