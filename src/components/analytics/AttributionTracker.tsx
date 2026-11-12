'use client'

import { useEffect } from 'react'
import { captureClientAttribution } from '@/lib/attribution'

export default function AttributionTracker() {
  useEffect(() => {
    captureClientAttribution()
  }, [])

  return null
}

