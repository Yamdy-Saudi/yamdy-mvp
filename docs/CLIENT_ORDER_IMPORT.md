# Client order export review

Nine HungerStation order-detail files cover one store from 2026-01-01 through 2026-09-27. The six XLSX files cover January–June; three CSV files cover July–September. All 582 Order IDs are unique across the files. The XLSX style XML is invalid for the standard workbook reader, so the one-time builder reads worksheet values directly from OOXML.

| Measure | Export result |
| --- | ---: |
| Orders | 582 |
| Delivered | 577 |
| Cancelled | 5 |
| Orders marked with a complaint | 5 |
| Dates containing an order | 211 |
| Delivered subtotal, labeled gross sales | SAR 62,296.00 |
| Delivered reported payout | SAR 27,437.84 |

| Month | Delivered orders | Delivered gross sales (SAR) | Reported payout (SAR) |
| --- | ---: | ---: | ---: |
| Jan 2026 | 37 | 3,808 | 1,402.04 |
| Feb 2026 | 41 | 4,550 | 1,938.94 |
| Mar 2026 | 34 | 4,015 | 1,672.72 |
| Apr 2026 | 56 | 5,632 | 2,701.46 |
| May 2026 | 69 | 7,287 | 3,060.00 |
| Jun 2026 | 109 | 11,991 | 4,950.60 |
| Jul 2026 | 87 | 9,538 | 4,280.04 |
| Aug 2026 | 62 | 7,229 | 3,610.08 |
| Sep 1–27, 2026 | 82 | 8,246 | 3,821.96 |

## Field interpretation

- Gross sales is the **Subtotal** of delivered orders before discounts. The export's **Estimated earnings** and **Payout Amount** are retained separately. They are not interchangeable, and payout differs from estimated earnings for most orders.
- Vendor-funded discounts, commission, online payment fee, operational charges, and Ads Fee are summed for delivered orders. Ads Fee is a reported order deduction; the report does not establish total ad spend, attributed revenue, or ROAS.
- Cancelled orders contribute to cancellation counts, not delivered-order financial totals. Five cancellations carry subtotal values, so summing all rows would overstate delivered sales.
- The files have 211 order dates within a 270-day interval. The other 59 dates have no records; the dashboard treats them as missing coverage rather than proven zero-sales days.
- Delivery timestamps exist on all 577 delivered orders. Ready-to-pick-up timestamps exist on only 290 of 582 orders, so the current import uses only complete receipt-to-delivery intervals.
- Payment type is blank on 9 rows and payment method on 12. “Is Payable” and “Marketing Fees Reasons” are blank throughout. Several tax, voucher, refund, and marketing-fee columns are zero throughout. These fields do not support additional dashboard claims.
- “Order Items” is free-form text without stable SKU keys. It cannot establish a verified catalog, product availability, item margins, or item-level recommendations.

## Source and limits

The daily backfill stores counts, delivered financial totals, delivery-time sums and counts, report digests, and coverage dates. It stores no raw Order IDs, addresses, or item descriptions. The report is a historical observation, not a live HungerStation connection or proof of customer-visible changes. Demo recommendations, catalog content, and campaign examples remain explicitly illustrative.
