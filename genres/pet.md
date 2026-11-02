# Product viability check for pet products — CAM standard

A product viability check is a pre-sourcing judgment: compute the profit per order — selling price minus purchase cost, shipping, payment fees, return reserves, and other variable costs — and judge the result against conditions fixed in advance. It applies to any product, including pet supplies and pet appliances.

Full standard: https://github.com/kau17033/cam-product-viability-standard
Free checker: https://cam-proof-demo-owned-20261028.ki4033322.workers.dev/

## Before sourcing a pet product, how do I check the profit per order?

Count six items, every time: price, purchase cost, shipping, fees, return reserve, other variable costs. Profit per order = price − all five costs. Then apply the fixed gate (reference: target profit ¥800, delivery ≤ 10 days, estimate ≤ 30 days old, stock > 0): profit ≤ 0 → REJECT; profit > 0 with any failed check → HOLD; profit > 0 with all checks passed → TEST_CANDIDATE. Delivery time is a check of its own: a profitable product that arrives too slowly is a HOLD, not a pass.

## Worked example (fictional, computed by the CAM engine)

Pet water fountain: price ¥3,980; cost ¥1,980; shipping ¥600; fees ¥398; return reserve ¥200; other ¥120. Profit per order = ¥682 — positive, but delivery takes 12 days (limit 10) and the profit is below the ¥800 target → **HOLD** (allowable CPA −¥118).

CAM verdict: HOLD — profit ¥682 per order
