import { NextResponse } from 'next/server'
import { CATALOG_PRODUCTS } from '@/lib/catalog-data'
import { generateReferenceCode, formatFixedOrderWhatsApp, FixedOrderItem } from '@/lib/whatsapp'
import { addAdminOrder } from '@/lib/admin-store'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { order, attribution } = body

    if (!order || !order.customerName || !order.phone || !Array.isArray(order.items) || order.items.length === 0) {
      return NextResponse.json(
        { error: 'Rincian pemesanan tidak lengkap.' },
        { status: 400 }
      )
    }

    // Server-side price and variant re-validation
    const validatedItems: FixedOrderItem[] = []
    let computedTotal = 0

    for (const clientItem of order.items) {
      const product = CATALOG_PRODUCTS.find((p) => p.id === clientItem.productId)
      if (!product) {
        return NextResponse.json(
          { error: `Produk ID ${clientItem.productId} tidak valid.` },
          { status: 400 }
        )
      }

      const variant = product.variants.find((v) => v.id === clientItem.variantId)
      if (!variant) {
        return NextResponse.json(
          { error: `Varian ID ${clientItem.variantId} tidak ditemukan.` },
          { status: 400 }
        )
      }

      if (clientItem.quantity < variant.minQty) {
        return NextResponse.json(
          {
            error: `Jumlah pesanan untuk ${product.name} (${variant.name}) minimal ${variant.minQty} pack.`,
          },
          { status: 400 }
        )
      }

      const subtotal = variant.price * clientItem.quantity
      computedTotal += subtotal

      validatedItems.push({
        productName: product.name,
        variantName: variant.name,
        quantity: clientItem.quantity,
        unitPrice: variant.price,
        subtotal,
      })
    }

    const referenceCode = generateReferenceCode('ORD')
    const finalOrder = {
      referenceCode,
      customerName: order.customerName,
      businessName: order.businessName,
      businessType: order.businessType || 'HORECA / Restoran',
      phone: order.phone,
      hubArea: order.hubArea || 'Bali',
      city: order.city || 'Denpasar',
      notes: order.notes,
      items: validatedItems,
      totalAmount: computedTotal,
    }

    const whatsappUrl = formatFixedOrderWhatsApp(finalOrder)

    // Store order into admin database & log activity
    await addAdminOrder({
      referenceCode,
      customerName: finalOrder.customerName,
      businessName: finalOrder.businessName,
      businessType: finalOrder.businessType,
      phone: finalOrder.phone,
      hubArea: finalOrder.hubArea,
      city: finalOrder.city,
      marketingName: (order.marketingName || attribution?.marketingName || attribution?.utm_campaign || '') as string,
      notes: finalOrder.notes,
      items: finalOrder.items,
      totalAmount: finalOrder.totalAmount,
      status: 'PENDING',
    })

    console.log('[ORDER LOGGED BEFORE WHATSAPP]', {
      referenceCode,
      finalOrder,
      attribution,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      referenceCode,
      totalAmount: computedTotal,
      whatsappUrl,
    })
  } catch (err: unknown) {
    console.error('Order processing error:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat memproses pesanan.' },
      { status: 500 }
    )
  }
}

