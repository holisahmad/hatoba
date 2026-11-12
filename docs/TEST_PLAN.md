# TEST PLAN & QUALITY VERIFICATION — HATOBA GROUP

## 1. Test Suite Coverage

### Unit Tests
- `calculateOrderSubtotal`: Correct integer summation of items.
- `validateServiceArea`: Proper acceptance of Bali and Yogyakarta, graceful rejection/prompt for unsupported areas.
- `formatWhatsAppOrderMessage`: Accurate formatting with order reference, itemized list, and clean URL encoding.
- `parseMarketingAttribution`: Accurate extraction of UTM parameters and referral codes.

### Functional / Integration Tests
- Order submission creates a valid lead record and returns an authorized WhatsApp click URL.
- Raw inquiry submission functions without requiring price or pack selection.
- Multi-channel corporate smart form routes inquiries to the correct department.

### Responsive & Accessibility QA
- Verification across 320px (Mobile), 768px (Tablet), 1024px (Laptop), and 1440px (Wide Desktop).
- Interactive navigation drawer on mobile with touch-friendly CTA buttons.
- Proper contrast ratios (WCAG AA) on obsidian, deep emerald, and alabaster white sections.

