export interface AttributionData {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  referralCode?: string
  landingPage?: string
  referrer?: string
  firstTouchTimestamp?: string
}

const STORAGE_KEY_FIRST_TOUCH = 'hatoba_attribution_first'
const STORAGE_KEY_LAST_TOUCH = 'hatoba_attribution_last'

export function captureClientAttribution(): AttributionData {
  if (typeof window === 'undefined') return {}

  const urlParams = new URLSearchParams(window.location.search)
  const currentTouch: AttributionData = {
    utmSource: urlParams.get('utm_source') || undefined,
    utmMedium: urlParams.get('utm_medium') || undefined,
    utmCampaign: urlParams.get('utm_campaign') || undefined,
    utmTerm: urlParams.get('utm_term') || undefined,
    utmContent: urlParams.get('utm_content') || undefined,
    referralCode: urlParams.get('ref') || undefined,
    landingPage: window.location.pathname,
    referrer: document.referrer || 'direct',
  }

  try {
    // Check first touch
    const existingFirst = localStorage.getItem(STORAGE_KEY_FIRST_TOUCH)
    if (!existingFirst) {
      currentTouch.firstTouchTimestamp = new Date().toISOString()
      localStorage.setItem(STORAGE_KEY_FIRST_TOUCH, JSON.stringify(currentTouch))
    }

    // Update last non-direct touch if any UTM or referral exists
    if (currentTouch.utmSource || currentTouch.referralCode) {
      localStorage.setItem(STORAGE_KEY_LAST_TOUCH, JSON.stringify(currentTouch))
    }
  } catch {
    // localStorage might be unavailable/blocked in private mode
  }

  return currentTouch
}

export function getStoredAttribution(): { firstTouch?: AttributionData; lastTouch?: AttributionData } {
  if (typeof window === 'undefined') return {}
  try {
    const first = localStorage.getItem(STORAGE_KEY_FIRST_TOUCH)
    const last = localStorage.getItem(STORAGE_KEY_LAST_TOUCH)
    return {
      firstTouch: first ? JSON.parse(first) : undefined,
      lastTouch: last ? JSON.parse(last) : undefined,
    }
  } catch {
    return {}
  }
}

