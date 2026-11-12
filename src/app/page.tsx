import React from 'react'
import HeroCorporate from '@/components/corporate/HeroCorporate'
import FootprintMap from '@/components/corporate/FootprintMap'
import BentoEcosystem from '@/components/corporate/BentoEcosystem'
import StrategicRoadmap from '@/components/corporate/StrategicRoadmap'
import SynergyPillars from '@/components/corporate/SynergyPillars'
import SmartInquiryForm from '@/components/corporate/SmartInquiryForm'
import ProductCatalogSection from '@/components/commerce/ProductCatalogSection'
import PartnerShowcase from '@/components/corporate/PartnerShowcase'
import AttributionTracker from '@/components/analytics/AttributionTracker'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FBF9F5] text-[#111613]">
      {/* Client-side attribution capture */}
      <AttributionTracker />

      {/* 1. Hero Section (Layar Pertama) */}
      <HeroCorporate />

      {/* 2. Profil Korporat & Jejak Operasional (Corporate Footprint) */}
      <FootprintMap />

      {/* 3. Ekosistem & Pilar Bisnis (Bento Grid 4 Cards) */}
      <BentoEcosystem />

      {/* 4. Peta Jalan Pertumbuhan (Strategic Roadmap 2024-2027+) */}
      <StrategicRoadmap />

      {/* 5. Keunggulan Sinergi Grup (Why Partner With HATOBA Group) */}
      <SynergyPillars />

      {/* 6. Jejak Kemitraan & Kepercayaan Dapur Kuliner */}
      <PartnerShowcase />

      {/* Commercial Showcase: Katalog Produk B2B HATOBA Frozen Food */}
      <ProductCatalogSection />

      {/* 6. Portal Kemitraan & Kontak Eksekutif (Smart Inquiry Form) */}
      <SmartInquiryForm />
    </main>
  )
}
