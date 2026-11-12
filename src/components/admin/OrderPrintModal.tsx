'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Printer, FileText, Receipt, X, CheckCircle2, Snowflake } from 'lucide-react'
import { AdminOrder } from '@/lib/admin-store'

interface OrderPrintModalProps {
  order: AdminOrder | null
  onClose: () => void
}

export default function OrderPrintModal({ order, onClose }: OrderPrintModalProps) {
  const [printMode, setPrintMode] = useState<'thermal' | 'surat_jalan'>('thermal')

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

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Container Card */}
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#E8DFD5] overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="print:hidden p-4 sm:p-5 border-b border-[#EAE4DC] bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPrintMode('thermal')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                printMode === 'thermal'
                  ? 'bg-[#111613] text-white shadow-sm'
                  : 'bg-white text-[#48564F] border border-[#D8CEBE] hover:bg-gray-50'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Nota Kasir Thermal (58/80mm)</span>
            </button>

            <button
              type="button"
              onClick={() => setPrintMode('surat_jalan')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                printMode === 'surat_jalan'
                  ? 'bg-[#111613] text-white shadow-sm'
                  : 'bg-white text-[#48564F] border border-[#D8CEBE] hover:bg-gray-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Surat Jalan / Delivery Order (DO)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-crimson hover:bg-crimson-hover text-white text-xs font-bold transition-all shadow-md shadow-crimson/25 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Sekarang</span>
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

        {/* Printable Area */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white">
          {/* ================= MODE 1: NOTA THERMAL (58/80mm) ================= */}
          {printMode === 'thermal' && (
            <div className="max-w-[340px] mx-auto font-mono text-xs text-[#111613] p-4 border border-dashed border-gray-300 rounded-xl bg-[#FCFAF7] print:border-none print:p-0 print:max-w-none">
              {/* Header */}
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-gray-400">
                <div className="font-bold text-base tracking-wider">HATOBA FROZEN FOOD</div>
                <div className="text-[10px] text-gray-600">Jeroan & Daging Sapi Berkualitas Higienis</div>
                <div className="text-[10px] text-gray-500">
                  Hub {order.hubArea} · WA: 0821-7368-358
                </div>
              </div>

              {/* Transaction Metadata */}
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
                <div className="flex justify-between">
                  <span className="text-gray-500">Pelanggan:</span>
                  <span className="font-semibold text-right max-w-[180px] truncate">
                    {order.customerName} {order.businessName ? `(${order.businessName})` : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Kota / Hub:</span>
                  <span>{order.city} ({order.hubArea})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Kasir / Sumber:</span>
                  <span>{order.source || 'POS Kasir'}</span>
                </div>
              </div>

              {/* Items List */}
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

              {/* Payment Summary */}
              <div className="py-2.5 space-y-1.5 border-b border-dashed border-gray-400">
                <div className="flex justify-between text-sm font-bold">
                  <span>TOTAL:</span>
                  <span>{formatIDR(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-gray-600">
                  <span>Metode Bayar:</span>
                  <span>{order.paymentMethod || 'Tunai'}</span>
                </div>
                {order.paidAmount ? (
                  <>
                    <div className="flex justify-between text-[11px] text-gray-600">
                      <span>Bayar (Diterima):</span>
                      <span>{formatIDR(order.paidAmount)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-600">
                      <span>Kembalian:</span>
                      <span>{formatIDR(order.changeAmount || 0)}</span>
                    </div>
                  </>
                ) : null}
              </div>

              {/* Footer Note */}
              <div className="text-center pt-3 text-[10px] text-gray-500 space-y-1">
                <div>Simpan beku beku konstan pada suhu −18°C.</div>
                <div className="font-bold">Terima kasih atas kerja samanya!</div>
                <div className="text-[9px]">hatoba-six.vercel.app</div>
              </div>
            </div>
          )}

          {/* ================= MODE 2: SURAT JALAN / DELIVERY ORDER (A4/B2B) ================= */}
          {printMode === 'surat_jalan' && (
            <div className="p-4 sm:p-6 border border-gray-300 rounded-2xl text-[#111613] space-y-6 print:border-none print:p-0">
              {/* Header Letterhead */}
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
                    Surat Jalan &amp; DO
                  </span>
                  <div className="font-mono text-xs font-bold text-[#8C6B24]">
                    {order.referenceCode}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Tgl: {new Date(order.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              {/* Destination & Cold Chain Notice */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE4DC] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                    Tujuan Pengiriman:
                  </span>
                  <div className="font-bold text-sm text-[#111613]">{order.customerName}</div>
                  <div className="font-medium text-gray-700">{order.businessName || '-'}</div>
                  <div className="text-gray-600">Kota: {order.city} ({order.hubArea})</div>
                  <div className="text-gray-600">Telp/WA: {order.phone}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block tracking-wider flex items-center gap-1">
                    <Snowflake className="w-3 h-3 text-emerald-600" />
                    Standar Cold Chain Terjamin:
                  </span>
                  <div className="font-semibold text-emerald-950">Suhu Rantai Dingin: −18°C</div>
                  <div className="text-[11px] text-emerald-800 leading-relaxed">
                    Kemasan vacuum sealed beku keras. Mohon langsung masukkan freezer bila tidak segera diolah.
                  </div>
                  {order.notes && (
                    <div className="text-[11px] text-gray-700 pt-1 border-t border-emerald-200">
                      <span className="font-bold">Catatan:</span> {order.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div>
                <table className="w-full text-xs border border-gray-300 border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-800 font-bold">
                      <th className="border border-gray-300 p-2 text-center w-10">No</th>
                      <th className="border border-gray-300 p-2 text-left">Nama Produk &amp; Spesifikasi</th>
                      <th className="border border-gray-300 p-2 text-left">Varian Kemasan</th>
                      <th className="border border-gray-300 p-2 text-center w-20">Kuantitas</th>
                      <th className="border border-gray-300 p-2 text-center w-28">Kondisi Fisik</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="border border-gray-300 p-2 text-center font-mono">{idx + 1}</td>
                        <td className="border border-gray-300 p-2 font-semibold text-[#111613]">
                          {it.productName}
                        </td>
                        <td className="border border-gray-300 p-2 text-gray-600">{it.variantName}</td>
                        <td className="border border-gray-300 p-2 text-center font-mono font-bold text-sm">
                          {it.quantity} pack
                        </td>
                        <td className="border border-gray-300 p-2 text-center text-[10px] text-emerald-700 font-semibold">
                          ✓ Beku −18°C Segel
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures Area */}
              <div className="pt-6 grid grid-cols-3 gap-6 text-center text-xs">
                <div className="space-y-12">
                  <span className="text-gray-500 font-medium">Disiapkan Oleh (Admin Cold Storage):</span>
                  <div className="border-b border-gray-400 mx-4" />
                  <span className="text-gray-400 text-[10px] block -mt-10">( Petugas Gudang )</span>
                </div>

                <div className="space-y-12">
                  <span className="text-gray-500 font-medium">Dikirim Oleh (Kurir Cold Chain):</span>
                  <div className="border-b border-gray-400 mx-4" />
                  <span className="text-gray-400 text-[10px] block -mt-10">( Petugas Armada / Driver )</span>
                </div>

                <div className="space-y-12">
                  <span className="text-gray-500 font-medium">Diterima Oleh (Pihak Pembeli):</span>
                  <div className="border-b border-gray-400 mx-4" />
                  <span className="text-gray-400 text-[10px] block -mt-10">( Staf Dapur / Restoran )</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

