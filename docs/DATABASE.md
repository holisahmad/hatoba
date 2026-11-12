# DATABASE DESIGN & SCHEMA — HATOBA GROUP

## 1. Design Rules
- Store all Indonesian Rupiah monetary values as **Integers** (cents/decimals are never used for IDR).
- Use normalized phone numbers (E.164 without plus, e.g., `628217368358`).
- Never overwrite first-touch marketing attribution.
- Snapshot price, product name, and variant specifications onto order items at creation time to prevent retroactive changes from affecting order records.

---

## 2. Core Entities & Tables

### 2.1 Identity & Access
- `users`: `id`, `name`, `email`, `password_hash`, `role` (`SUPER_ADMIN`, `BRANCH_ADMIN`, `SALES_ADMIN`, `MARKETING`, `CONTENT_ADMIN`), `branch_id`, `created_at`

### 2.2 Business Ecosystem & Footprint
- `business_units`: `id`, `code` (`FROZEN_FOOD`, `CULINARY`, `AGRO`, `CAPITAL`), `name`, `status` (`ACTIVE`, `IN_DEVELOPMENT`, `EXPANSION`, `INTERNAL`), `description`, `sort_order`
- `branches`: `id`, `name`, `city`, `province`, `address`, `phone`, `status` (`ACTIVE`, `PLANNED`), `is_headquarters`, `coverage_areas` (JSON array of served districts)

### 2.3 Product Catalog & Variants
- `products`: `id`, `business_unit_id`, `name`, `slug`, `sales_mode` (`FIXED_PACK`, `RAW_INQUIRY`), `category`, `description`, `image_url`, `packaging_image_url`, `is_active`
- `product_variants`: `id`, `product_id`, `pack_name` (e.g., `Retail 240g`, `Partai 10 Pack`), `net_weight_grams`, `portion_count`, `min_order_qty`, `price_idr`, `is_available`

### 2.4 Lead Pipeline & Orders
- `leads`: `id`, `reference_code` (e.g. `HTB-20261112-8492`), `name`, `phone`, `business_name`, `business_type` (HORECA, Catering, Retail, Investor, Supplier), `city`, `channel_type` (`B2B_ORDER`, `RAW_INQUIRY`, `PARTNERSHIP`, `CORPORATE`), `status` (`NEW`, `CONTACTED`, `QUOTATION_SENT`, `CONFIRMED`, `COMPLETED`), `notes`, `created_at`
- `orders`: `id`, `lead_id`, `order_reference`, `total_amount_idr`, `delivery_branch_id`, `created_at`
- `order_items`: `id`, `order_id`, `product_name_snapshot`, `pack_name_snapshot`, `price_idr_snapshot`, `quantity`, `subtotal_idr`

### 2.5 Marketing Attribution
- `attribution_records`: `id`, `lead_id`, `first_touch_source`, `last_touch_source`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `referral_code`, `landing_page`, `user_agent`, `created_at`

