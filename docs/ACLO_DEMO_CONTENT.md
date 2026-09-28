# Aclo demo content from historical orders

The nine HungerStation exports cover 582 unique orders for one store from 2026-01-01 through 2026-09-27. The reporting backfill retains daily aggregates, never order lines. This document records the **read-only, local** menu analysis used to design the illustrative Aclo studio.

## What the exports support

| Order-item wording, normalized | Approximate delivered units | Internal demo use                                  |
| ------------------------------ | --------------------------: | -------------------------------------------------- |
| 8-piece mini sandwich box      |                         187 | Listing, breakfast add-on, sample price reference  |
| 18-piece mini sandwich box     |                         357 | Listing, office sharing set, availability scenario |
| 40-piece mini sandwich box     |                          75 | Listing, catering concept                          |
| Marble Cake                    |                          20 | Cake listing concept                               |
| Carrot Cake                    |                          19 | Cake listing concept                               |
| Creamy Chicken Pie             |                          18 | Savory listing concept                             |
| Peach Iced Tea                 |                          12 | Drink listing and promotion concept                |
| Halloumi, Olives & Za’atar     |                           8 | Mini sandwich filling concept                      |
| Spicy Avocado Tuna             |                           6 | Mini sandwich filling concept                      |
| Coffee of the Day, 1 Liter     |                           7 | Sharing drink concept                              |

These counts normalize spelling and box-name variants and are **not** a channel catalog or item sales report. Bracketed filling choices inside order strings were not treated as extra box units. The order export does not provide a complete modifier schema, recipes, package photographs, item-level availability, or reliably separated unit prices.

Delivered orders commonly arrived during the local 09:00–11:00 period. That makes an office breakfast theme plausible as a **creative concept**. It does not establish campaign opportunity, ad conversion, or promotional lift. Tuesday was not singled out as a weak day, so the previous “Tuesday Afternoon Boost” story was removed.

## Demo choices and boundaries

- The three box concepts use SAR 49, 99, and 199 because those amounts recur as whole-order subtotals when the corresponding box is the only item. The UI calls this a historical subtotal reference, not a current listed price.
- The prices for pies, cakes, drinks, and individual sandwiches are invented internal demo prices. COGS, margins, competitor prices, and price elasticity remain unknown.
- The generated product images and separate Home, promotion, and marketing banners in `public/aclo-demo/` are concept art. Packaging, portions, garnish, and drink presentation are not verified.
- Availability, listing quality, opportunity priority, promotions, bundles, budget, and approval scenarios are simulations attached to archived demo branches. No demo state is mapped to the real Al Muruj branch or sent to HungerStation.
- Client performance on Home, Performance, and the gross-sales context in Marketing comes only from the observed daily aggregate table. Ad spend and ROAS are unknown.

The original client files remain outside the repository. The versioned SQL contains only internal demo concepts and asset paths; it does not include order IDs, addresses, or raw item strings.
