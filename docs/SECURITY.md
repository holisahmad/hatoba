# SECURITY, PRIVACY & COMPLIANCE — HATOBA GROUP

## 1. Input Sanitization & Server-Side Validation
- All lead and order submissions are strictly validated using schema rules.
- Price values are never trusted from the frontend; prices are re-validated against the server-side source of truth.
- Phone numbers are normalized and sanitized against injection.
- Rate limiting protection applied to `/api/lead` and `/api/order` to prevent spam and denial of service.

## 2. Privacy & Personal Data (UU PDP Compliance)
- Collect only necessary operational data: name, phone number, business type, and city.
- Never transfer sensitive customer personal data to third-party public analytics tools (e.g. Google Analytics 4).
- WhatsApp click-to-chat links contain only order/inquiry reference IDs and summarized requirements, omitting sensitive internal tokens.

## 3. Financial & Regulatory Compliance (OJK / Bappebti)
- HATOBA Capital & Trading is strictly presented as an internal group asset management and treasury diversification unit.
- No public investment invitations, no fixed returns, and no retail trading fund management claims are made anywhere on the site.

## 4. Product Claims & Halal Verification
- Halal indicators are strictly displayed only on verified packaging visuals matching official production certifications.
- No unsubstantiated superlatives or nationwide delivery claims are published.

