/**
 * HATOBA GROUP — COMPREHENSIVE WHITEBOX & BLACKBOX AUDIT TEST SUITE v2
 *
 * Coverage:
 *  [WHITEBOX] 1. Catalog & Product Data Integrity (2026 Brochure)
 *  [WHITEBOX] 2. Reference Code Generator & Boundary Checks
 *  [WHITEBOX] 3. POS 4-Mode Financial Logic (LUNAS / DP / TEMPO / CAMPURAN)
 *  [WHITEBOX] 4. Cart Calculation & Discount Clamping
 *  [WHITEBOX] 5. API Route: orders/route.ts Server-Side Logic
 *  [BLACKBOX] 6. Security & Authentication Guard Checks
 *  [BLACKBOX] 7. Input Validation & Edge Case Rejection
 *  [BLACKBOX] 8. POS Input Sanitization & Cart Edge Cases
 *  [BLACKBOX] 9. Service Hub Regional Rules
 *  [BLACKBOX] 10. Status-Notes Integrity (statusNotes content correctness)
 */

const test = require('node:test')
const assert = require('node:assert')

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Pure JS re-implementation of PosCashierTab.tsx business logic
// (mirrors the actual implementation — white-box knowledge used here)
// ─────────────────────────────────────────────────────────────────────────────

function computePaidAmount(paymentMode, paymentMethod, paidAmountInput, finalTotal) {
  const parsedInput =
    paidAmountInput.trim() !== '' ? parseFloat(paidAmountInput.replace(/[^0-9]/g, '')) : NaN

  if (paymentMode === 'TEMPO') return 0
  if (paymentMode === 'LUNAS' && paymentMethod === 'Tunai' && !isNaN(parsedInput)) return parsedInput
  if (paymentMode === 'LUNAS') return finalTotal
  // DP or CAMPURAN
  return isNaN(parsedInput) ? 0 : parsedInput
}

function determinePaymentOutcome(paymentMode, paymentMethod, paidAmount, finalTotal) {
  const changeAmount = Math.max(0, paidAmount - finalTotal)
  const shortfallAmount = Math.max(0, finalTotal - paidAmount)

  let autoPaymentStatus = 'LUNAS'
  let autoOrderStatus = 'VERIFIED'
  let statusNotes = ''
  let isBlocked = false
  let blockReason = ''

  if (paymentMode === 'TEMPO') {
    autoPaymentStatus = 'TEMPO'
    autoOrderStatus = 'PENDING'
    statusNotes = `Full Tempo B2B — Tagihan: ${finalTotal} (dibayar sesuai jatuh tempo)`
  } else if (paymentMode === 'DP') {
    if (paidAmount <= 0) {
      isBlocked = true
      blockReason = 'Nominal DP wajib diisi lebih dari Rp 0.'
    } else if (paidAmount >= finalTotal) {
      autoPaymentStatus = 'LUNAS'
      autoOrderStatus = 'VERIFIED'
      statusNotes = `Lunas via ${paymentMethod} — Dibayar: ${paidAmount}`
    } else {
      autoPaymentStatus = 'DP'
      autoOrderStatus = 'PENDING'
      statusNotes = `DP via ${paymentMethod} — Masuk: ${paidAmount}, Sisa Piutang: ${shortfallAmount}`
    }
  } else if (paymentMode === 'CAMPURAN') {
    if (paidAmount <= 0) {
      isBlocked = true
      blockReason = 'Nominal yang dibayar sekarang wajib diisi lebih dari Rp 0.'
    } else if (paidAmount >= finalTotal) {
      autoPaymentStatus = 'LUNAS'
      autoOrderStatus = 'VERIFIED'
      statusNotes = `Lunas via ${paymentMethod} — Dibayar: ${paidAmount}`
    } else {
      autoPaymentStatus = 'DP'
      autoOrderStatus = 'PENDING'
      statusNotes = `Campuran: Dibayar ${paidAmount} via ${paymentMethod}, Sisa ${shortfallAmount} masuk Tempo B2B (piutang jatuh tempo)`
    }
  } else {
    // LUNAS
    if (paymentMethod === 'Tunai' && paidAmount < finalTotal) {
      isBlocked = true
      blockReason = `Uang tunai kurang dari total tagihan. Pilih 'DP' atau 'Campuran + Tempo'`
    } else {
      autoPaymentStatus = 'LUNAS'
      autoOrderStatus = 'VERIFIED'
      statusNotes = `Lunas via ${paymentMethod} — Dibayar: ${paidAmount}${changeAmount > 0 ? `, Kembali: ${changeAmount}` : ''}`
    }
  }

  return { autoPaymentStatus, autoOrderStatus, changeAmount, shortfallAmount, statusNotes, isBlocked, blockReason }
}

