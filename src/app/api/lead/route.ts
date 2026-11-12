import { NextResponse } from 'next/server'
import {
  generateReferenceCode,
  formatRawInquiryWhatsApp,
  formatCorporateInquiryWhatsApp,
} from '@/lib/whatsapp'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, payload, attribution } = body

    if (!payload || !payload.customerName && !payload.fullName) {
      return NextResponse.json(
        { error: 'Nama dan kontak wajib diisi.' },
        { status: 400 }
      )
    }

    if (type === 'RAW_INQUIRY') {
      const referenceCode = generateReferenceCode('INQ')
      const completeInquiry = {
        ...payload,
        referenceCode,
      }
      const whatsappUrl = formatRawInquiryWhatsApp(completeInquiry)

      // Log lead internally (mock database store)
      console.log('[LEAD CAPTURED - RAW INQUIRY]', {
        referenceCode,
        payload: completeInquiry,
        attribution,
        timestamp: new Date().toISOString(),
      })

      return NextResponse.json({
        success: true,
        referenceCode,
        whatsappUrl,
      })
    }

    if (type === 'CORPORATE_INQUIRY') {
      const referenceCode = generateReferenceCode('CORP')
      const completeCorp = {
        ...payload,
        referenceCode,
      }
      const whatsappUrl = formatCorporateInquiryWhatsApp(completeCorp)

      console.log('[LEAD CAPTURED - CORPORATE]', {
        referenceCode,
        payload: completeCorp,
        attribution,
        timestamp: new Date().toISOString(),
      })

      return NextResponse.json({
        success: true,
        referenceCode,
        whatsappUrl,
      })
    }

    return NextResponse.json({ error: 'Tipe lead tidak dikenal.' }, { status: 400 })
  } catch (err: unknown) {
    console.error('Lead processing error:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat memproses inquiry.' },
      { status: 500 }
    )
  }
}

