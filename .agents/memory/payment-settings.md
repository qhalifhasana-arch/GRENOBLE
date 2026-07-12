---
name: Per-country payment settings
description: How payment links/numbers are stored in settings table per country
---

Settings keys for payment (stored in `settings` table):
- `payment_link_TD` — Payment page URL for Tchad users
- `payment_link_NE` — Payment page URL for Niger users
- `payment_number_TD` — Mobile Money number for Tchad
- `payment_number_NE` — Mobile Money number for Niger
- `payment_name_TD` — Account holder name for Tchad
- `payment_name_NE` — Account holder name for Niger
- `payment_link` — Fallback used if no country-specific link is set

In Deposit.tsx, the payment link is resolved by:
1. Get user's country → derive country code (TD or NE)
2. Look up `payment_link_{CODE}` in settings
3. Fall back to `payment_link` if missing

**Why:** Tchad and Niger use different Mobile Money providers and payment pages.