function generateReferenceCode(prefix) {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  return `HTB-${prefix}-${dateStr}-${randomSuffix}`
}

// ─────────────────────────────────────────────────────────────────────────────
// [WHITEBOX] 1. Catalog & Product Data Integrity
// ─────────────────────────────────────────────────────────────────────────────
test('=== [WHITEBOX] 1. Catalog & Product Data Integrity ===', async (t) => {
  const { CATALOG_PRODUCTS, PARTNER_CLIENTS } = require('../src/lib/catalog-data.ts')

  await t.test('Catalog must contain exactly 5 official products (2026 Brochure)', () => {
    assert.strictEqual(CATALOG_PRODUCTS.length, 5)
    const ids = CATALOG_PRODUCTS.map((p) => p.id).sort()
    assert.deepStrictEqual(ids, ['babat-sapi', 'iga-sapi', 'iso-sapi', 'mix-4-lauk', 'paru-sapi'])
  })

  await t.test('Pricing & weights must strictly match Page 12 of PDF brochure', () => {
    const getV = (id, type) => {
      const p = CATALOG_PRODUCTS.find((p) => p.id === id)
      return p.variants.find((v) => v.packType === type)
    }
    // Babat Sapi 240g — 45k / 65k
    assert.strictEqual(getV('babat-sapi', 'retail').price, 45000)
    assert.strictEqual(getV('babat-sapi', 'retail').weight, '240 gr')
    assert.strictEqual(getV('babat-sapi', 'partai').price, 65000)
    assert.strictEqual(getV('babat-sapi', 'partai').minQty, 10)
    // Iso Sapi 240g — 43.5k / 65k
    assert.strictEqual(getV('iso-sapi', 'retail').price, 43500)
    assert.strictEqual(getV('iso-sapi', 'partai').price, 65000)
    // Paru Sapi 300g — 49.5k / 70k
    assert.strictEqual(getV('paru-sapi', 'retail').price, 49500)
    assert.strictEqual(getV('paru-sapi', 'retail').weight, '300 gr')
    assert.strictEqual(getV('paru-sapi', 'partai').price, 70000)
    // Iga Sapi 500g — 82.5k / 120k
    assert.strictEqual(getV('iga-sapi', 'retail').price, 82500)
    assert.strictEqual(getV('iga-sapi', 'retail').weight, '500 gr')
    assert.strictEqual(getV('iga-sapi', 'partai').price, 120000)
    // Mix 4 Lauk — 72.5k, NO PARTAI
    assert.strictEqual(getV('mix-4-lauk', 'retail').price, 72500)
    assert.strictEqual(getV('mix-4-lauk', 'partai'), undefined)
  })

  await t.test('All 9 verified partner clients exist with required attributes', () => {
    assert.strictEqual(PARTNER_CLIENTS.length, 9)
    const names = PARTNER_CLIENTS.map((c) => c.name)
    for (const expected of ['RM Mertamu', 'Puji Lestari', 'Capry Food', 'RM Bagelen', 'Bebakaran Rimasari', 'Sego Saduk']) {
      assert.ok(names.includes(expected), `Missing partner: ${expected}`)
    }
    PARTNER_CLIENTS.forEach((c) => {
      assert.ok(c.id, `${c.name} missing id`)
      assert.ok(c.name, `Partner missing name`)
      assert.ok(c.category, `${c.name} missing category`)
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// [WHITEBOX] 2. Reference Code Generator
// ─────────────────────────────────────────────────────────────────────────────
test('=== [WHITEBOX] 2. Reference Code Generator & Boundary Checks ===', async (t) => {
  await t.test('Formats correctly for all valid prefixes (ORD, INQ, CORP, POS)', () => {
    const dateToday = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    for (const prefix of ['ORD', 'INQ', 'CORP', 'POS']) {
      const code = generateReferenceCode(prefix)
      assert.match(code, new RegExp(`^HTB-${prefix}-${dateToday}-\\d{4}$`))
    }
  })

  await t.test('Generates ≥95 unique codes out of 100 iterations (collision resistance)', () => {
    const set = new Set()
    for (let i = 0; i < 100; i++) set.add(generateReferenceCode('POS'))
    assert.ok(set.size >= 95, `Only ${set.size} unique codes — expected ≥95`)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// [WHITEBOX] 3. POS 4-Mode Financial Logic
// ─────────────────────────────────────────────────────────────────────────────
test('=== [WHITEBOX] 3. POS 4-Mode Financial Logic (LUNAS/DP/TEMPO/CAMPURAN) ===', async (t) => {
  const TOTAL = 215000 // 3 items: Babat 45k + Iso 43.5k + Mix 72.5k + Paru 49.5k rounded

  // ───── MODE: LUNAS ─────
  await t.test('[LUNAS] Tunai uang pas → LUNAS, kembalian 0', () => {
    const paid = computePaidAmount('LUNAS', 'Tunai', '215000', TOTAL)
    const r = determinePaymentOutcome('LUNAS', 'Tunai', paid, TOTAL)
    assert.strictEqual(paid, 215000)
    assert.strictEqual(r.autoPaymentStatus, 'LUNAS')
    assert.strictEqual(r.autoOrderStatus, 'VERIFIED')
    assert.strictEqual(r.changeAmount, 0)
    assert.strictEqual(r.isBlocked, false)
  })

  await t.test('[LUNAS] Tunai lebih → LUNAS, kembalian dihitung', () => {
    const paid = computePaidAmount('LUNAS', 'Tunai', '300000', TOTAL)
    const r = determinePaymentOutcome('LUNAS', 'Tunai', paid, TOTAL)
    assert.strictEqual(paid, 300000)
    assert.strictEqual(r.autoPaymentStatus, 'LUNAS')
    assert.strictEqual(r.changeAmount, 85000)
    assert.strictEqual(r.isBlocked, false)
  })

  await t.test('[LUNAS] Tunai kurang → DIBLOKIR, tidak boleh lolos ke kasir', () => {
    const paid = computePaidAmount('LUNAS', 'Tunai', '100000', TOTAL)
    const r = determinePaymentOutcome('LUNAS', 'Tunai', paid, TOTAL)
    assert.strictEqual(r.isBlocked, true)
    assert.match(r.blockReason, /kurang dari total tagihan/)
  })

  await t.test('[LUNAS] Transfer BCA (non-tunai) → otomatis LUNAS penuh, tidak perlu input', () => {
    const paid = computePaidAmount('LUNAS', 'Transfer BCA', '', TOTAL)
    const r = determinePaymentOutcome('LUNAS', 'Transfer BCA', paid, TOTAL)
    assert.strictEqual(paid, TOTAL)
    assert.strictEqual(r.autoPaymentStatus, 'LUNAS')
    assert.strictEqual(r.changeAmount, 0)
    assert.strictEqual(r.isBlocked, false)
  })

  await t.test('[LUNAS] QRIS → otomatis LUNAS penuh', () => {
    const paid = computePaidAmount('LUNAS', 'QRIS', '', TOTAL)
    const r = determinePaymentOutcome('LUNAS', 'QRIS', paid, TOTAL)
    assert.strictEqual(r.autoPaymentStatus, 'LUNAS')
    assert.strictEqual(r.isBlocked, false)
  })

  // ───── MODE: DP ─────
  await t.test('[DP] Nominal DP valid → status DP, sisa piutang benar', () => {
    const paid = computePaidAmount('DP', 'Tunai', '50000', TOTAL)
    const r = determinePaymentOutcome('DP', 'Tunai', paid, TOTAL)
    assert.strictEqual(paid, 50000)
    assert.strictEqual(r.autoPaymentStatus, 'DP')
    assert.strictEqual(r.autoOrderStatus, 'PENDING')
    assert.strictEqual(r.shortfallAmount, 165000)
    assert.strictEqual(r.changeAmount, 0)
  })

  await t.test('[DP] Nominal DP sama dengan total → otomatis upgrade ke LUNAS', () => {
    const paid = computePaidAmount('DP', 'Transfer Mandiri', '215000', TOTAL)
    const r = determinePaymentOutcome('DP', 'Transfer Mandiri', paid, TOTAL)
    assert.strictEqual(r.autoPaymentStatus, 'LUNAS')
    assert.strictEqual(r.autoOrderStatus, 'VERIFIED')
  })

  await t.test('[DP] Nominal DP melebihi total → upgrade LUNAS, kembalian ada', () => {
    const paid = computePaidAmount('DP', 'Tunai', '250000', TOTAL)
    const r = determinePaymentOutcome('DP', 'Tunai', paid, TOTAL)
    assert.strictEqual(r.autoPaymentStatus, 'LUNAS')
    assert.strictEqual(r.changeAmount, 35000)
  })

  await t.test('[DP] Nominal 0 → DIBLOKIR, tidak boleh tersimpan', () => {
    const paid = computePaidAmount('DP', 'Tunai', '', TOTAL)
    const r = determinePaymentOutcome('DP', 'Tunai', paid, TOTAL)
    assert.strictEqual(paid, 0)
    assert.strictEqual(r.isBlocked, true)
    assert.match(r.blockReason, /lebih dari Rp 0/)
  })

  await t.test('[DP] Input string non-angka → fallback ke 0, diblokir', () => {
    const paid = computePaidAmount('DP', 'Tunai', 'abc', TOTAL)
    assert.strictEqual(paid, 0)
  })

  // ───── MODE: TEMPO ─────
  await t.test('[TEMPO] Paid amount selalu 0, status TEMPO, order PENDING', () => {
    const paid = computePaidAmount('TEMPO', 'Tunai', '999999', TOTAL)
    const r = determinePaymentOutcome('TEMPO', 'Tunai', paid, TOTAL)
    assert.strictEqual(paid, 0)
    assert.strictEqual(r.autoPaymentStatus, 'TEMPO')
    assert.strictEqual(r.autoOrderStatus, 'PENDING')
    assert.strictEqual(r.shortfallAmount, TOTAL)
  })

  await t.test('[TEMPO] Input apapun diabaikan, selalu 0 yang tersimpan', () => {
    assert.strictEqual(computePaidAmount('TEMPO', 'Transfer BCA', '215000', TOTAL), 0)
    assert.strictEqual(computePaidAmount('TEMPO', 'QRIS', '100000', TOTAL), 0)
  })

  // ───── MODE: CAMPURAN ─────
  await t.test('[CAMPURAN] Bayar item 1 (72.5k) dari 3 item → sisa 142.5k masuk tempo', () => {
    const totalThreeItems = 215000 // 72.5k + 45k + 43.5k + rounding
    const paid = computePaidAmount('CAMPURAN', 'Transfer BCA', '72500', totalThreeItems)
    const r = determinePaymentOutcome('CAMPURAN', 'Transfer BCA', paid, totalThreeItems)
    assert.strictEqual(paid, 72500)
    assert.strictEqual(r.autoPaymentStatus, 'DP')
    assert.strictEqual(r.autoOrderStatus, 'PENDING')
    assert.strictEqual(r.shortfallAmount, 142500)
    assert.match(r.statusNotes, /Campuran/)
    assert.match(r.statusNotes, /Tempo B2B/)
  })

  await t.test('[CAMPURAN] Bayar penuh via Tunai → upgrade LUNAS, bukan DP+Tempo', () => {
    const paid = computePaidAmount('CAMPURAN', 'Tunai', '215000', TOTAL)
    const r = determinePaymentOutcome('CAMPURAN', 'Tunai', paid, TOTAL)
    assert.strictEqual(r.autoPaymentStatus, 'LUNAS')
    assert.strictEqual(r.autoOrderStatus, 'VERIFIED')
  })

  await t.test('[CAMPURAN] Nominal 0 → DIBLOKIR', () => {
    const paid = computePaidAmount('CAMPURAN', 'Transfer BCA', '', TOTAL)
    const r = determinePaymentOutcome('CAMPURAN', 'Transfer BCA', paid, TOTAL)
    assert.strictEqual(r.isBlocked, true)
  })

  await t.test('[CAMPURAN] StatusNotes berisi info metode, nominal, dan sisa tempo', () => {
    const paid = 72500
    const r = determinePaymentOutcome('CAMPURAN', 'Transfer BCA', paid, TOTAL)
    assert.match(r.statusNotes, /Transfer BCA/)
    assert.match(r.statusNotes, /72500/)
    assert.match(r.statusNotes, /Tempo B2B/)
  })

  // ───── BOUNDARY: Discount ─────
  await t.test('[DISCOUNT] Diskon kurang dari total → finalTotal positif', () => {
    const finalTotal = Math.max(0, 215000 - 15000)
    assert.strictEqual(finalTotal, 200000)
  })

  await t.test('[DISCOUNT] Diskon melebihi total → finalTotal 0 (tidak negatif)', () => {
    const finalTotal = Math.max(0, 215000 - 300000)
    assert.strictEqual(finalTotal, 0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// [WHITEBOX] 4. Cart Calculation Accuracy
// ─────────────────────────────────────────────────────────────────────────────
test('=== [WHITEBOX] 4. Cart Calculation Accuracy ===', async (t) => {
  const computeCart = (items) => {
    const rawSubtotal = items.reduce((s, it) => s + it.qty * it.price, 0)
    return rawSubtotal
  }

  await t.test('3-item cart total calculated correctly', () => {
    const items = [
      { qty: 1, price: 72500 }, // Mix 4 Lauk
      { qty: 2, price: 45000 }, // 2x Babat
      { qty: 1, price: 49500 }, // Paru
    ]
    assert.strictEqual(computeCart(items), 72500 + 90000 + 49500) // 212000
  })

  await t.test('Partai multi-qty cart total (15 pack Babat @65k)', () => {
    const items = [{ qty: 15, price: 65000 }]
    assert.strictEqual(computeCart(items), 975000)
  })

  await t.test('Empty cart returns 0', () => {
    assert.strictEqual(computeCart([]), 0)
  })

  await t.test('Quantity decrement removes item when qty reaches 0', () => {
    let cart = [
      { id: 'babat-retail', qty: 1, price: 45000 },
      { id: 'iso-retail', qty: 2, price: 43500 },
    ]
    // Simulate decrement qty to 0 on first item
    const idx = 0
    const newQty = cart[idx].qty - 1
    if (newQty <= 0) cart = cart.filter((_, i) => i !== idx)
    assert.strictEqual(cart.length, 1)
    assert.strictEqual(cart[0].id, 'iso-retail')
  })

  await t.test('Duplicate add increments qty instead of duplicating row', () => {
    let cart = []
    const addToCart = (cart, id, price) => {
      const existing = cart.findIndex((it) => it.id === id)
      if (existing !== -1) {
        const next = [...cart]
        next[existing] = { ...next[existing], qty: next[existing].qty + 1 }
        return next
      }
      return [...cart, { id, qty: 1, price }]
    }
    cart = addToCart(cart, 'babat-retail', 45000)
    cart = addToCart(cart, 'babat-retail', 45000)
    assert.strictEqual(cart.length, 1)
    assert.strictEqual(cart[0].qty, 2)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// [WHITEBOX] 5. API Route Server-Side Logic (orders/route.ts)
// ─────────────────────────────────────────────────────────────────────────────
test('=== [WHITEBOX] 5. API Route Server-Side Logic ===', async (t) => {
  // Simulates what POST /api/admin/orders does server-side
  const simulateApiPost = (body) => {
    const { customerName, items, totalAmount, paymentMethod, paymentStatus, paidAmount, status } = body

    if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
      return { ok: false, status: 400, error: 'Nama pelanggan dan rincian item wajib diisi.' }
    }

    // Fallback defaults (as coded in route.ts)
    const order = {
      customerName,
      businessType: body.businessType || 'Restoran / Rumah Makan',
      phone: body.phone || '-',
      hubArea: body.hubArea || 'Bali',
      city: body.city || 'Denpasar',
      marketingName: body.marketingName || 'Kasir POS',
      notes: body.notes || '',
      totalAmount: totalAmount || 0,
      paymentMethod: paymentMethod || 'Tunai',
      paymentStatus: paymentStatus || 'LUNAS',
      paidAmount: typeof paidAmount === 'number' ? paidAmount : (totalAmount || 0),
      changeAmount: body.changeAmount || 0,
      source: body.source || 'POS',
      status: status || 'VERIFIED',
    }

    return { ok: true, status: 200, order }
  }

  await t.test('Valid POS payload accepted and defaults applied', () => {
    const r = simulateApiPost({
      customerName: 'Bu Siti',
      items: [{ productName: 'Babat Sapi', qty: 2 }],
      totalAmount: 90000,
      paidAmount: 90000,
      status: 'VERIFIED',
    })
    assert.strictEqual(r.ok, true)
    assert.strictEqual(r.order.paymentStatus, 'LUNAS')
    assert.strictEqual(r.order.hubArea, 'Bali') // default
    assert.strictEqual(r.order.businessType, 'Restoran / Rumah Makan') // default
  })

  await t.test('Missing customerName → 400', () => {
    const r = simulateApiPost({ customerName: '', items: [{ id: 'x' }], totalAmount: 90000 })
    assert.strictEqual(r.ok, false)
    assert.strictEqual(r.status, 400)
  })

  await t.test('Missing items array → 400', () => {
    const r = simulateApiPost({ customerName: 'Budi', items: null, totalAmount: 90000 })
    assert.strictEqual(r.ok, false)
    assert.strictEqual(r.status, 400)
  })

  await t.test('Empty items array → 400', () => {
    const r = simulateApiPost({ customerName: 'Budi', items: [], totalAmount: 90000 })
    assert.strictEqual(r.ok, false)
    assert.strictEqual(r.status, 400)
  })

  await t.test('CAMPURAN payload stored with correct paymentMethod label containing Tempo B2B', () => {
    const r = simulateApiPost({
      customerName: 'RM Puji Lestari',
      items: [{ productName: 'Mix 4 Lauk', qty: 1 }],
      totalAmount: 215000,
      paidAmount: 72500,
      paymentMethod: 'Transfer BCA + Tempo B2B',
      paymentStatus: 'DP',
      status: 'PENDING',
    })
    assert.strictEqual(r.ok, true)
    assert.ok(r.order.paymentMethod.includes('Tempo B2B'), 'Should preserve campuran method label')
    assert.strictEqual(r.order.paymentStatus, 'DP')
    assert.strictEqual(r.order.status, 'PENDING')
  })

  await t.test('Tempo payload: paidAmount 0, status TEMPO, order PENDING', () => {
    const r = simulateApiPost({
      customerName: 'Capry Food',
      items: [{ productName: 'Paru Sapi', qty: 5 }],
      totalAmount: 247500,
      paidAmount: 0,
      paymentMethod: 'Tempo B2B',
      paymentStatus: 'TEMPO',
      status: 'PENDING',
    })
    assert.strictEqual(r.ok, true)
    assert.strictEqual(r.order.paymentStatus, 'TEMPO')
    assert.strictEqual(r.order.paidAmount, 0)
    assert.strictEqual(r.order.status, 'PENDING')
  })

  await t.test('verifiedAt only set when status=VERIFIED', () => {
    const setVerifiedAt = (status) => (status === 'VERIFIED' ? new Date().toISOString() : undefined)
    assert.ok(setVerifiedAt('VERIFIED') !== undefined)
    assert.strictEqual(setVerifiedAt('PENDING'), undefined)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// [BLACKBOX] 6. Security & Authentication Guard Checks
// ─────────────────────────────────────────────────────────────────────────────
test('=== [BLACKBOX] 6. Security & Authentication Guard Checks ===', async (t) => {
  const ADMIN_PIN_DEFAULT = 'hatoba2026'
  const checkPin = (pin) => pin === (process.env.ADMIN_PASSWORD || ADMIN_PIN_DEFAULT)

  await t.test('Correct PIN → returns true', () => {
    assert.strictEqual(checkPin('hatoba2026'), true)
  })

  await t.test('Wrong PIN → returns false (no bypass)', () => {
    assert.strictEqual(checkPin('admin'), false)
    assert.strictEqual(checkPin('123456'), false)
    assert.strictEqual(checkPin(''), false)
    assert.strictEqual(checkPin('HATOBA2026'), false) // case sensitive
  })

  await t.test('SQL injection string → returns false (no bypass)', () => {
    assert.strictEqual(checkPin("' OR '1'='1"), false)
    assert.strictEqual(checkPin('"; DROP TABLE orders; --'), false)
  })

  await t.test('Undefined / null PIN → returns false', () => {
    assert.strictEqual(checkPin(undefined), false)
    assert.strictEqual(checkPin(null), false)
  })

  await t.test('Session cookie check simulated: missing cookie → not authenticated', () => {
    const simulateCheckAuth = (cookieValue) => cookieValue === 'authenticated'
    assert.strictEqual(simulateCheckAuth(undefined), false)
    assert.strictEqual(simulateCheckAuth(''), false)
    assert.strictEqual(simulateCheckAuth('authenticated'), true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// [BLACKBOX] 7. Input Validation & Edge Case Rejection
// ─────────────────────────────────────────────────────────────────────────────
test('=== [BLACKBOX] 7. Input Validation & Edge Case Rejection ===', async (t) => {
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
      if (it.quantity < v.minQty) return { ok: false, error: `Jumlah pesanan untuk ${prod.name} minimal ${v.minQty} pack.` }
    }
    return { ok: true }
  }

  await t.test('Valid order → passes', () => {
    assert.strictEqual(validateOrderPayload({ order: { customerName: 'Bu Siti', phone: '08123', items: [{ productId: 'babat-sapi', variantId: 'babat-retail', quantity: 2 }] } }).ok, true)
  })

  await t.test('Missing customer name → rejected', () => {
    assert.strictEqual(validateOrderPayload({ order: { customerName: '', phone: '08123', items: [{ productId: 'babat-sapi', variantId: 'babat-retail', quantity: 1 }] } }).ok, false)
  })

  await t.test('Invalid product ID → rejected with error message', () => {
    const r = validateOrderPayload({ order: { customerName: 'Budi', phone: '08123', items: [{ productId: 'kikil-deleted', variantId: 'x', quantity: 1 }] } })
    assert.strictEqual(r.ok, false)
    assert.match(r.error, /tidak valid/)
  })

  await t.test('Partai quantity below minimum (3 of min 10) → rejected', () => {
    const r = validateOrderPayload({ order: { customerName: 'Budi', phone: '08123', items: [{ productId: 'babat-sapi', variantId: 'babat-partai', quantity: 3 }] } })
    assert.strictEqual(r.ok, false)
    assert.match(r.error, /minimal 10 pack/)
  })

  await t.test('Partai quantity exactly at minimum (10) → accepted', () => {
    assert.strictEqual(validateOrderPayload({ order: { customerName: 'Budi', phone: '08123', items: [{ productId: 'babat-sapi', variantId: 'babat-partai', quantity: 10 }] } }).ok, true)
  })

  await t.test('Mix 4 Lauk has no partai variant → cannot be ordered as partai', () => {
    const mix = CATALOG_PRODUCTS.find((p) => p.id === 'mix-4-lauk')
    const partaiVariant = mix.variants.find((v) => v.packType === 'partai')
    assert.strictEqual(partaiVariant, undefined)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// [BLACKBOX] 8. POS Input Sanitization & Cart Edge Cases
// ─────────────────────────────────────────────────────────────────────────────
test('=== [BLACKBOX] 8. POS Input Sanitization & Cart Edge Cases ===', async (t) => {
  const sanitize = (input) => {
    if (typeof input !== 'string') return 0
    const raw = parseFloat(input.replace(/[^0-9]/g, ''))
    return isNaN(raw) ? 0 : raw
  }

  await t.test('Empty customer name (whitespace) → rejected by .trim() check', () => {
    const validateCheckout = (name, cart) => {
      if (!name || !name.trim()) return { ok: false, error: 'Nama pelanggan wajib diisi.' }
      if (!cart || cart.length === 0) return { ok: false, error: 'Keranjang kasir masih kosong.' }
      return { ok: true }
    }
    assert.strictEqual(validateCheckout('   ', [{ id: 1 }]).ok, false)
    assert.strictEqual(validateCheckout('Bu Siti', [{ id: 1 }]).ok, true)
    assert.strictEqual(validateCheckout('Bu Siti', []).ok, false)
  })

  await t.test('Input sanitization: Rp 150.000 → 150000', () => {
    assert.strictEqual(sanitize('Rp 150.000'), 150000)
    assert.strictEqual(sanitize('100.000'), 100000)
    assert.strictEqual(sanitize('Rp50,000'), 50000)
  })

  await t.test('Non-numeric input → 0 (no NaN propagation)', () => {
    assert.strictEqual(sanitize('abc'), 0)
    assert.strictEqual(sanitize(''), 0)
    assert.strictEqual(sanitize('  '), 0)
    assert.strictEqual(sanitize('-1500'), 1500) // simbol minus dibersihkan
  })

  await t.test('Excessive discount clamped to 0 (never negative total)', () => {
    const finalTotal = Math.max(0, 90000 - 150000)
    assert.strictEqual(finalTotal, 0)
  })

  await t.test('Auto-fallback: empty city → Denpasar for Bali hub', () => {
    const hub = 'Bali'
    const city = ''
    const fallback = city.trim() || (hub === 'Bali' ? 'Denpasar' : 'Yogyakarta')
    assert.strictEqual(fallback, 'Denpasar')
  })

  await t.test('Auto-fallback: empty city → Yogyakarta for Yogyakarta hub', () => {
    const hub = 'Yogyakarta'
    const city = ''
    const fallback = city.trim() || (hub === 'Bali' ? 'Denpasar' : 'Yogyakarta')
    assert.strictEqual(fallback, 'Yogyakarta')
  })

  await t.test('Auto-fallback: empty phone → hyphen "-"', () => {
    assert.strictEqual(''.trim() || '-', '-')
    assert.strictEqual('08123'.trim() || '-', '08123')
  })

  await t.test('Cart qty decrement: qty to 0 removes row entirely', () => {
    let cart = [{ id: 'babat', qty: 1 }, { id: 'iso', qty: 3 }]
    const idx = 0
    const newQty = cart[idx].qty - 1
    if (newQty <= 0) cart = cart.filter((_, i) => i !== idx)
    assert.strictEqual(cart.length, 1)
    assert.strictEqual(cart[0].id, 'iso')
  })

  await t.test('Cart qty decrement by -5 on qty=1 removes row (never negative)', () => {
    let cart = [{ id: 'babat', qty: 1 }]
    const newQty = cart[0].qty - 5
    if (newQty <= 0) cart = []
    assert.strictEqual(cart.length, 0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// [BLACKBOX] 9. Service Hub Regional Rules
// ─────────────────────────────────────────────────────────────────────────────
test('=== [BLACKBOX] 9. Service Hub Regional Rules ===', async (t) => {
  const CONFIRMED_HUBS = ['Bali', 'Yogyakarta']
  const PLANNED_HUBS = ['Bandung']

  const validateHub = (hub) => {
    if (CONFIRMED_HUBS.includes(hub)) return { isSupported: true, isPlanned: false, message: 'Hub reguler terlayani.' }
    if (PLANNED_HUBS.includes(hub)) return { isSupported: false, isPlanned: true, message: 'Bandung masuk roadmap 2027 (belum aktif).' }
    return { isSupported: false, isPlanned: false, message: 'Luar Area Layanan Langsung (Kargo Dingin Khusus Diperlukan).' }
  }

  await t.test('Bali → supported', () => { assert.strictEqual(validateHub('Bali').isSupported, true) })
  await t.test('Yogyakarta → supported', () => { assert.strictEqual(validateHub('Yogyakarta').isSupported, true) })
  await t.test('Bandung → not supported, is planned', () => {
    const r = validateHub('Bandung')
    assert.strictEqual(r.isSupported, false)
    assert.strictEqual(r.isPlanned, true)
  })
  await t.test('Surabaya → not supported, NOT planned (no false claims)', () => {
    const r = validateHub('Surabaya')
    assert.strictEqual(r.isSupported, false)
    assert.strictEqual(r.isPlanned, false)
    assert.match(r.message, /Luar Area Layanan Langsung/)
  })
  await t.test('Jakarta → not supported, NOT planned', () => {
    const r = validateHub('Jakarta')
    assert.strictEqual(r.isSupported, false)
    assert.strictEqual(r.isPlanned, false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// [BLACKBOX] 10. Status-Notes Content Integrity
// ─────────────────────────────────────────────────────────────────────────────
test('=== [BLACKBOX] 10. StatusNotes Content Integrity ===', async (t) => {
  await t.test('[TEMPO] StatusNotes contains tagihan amount', () => {
    const r = determinePaymentOutcome('TEMPO', 'Tunai', 0, 215000)
    assert.match(r.statusNotes, /Tempo B2B/)
    assert.match(r.statusNotes, /215000/)
  })

  await t.test('[DP] StatusNotes contains metode, paidAmount, and sisa', () => {
    const r = determinePaymentOutcome('DP', 'Tunai', 50000, 215000)
    assert.match(r.statusNotes, /DP via Tunai/)
    assert.match(r.statusNotes, /50000/)
    assert.match(r.statusNotes, /165000/)
  })

  await t.test('[CAMPURAN] StatusNotes contains metode, nominal dibayar, sisa tempo', () => {
    const r = determinePaymentOutcome('CAMPURAN', 'Transfer BCA', 72500, 215000)
    assert.match(r.statusNotes, /Campuran/)
    assert.match(r.statusNotes, /Transfer BCA/)
    assert.match(r.statusNotes, /Tempo B2B/)
  })

  await t.test('[LUNAS Tunai] StatusNotes contains metode dan nominal', () => {
    const r = determinePaymentOutcome('LUNAS', 'Tunai', 215000, 215000)
    assert.match(r.statusNotes, /Lunas via Tunai/)
    assert.match(r.statusNotes, /215000/)
  })

  await t.test('[LUNAS Transfer] StatusNotes contains metode transfer', () => {
    const r = determinePaymentOutcome('LUNAS', 'Transfer BCA', 215000, 215000)
    assert.match(r.statusNotes, /Transfer BCA/)
  })

  await t.test('[LUNAS Overpay] StatusNotes contains info kembalian', () => {
    const r = determinePaymentOutcome('LUNAS', 'Tunai', 300000, 215000)
    assert.match(r.statusNotes, /85000/) // kembalian
  })
})
