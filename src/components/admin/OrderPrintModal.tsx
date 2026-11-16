'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import {
  Printer,
  FileText,
  Receipt,
  X,
  CheckCircle2,
  Snowflake,
  Download,
  Share2,
  Check,
  Building,
  CreditCard,
  Image as ImageIcon,
  CheckSquare,
} from 'lucide-react'
import { toPng } from 'html-to-image'
import { AdminOrder } from '@/lib/admin-store'

interface OrderPrintModalProps {
  order: AdminOrder | null
  onClose: () => void
}

export default function OrderPrintModal({ order, onClose }: OrderPrintModalProps) {
  const [printMode, setPrintMode] = useState<'invoice' | 'thermal' | 'surat_jalan'>('invoice')
  const [isExportingImage, setIsExportingImage] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)

  // Ref for exporting invoice to image
  const invoiceContainerRef = useRef<HTMLDivElement>(null)

  if (!order) return null

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val)
  }

  const handlePrint = () => {
    window.print()
  }

  // Export invoice / receipt DOM to PNG image file
  const handleDownloadImage = async () => {
    if (!invoiceContainerRef.current) return
    setIsExportingImage(true)

    try {
      // Small delay to ensure layout & fonts are fully settled
      await new Promise((r) => setTimeout(r, 300))

      const node = invoiceContainerRef.current

      // For thermal mode: use a fixed 340px width to avoid cropping.
      // For other modes: use the actual rendered width.
      const isThermalMode = printMode === 'thermal'
      const exportWidth = isThermalMode ? 340 : node.getBoundingClientRect().width
      const exportHeight = node.scrollHeight // use scrollHeight to capture full content

      const dataUrl = await toPng(node, {
        quality: 0.98,
        pixelRatio: 2, // High resolution for crystal clear mobile sharing
        backgroundColor: '#ffffff',
        width: exportWidth,
        height: exportHeight,
        style: {
          margin: '0',
          left: '0',
          top: '0',
          transform: 'none',
          position: 'static',
          width: `${exportWidth}px`,
          boxSizing: 'border-box',
          overflow: 'visible',
        },
      })

      const prefix =
        printMode === 'thermal'
          ? 'Struk-Kasir'
          : printMode === 'surat_jalan'
          ? 'Surat-Jalan'
          : 'Invoice'

      const link = document.createElement('a')
      const fileName = `${prefix}-${order.referenceCode}-${(order.customerName || 'Pelanggan').replace(/[^a-zA-Z0-9]/g, '_')}.png`
      link.download = fileName
      link.href = dataUrl
      link.click()

      setDownloadSuccess(true)
      setTimeout(() => setDownloadSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to export image:', err)
      alert('Gagal membuat gambar. Silakan gunakan tombol Cetak.')
    } finally {
      setIsExportingImage(false)
    }
  }

  // Generate WhatsApp Share Link for the customer
  const handleShareWhatsApp = () => {
    const cleanPhone = (order.phone || '').replace(/[^0-9]/g, '')
    const targetPhone = cleanPhone.startsWith('0')
      ? '62' + cleanPhone.slice(1)
      : cleanPhone.startsWith('62')
      ? cleanPhone
      : '62' + cleanPhone

    const isPaid = order.paymentStatus === 'LUNAS' || (order.status === 'VERIFIED' && order.paymentStatus !== 'DP' && order.paymentStatus !== 'TEMPO')
    const isDP = order.paymentStatus === 'DP'
    const statusText = isPaid ? 'LUNAS (PAID)' : isDP ? 'DP DITERIMA' : 'MENUNGGU PEMBAYARAN'

    const itemsSummary = order.items
      .map((it) => `• ${it.productName} (${it.variantName}) — ${it.quantity} pack = ${formatIDR(it.subtotal)}`)
      .join('\n')

    const message = `Halo ${order.customerName},\n\nBerikut rincian Faktur / Invoice Resmi dari *HATOBA Frozen Food*:\n\n*Nomor Invoice:* INV-${order.referenceCode}\n*Status:* *${statusText}*\n*Tujuan:* ${order.businessName || order.customerName} (${order.city})\n\n*Rincian Pesanan:*\n${itemsSummary}\n\n*Total Tagihan:* *${formatIDR(order.totalAmount)}*\n*Metode Pembayaran:* ${order.paymentMethod || 'Transfer / Tunai'}\n\nTerima kasih atas kerja samanya. Pesanan Anda diproses dengan standar rantai dingin −18°C.`

    const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`
    window.open(waUrl, '_blank')
  }

  // Determine Stamp Status
  const isPaid =
    order.paymentStatus === 'LUNAS' ||
    (order.status === 'VERIFIED' && order.paymentStatus !== 'DP' && order.paymentStatus !== 'TEMPO')
  const isDP = order.paymentStatus === 'DP'
  const isTempo = order.paymentStatus === 'TEMPO'
  // CAMPURAN: DP status but paymentMethod contains "Tempo" (set by POS campuran mode)
  const isCampuran = isDP && (order.paymentMethod || '').toLowerCase().includes('tempo')

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Container Card */}
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#E8DFD5] overflow-hidden my-auto flex flex-col max-h-[94vh]">
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="print:hidden p-3.5 sm:p-4 border-b border-[#EAE4DC] bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-2.5">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setPrintMode('invoice')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                printMode === 'invoice'
                  ? 'bg-[#111613] text-white shadow-xs'
                  : 'bg-white text-[#48564F] border border-[#D8CEBE] hover:bg-gray-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#C59B47]" />
              <span>Invoice Konsumen</span>
            </button>

            <button
              type="button"
              onClick={() => setPrintMode('thermal')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                printMode === 'thermal'
                  ? 'bg-[#111613] text-white shadow-xs'
                  : 'bg-white text-[#48564F] border border-[#D8CEBE] hover:bg-gray-50'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Nota Thermal (58/80mm)</span>
            </button>

            <button
              type="button"
              onClick={() => setPrintMode('surat_jalan')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                printMode === 'surat_jalan'
                  ? 'bg-[#111613] text-white shadow-xs'
                  : 'bg-white text-[#48564F] border border-[#D8CEBE] hover:bg-gray-50'
              }`}
            >
              <Snowflake className="w-3.5 h-3.5 text-emerald-600" />
              <span>Surat Jalan DO</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Download as Image PNG Button (especially handy for Invoice) */}
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isExportingImage}
              title="Download sebagai gambar PNG untuk dibagikan ke WhatsApp"
              className="px-3 py-1.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F2ECE1] border border-[#E2D6C5] text-[#8C6B24] text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tersimpan!</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>{isExportingImage ? 'Menyiapkan...' : 'Simpan Gambar'}</span>
                </>
              )}
            </button>

            {/* Share to WhatsApp */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              title="Kirim rincian invoice ke WhatsApp konsumen"
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kirim WA</span>
            </button>

            {/* Print / PDF Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-crimson hover:bg-crimson-hover text-white text-xs font-bold transition-all shadow-md shadow-crimson/20 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable & Exportable Area */}
        <div className="p-4 sm:p-7 overflow-y-auto flex-1 bg-white">
          {/* ========================================================================= */}
          {/* MODE 1: INVOICE RESMI KONSUMEN (DENGAN STEMPEL LUNAS / DP / TEMPO)        */}
          {/* ========================================================================= */}
          {printMode === 'invoice' && (
            <div
              ref={invoiceContainerRef}
              className="relative p-6 sm:p-8 bg-white border border-[#E8DFD5] rounded-3xl shadow-sm text-[#111613] space-y-6 print:border-none print:p-0 print:shadow-none"
            >
              {/* Header Invoice */}
              <div className="flex items-start justify-between border-b-2 border-[#111613] pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 relative flex-shrink-0">
                    <Image
                      src="/images/branding/logo-hatoba-gold.png"
                      alt="HATOBA Group"
                      width={64}
                      height={64}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="font-serif-title text-xl sm:text-2xl font-bold tracking-tight text-[#111613]">
                      HATOBA FROZEN FOOD
                    </h1>
                    <p className="text-xs text-[#8C6B24] font-medium tracking-wide">
                      HATOBA GROUP · JEROAN &amp; DAGING SAPI HIGIENIS
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Hub Bali &amp; D.I. Yogyakarta · WA: +62 821-7368-358
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-md bg-[#8C6B24] text-white text-xs font-bold tracking-wider uppercase mb-1">
                    INVOICE TAGIHAN
                  </span>
                  <div className="font-mono text-sm font-bold text-[#111613]">
                    INV-{order.referenceCode}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Tanggal:{' '}
                    {new Date(order.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              {/* Customer Info & Status Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Customer Details */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                    Ditagihkan Kepada:
                  </span>
                  <div className="font-bold text-sm text-[#111613]">{order.customerName}</div>
                  <div className="font-semibold text-gray-700">
                    {order.businessName || 'Pelanggan Ritel / Kuliner'}
                  </div>
                  <div className="text-gray-600">Kota / Hub: {order.city} ({order.hubArea})</div>
                  <div className="text-gray-600">No. Kontak: {order.phone}</div>
                </div>

                {/* Payment Overview */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-1 relative overflow-hidden">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                    Informasi Pembayaran:
                  </span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">Metode:</span>
                    <span className="font-semibold text-[#111613]">
                      {order.paymentMethod || 'Tunai / Transfer'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">Status Pembayaran:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-800'
                          : isCampuran
                          ? 'bg-blue-100 text-blue-800'
                          : isDP
                          ? 'bg-amber-100 text-amber-800'
                          : isTempo
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {isPaid ? 'LUNAS' : isCampuran ? 'BAYAR + TEMPO' : isDP ? 'DP DITERIMA' : isTempo ? 'TEMPO B2B' : 'MENUNGGU PEMBAYARAN'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-gray-200">
                    <span className="text-gray-600">Total Nominal:</span>
                    <span className="font-mono font-bold text-sm text-emerald-900">
                      {formatIDR(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-gray-300 border-collapse">
                  <thead>
                    <tr className="bg-[#FAF8F5] text-gray-800 font-bold border-b border-gray-300">
                      <th className="p-2.5 text-center w-10">No</th>
                      <th className="p-2.5 text-left">Nama Produk</th>
                      <th className="p-2.5 text-left">Varian Kemasan</th>
                      <th className="p-2.5 text-center w-16">Qty</th>
                      <th className="p-2.5 text-right w-24">Harga</th>
                      <th className="p-2.5 text-right w-28">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((it, idx) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50/50">
                        <td className="p-2.5 text-center font-mono text-gray-500">{idx + 1}</td>
                        <td className="p-2.5 font-semibold text-[#111613]">{it.productName}</td>
                        <td className="p-2.5 text-gray-600">{it.variantName}</td>
                        <td className="p-2.5 text-center font-mono font-bold">{it.quantity}x</td>
                        <td className="p-2.5 text-right font-mono text-gray-700">
                          {formatIDR(it.unitPrice)}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-[#111613]">
                          {formatIDR(it.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Section: Rekening Bank & Stempel Badge */}
              <div className="relative pt-2">
                {/* DIGITAL STAMP / STEMPEL BADGE WATERMARK */}
                <div className="absolute right-4 top-2 pointer-events-none select-none z-10">
                  {isPaid && (
                    <div className="w-36 h-36 rounded-full border-4 border-dashed border-emerald-600/80 flex flex-col items-center justify-center -rotate-12 bg-emerald-50/40 p-2 shadow-xs">
                      <div className="text-[10px] font-bold tracking-widest text-emerald-800 uppercase">
                        ★ HATOBA ★
                      </div>
                      <div className="text-xl font-black text-emerald-700 tracking-wider font-sans my-0.5">
                        LUNAS
                      </div>
                      <div className="text-[9px] font-bold text-emerald-800 tracking-wider">
                        FULLY PAID
                      </div>
                      <div className="text-[8px] text-emerald-700 font-mono mt-0.5">
                        {new Date(order.verifiedAt || order.createdAt).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  )}

                  {isDP && !isCampuran && (
                    <div className="w-36 h-36 rounded-full border-4 border-dashed border-amber-600/80 flex flex-col items-center justify-center -rotate-12 bg-amber-50/40 p-2 shadow-xs">
                      <div className="text-[10px] font-bold tracking-widest text-amber-800 uppercase">
                        ★ HATOBA ★
                      </div>
                      <div className="text-lg font-black text-amber-700 tracking-wider font-sans my-0.5">
                        DP MASUK
                      </div>
                      <div className="text-[9px] font-bold text-amber-800 tracking-wider">
                        DOWN PAYMENT
                      </div>
                      <div className="text-[8px] text-amber-700 font-mono mt-0.5">
                        {order.statusNotes || 'DP Terverifikasi'}
                      </div>
                    </div>
                  )}

                  {isCampuran && (
                    <div className="w-36 h-36 rounded-full border-4 border-dashed border-blue-500/80 flex flex-col items-center justify-center -rotate-12 bg-blue-50/40 p-2 shadow-xs">
                      <div className="text-[10px] font-bold tracking-widest text-blue-800 uppercase">
                        ★ HATOBA ★
                      </div>
                      <div className="text-[13px] font-black text-blue-700 tracking-wider font-sans my-0.5 text-center leading-tight">
                        BAYAR<br/>+ TEMPO
                      </div>
                      <div className="text-[9px] font-bold text-blue-800 tracking-wider">
                        MIXED PAYMENT
                      </div>
                      <div className="text-[8px] text-blue-700 font-mono mt-0.5 text-center">
                        Sisa: {typeof order.paidAmount === 'number' ? formatIDR(order.totalAmount - order.paidAmount) : '-'}
                      </div>
                    </div>
                  )}

                  {isTempo && (
                    <div className="w-36 h-36 rounded-full border-4 border-dashed border-orange-600/80 flex flex-col items-center justify-center -rotate-12 bg-orange-50/40 p-2 shadow-xs">
                      <div className="text-[10px] font-bold tracking-widest text-orange-800 uppercase">
                        ★ HATOBA ★
                      </div>
                      <div className="text-lg font-black text-orange-700 tracking-wider font-sans my-0.5">
                        TEMPO B2B
                      </div>
                      <div className="text-[9px] font-bold text-orange-800 tracking-wider">
                        TERM OF PAYMENT
                      </div>
                      <div className="text-[8px] text-orange-700 font-mono mt-0.5">
                        Mitra Restoran
                      </div>
                    </div>
                  )}

                  {!isPaid && !isDP && !isTempo && (
                    <div className="w-36 h-36 rounded-full border-4 border-dashed border-rose-600/80 flex flex-col items-center justify-center -rotate-12 bg-rose-50/40 p-2 shadow-xs">
                      <div className="text-[10px] font-bold tracking-widest text-rose-800 uppercase">
                        ★ HATOBA ★
                      </div>
                      <div className="text-base font-black text-rose-700 tracking-wider font-sans my-0.5 text-center leading-tight">
                        MENUNGGU<br />BAYAR
                      </div>
                      <div className="text-[9px] font-bold text-rose-800 tracking-wider">
                        UNPAID
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                  {/* Rekening Pembayaran Resmi */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-1 text-xs">
                    <span className="font-bold text-[10px] text-gray-500 uppercase tracking-wider block">
                      Rekening Resmi HATOBA Group:
                    </span>
                    <div className="space-y-1 font-mono text-[11px] text-[#111613]">
                      <div>
                        <span className="font-bold text-[#8C6B24]">BCA:</span> 772-512-8899
                      </div>
                      <div>
                        <span className="font-bold text-[#8C6B24]">Mandiri:</span> 137-00-1928374-1
                      </div>
                      <div className="text-[10px] text-gray-600 pt-0.5">
                        a/n PT HATOBA PANGAN NUSANTARA
                      </div>
                    </div>
                  </div>

                  {/* Ringkasan Total Tagihan */}
                  <div className="p-4 rounded-2xl bg-[#111613] text-white space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-300">
                      <span>Subtotal Produk:</span>
                      <span className="font-mono">{formatIDR(order.totalAmount)}</span>
                    </div>

                    {typeof order.paidAmount === 'number' ? (
                      <div className="flex justify-between text-gray-300">
                        <span>Nominal Dibayar:</span>
                        <span className="font-mono text-emerald-400">{formatIDR(order.paidAmount)}</span>
                      </div>
                    ) : null}

                    {typeof order.paidAmount === 'number' && order.paidAmount < order.totalAmount ? (
                      <div className="flex justify-between text-amber-300 font-bold">
                        <span>Sisa Tagihan (Kurang Bayar):</span>
                        <span className="font-mono">{formatIDR(order.totalAmount - order.paidAmount)}</span>
                      </div>
                    ) : null}

                    <div className="pt-2 border-t border-gray-700 flex justify-between items-center text-sm font-bold text-[#C59B47]">
                      <span>TOTAL TAGIHAN:</span>
                      <span className="font-mono text-base">{formatIDR(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-400 gap-2">
                <span>
                  Suhu Penyimpanan: −18°C (Cold Chain Standard) · Tanggal Cetak:{' '}
                  {new Date().toLocaleDateString('id-ID')}
                </span>
                <span className="font-semibold text-[#8C6B24]">
                  Terima kasih atas kemitraan usaha Anda bersama HATOBA.
                </span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 2: NOTA THERMAL KASIR (58/80mm)                                      */}
          {/* ========================================================================= */}
          {printMode === 'thermal' && (
            <div className="w-full flex justify-center py-2">
              <div
                ref={invoiceContainerRef}
                style={{ margin: 0, width: 340, minWidth: 340, boxSizing: 'border-box' }}
                className="font-mono text-xs text-[#111613] p-5 border border-dashed border-gray-400 rounded-2xl bg-[#FCFAF7] print:border-none print:p-0 print:w-full print:max-w-none shadow-sm"
              >
                <div className="text-center space-y-1 pb-3 border-b border-dashed border-gray-400">
                  <div className="font-bold text-base tracking-wider">HATOBA FROZEN FOOD</div>
                  <div className="text-[10px] text-gray-600">Jeroan &amp; Daging Sapi Berkualitas Higienis</div>
                  <div className="text-[10px] text-gray-500">
                    Hub {order.hubArea} · WA: 0821-7368-358
                  </div>
                  {/* Stamp Thermal */}
                  <div className="pt-1">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded border ${
                        isPaid
                          ? 'border-emerald-600 text-emerald-800 bg-emerald-50'
                          : isCampuran
                          ? 'border-blue-500 text-blue-800 bg-blue-50'
                          : isDP
                          ? 'border-amber-600 text-amber-800 bg-amber-50'
                          : isTempo
                          ? 'border-orange-600 text-orange-800 bg-orange-50'
                          : 'border-gray-500 text-gray-700 bg-gray-50'
                      }`}
                    >
                      *** {isPaid ? 'LUNAS / PAID' : isCampuran ? 'BAYAR + TEMPO' : isDP ? 'DP DITERIMA' : isTempo ? 'TEMPO B2B' : 'TAGIHAN / UNPAID'} ***
                    </span>
                  </div>
                </div>

                <div className="py-2.5 text-[11px] space-y-1 border-b border-dashed border-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-500">No. Ref:</span>
                    <span className="font-bold">{order.referenceCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Waktu:</span>
                    <span>
                      {new Date(order.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-500">Pelanggan:</span>
                    <span className="font-semibold text-right max-w-[190px] break-words">
                      {order.customerName} {order.businessName ? `(${order.businessName})` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Kota / Hub:</span>
                    <span>{order.city} ({order.hubArea})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Kasir:</span>
                    <span>{order.source || 'POS Kasir'}</span>
                  </div>
                </div>

              <div className="py-3 border-b border-dashed border-gray-400 space-y-2">
                {order.items.map((it, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="font-semibold">{it.productName}</div>
                    <div className="flex justify-between text-gray-600 text-[10px]">
                      <span>{it.variantName}</span>
                      <span>
                        {it.quantity} x {formatIDR(it.unitPrice)}
                      </span>
                    </div>
                    <div className="text-right font-bold">{formatIDR(it.subtotal)}</div>
                  </div>
                ))}
              </div>

              <div className="py-2.5 space-y-1.5 border-b border-dashed border-gray-400">
                <div className="flex justify-between text-sm font-bold">
                  <span>TOTAL:</span>
                  <span>{formatIDR(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-gray-600">
                  <span>Metode Bayar:</span>
                  <span>{order.paymentMethod || 'Tunai'}</span>
                </div>
                {typeof order.paidAmount === 'number' ? (
                  <>
                    <div className="flex justify-between text-[11px] text-gray-600">
                      <span>Bayar (Diterima):</span>
                      <span>{formatIDR(order.paidAmount)}</span>
                    </div>
                    {order.paidAmount < order.totalAmount ? (
                      <div className="flex justify-between text-[11px] font-bold text-amber-800">
                        <span>Sisa Tagihan (DP):</span>
                        <span>{formatIDR(order.totalAmount - order.paidAmount)}</span>
                      </div>
                    ) : order.changeAmount ? (
                      <div className="flex justify-between text-[11px] text-gray-600">
                        <span>Kembalian:</span>
                        <span>{formatIDR(order.changeAmount)}</span>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>

              <div className="text-center pt-3 text-[10px] text-gray-500 space-y-1">
                <div>Simpan beku konstan pada suhu −18°C.</div>
                <div className="font-bold">Terima kasih atas kerja samanya!</div>
                <div className="text-[9px]">hatoba-six.vercel.app</div>
              </div>
            </div>
          </div>
        )}

          {/* ========================================================================= */}
          {/* MODE 3: SURAT JALAN / DELIVERY ORDER (A4 / COLD CHAIN DENGAN CEK LIST)     */}
          {/* ========================================================================= */}
          {printMode === 'surat_jalan' && (
            <div
              ref={invoiceContainerRef}
              className="p-4 sm:p-6 border border-gray-300 rounded-2xl text-[#111613] space-y-5 print:border-none print:p-0 bg-white"
            >
              {/* Header Surat Jalan */}
              <div className="flex items-start justify-between border-b-2 border-[#111613] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 relative flex-shrink-0">
                    <Image
                      src="/images/branding/logo-hatoba-gold.png"
                      alt="HATOBA Group"
                      width={64}
                      height={64}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="font-serif-title text-xl font-bold tracking-tight">
                      HATOBA GROUP · FROZEN FOOD
                    </h2>
                    <p className="text-xs text-[#5C6E65]">
                      Penyedia Bahan Baku Jeroan &amp; Daging Sapi Higienis
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Hub Operasional: Bali &amp; D.I. Yogyakarta · Telp/WA: 0821-7368-358
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-md bg-[#111613] text-white text-xs font-bold tracking-wider uppercase mb-1">
                    Surat Jalan &amp; DO (Cek List)
                  </span>
                  <div className="font-mono text-xs font-bold text-[#8C6B24]">
                    {order.referenceCode}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Tgl:{' '}
                    {new Date(order.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              {/* Data Pengiriman & Standar Cold Chain */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                    Tujuan Pengiriman (Penerima):
                  </span>
                  <div className="font-bold text-sm text-[#111613]">{order.customerName}</div>
                  <div className="font-medium text-gray-700">{order.businessName || '-'}</div>
                  <div className="text-gray-600">Kota: {order.city} ({order.hubArea})</div>
                  <div className="text-gray-600">Telp/WA: {order.phone}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block tracking-wider flex items-center gap-1">
                    <Snowflake className="w-3.5 h-3.5 text-emerald-600" />
                    Standar Cold Chain −18°C:
                  </span>
                  <div className="font-semibold text-emerald-950">Kemasan Vacuum Sealed Beku Keras</div>
                  <div className="text-[11px] text-emerald-800 leading-relaxed">
                    Armada dilengkapi ice-pack / cooler box. Mohon langsung masukkan freezer bila tidak langsung diolah.
                  </div>
                  {order.notes && (
                    <div className="text-[11px] text-gray-700 pt-1 border-t border-emerald-200">
                      <span className="font-bold">Catatan Kirim:</span> {order.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* TABEL CHECKLIST BARANG (HANYA 1 CEK LIST: PENERIMAAN KONSUMEN) */}
              <div>
                <table className="w-full text-xs border border-gray-400 border-collapse print:border-black">
                  <thead>
                    <tr className="bg-gray-100 print:bg-gray-200 text-gray-900 font-bold border-b border-gray-400">
                      <th className="border border-gray-400 p-2 text-center w-8">No</th>
                      <th className="border border-gray-400 p-2 text-left">Nama Produk &amp; Spesifikasi</th>
                      <th className="border border-gray-400 p-2 text-left w-36">Varian / Kemasan</th>
                      <th className="border border-gray-400 p-2 text-center w-24">Jumlah Order</th>
                      <th className="border border-gray-400 p-2 text-center w-28">Kondisi Fisik</th>
                      <th className="border border-gray-400 p-2 text-center w-40 bg-emerald-50/70 print:bg-white">
                        <div className="text-[11px] font-bold text-emerald-950 print:text-black">Cek List Penerimaan</div>
                        <div className="text-[9px] font-normal text-gray-600 print:text-black">(Kesesuaian Barang)</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="border border-gray-400 p-2 text-center font-mono font-medium">{idx + 1}</td>
                        <td className="border border-gray-400 p-2 font-semibold text-[#111613]">
                          {it.productName}
                        </td>
                        <td className="border border-gray-400 p-2 text-gray-700">{it.variantName}</td>
                        <td className="border border-gray-400 p-2 text-center font-mono font-bold text-sm">
                          {it.quantity} pack
                        </td>
                        <td className="border border-gray-400 p-2 text-center text-[10px] text-emerald-800 font-semibold print:text-black">
                          ✓ Beku −18°C Segel
                        </td>
                        {/* HANYA 1 KOTAK CHECKLIST: PENERIMAAN KONSUMEN */}
                        <td className="border border-gray-400 p-2 text-center bg-emerald-50/25 print:bg-white">
                          <div className="flex items-center justify-center gap-2">
                            <span className="w-5 h-5 rounded border-2 border-gray-700 print:border-black inline-block bg-white flex-shrink-0" />
                            <span className="text-[11px] text-gray-800 print:text-black font-semibold">Sesuai</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 print:bg-gray-100 font-bold border-t-2 border-gray-400">
                      <td colSpan={3} className="border border-gray-400 p-2 text-right">
                        Total Kuantitas Kirim:
                      </td>
                      <td className="border border-gray-400 p-2 text-center font-mono text-sm text-[#8C6B24] print:text-black">
                        {order.items.reduce((acc, it) => acc + it.quantity, 0)} pack
                      </td>
                      <td colSpan={2} className="border border-gray-400 p-2 text-[10px] text-gray-600 print:text-black">
                        * Konsumen memberi tanda centang [ ✔ ] pada kotak untuk memastikan barang fisik telah sesuai
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* BOX PANDUAN CEK LIST PENERIMAAN KONSUMEN */}
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-gray-300 text-xs space-y-1.5 print:bg-white print:border-black">
                <div className="font-bold text-[#111613] text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-[#8C6B24]" />
                  <span>Pemeriksaan Kesesuaian Barang oleh Konsumen / Penerima:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-gray-700 print:text-black pt-0.5">
                  <div className="flex items-start gap-1.5">
                    <span className="w-4 h-4 rounded border border-gray-600 inline-block flex-shrink-0 mt-0.5 bg-white" />
                    <span>1. Jenis produk &amp; varian sesuai order</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="w-4 h-4 rounded border border-gray-600 inline-block flex-shrink-0 mt-0.5 bg-white" />
                    <span>2. Jumlah pack fisik lengkap sesuai surat jalan</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="w-4 h-4 rounded border border-gray-600 inline-block flex-shrink-0 mt-0.5 bg-white" />
                    <span>3. Kemasan vacuum utuh &amp; beku keras (−18°C)</span>
                  </div>
                </div>
                <div className="text-[10px] text-gray-500 print:text-black pt-1 border-t border-gray-200">
                  <span className="font-semibold text-gray-700 print:text-black">Catatan Konsumen / Selisih Fisik:</span>{' '}
                  <span className="italic text-gray-400">...........................................................................................................................................................</span>
                </div>
              </div>

              {/* 3 KOLOM TANDA TANGAN & SERAH TERIMA */}
              <div className="pt-2 grid grid-cols-3 gap-4 text-center text-xs">
                {/* 1. Petugas Gudang */}
                <div className="p-2.5 border border-gray-300 rounded-xl print:border-black space-y-8 bg-gray-50/50 print:bg-white">
                  <div className="text-[11px]">
                    <span className="font-bold block text-gray-900">1. Disiapkan &amp; Dicek:</span>
                    <span className="text-gray-500 print:text-black text-[10px]">(Petugas Gudang / QC)</span>
                  </div>
                  <div className="border-b border-gray-400 mx-2" />
                  <div className="text-[10px] text-gray-600 print:text-black text-left px-1 -mt-6 space-y-1">
                    <div>Nama: .......................................</div>
                    <div>Tgl/Jam: ...................................</div>
                  </div>
                </div>

                {/* 2. Kurir / Driver Armada */}
                <div className="p-2.5 border border-gray-300 rounded-xl print:border-black space-y-8 bg-gray-50/50 print:bg-white">
                  <div className="text-[11px]">
                    <span className="font-bold block text-gray-900">2. Dibawa &amp; Dikirim:</span>
                    <span className="text-gray-500 print:text-black text-[10px]">(Kurir / Driver Armada)</span>
                  </div>
                  <div className="border-b border-gray-400 mx-2" />
                  <div className="text-[10px] text-gray-600 print:text-black text-left px-1 -mt-6 space-y-1">
                    <div>Nama: .......................................</div>
                    <div>No. Pol: ....................................</div>
                  </div>
                </div>

                {/* 3. Konsumen / Restoran Penerima */}
                <div className="p-2.5 border border-gray-300 rounded-xl print:border-black space-y-8 bg-emerald-50/40 print:bg-white">
                  <div className="text-[11px]">
                    <span className="font-bold block text-emerald-950 print:text-black">3. Diterima &amp; Diverifikasi:</span>
                    <span className="text-gray-500 print:text-black text-[10px]">(Konsumen / PIC Dapur)</span>
                  </div>
                  <div className="border-b border-gray-400 mx-2" />
                  <div className="text-[10px] text-gray-600 print:text-black text-left px-1 -mt-6 space-y-1">
                    <div>Nama: .......................................</div>
                    <div>Jam Terima: ............................</div>
                  </div>
                </div>
              </div>

              {/* Disclaimer Legalitas */}
              <div className="text-center text-[9px] text-gray-400 pt-1">
                Surat Jalan ini adalah bukti serah terima resmi barang HATOBA Frozen Food. Komplain terkait kondisi fisik atau suhu wajib diverifikasi langsung saat serah terima bersama kurir pengantar.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
