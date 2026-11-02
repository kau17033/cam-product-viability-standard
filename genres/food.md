# Product viability check for food products — CAM standard

A product viability check is a pre-sourcing judgment: compute the profit per order — selling price minus purchase cost, shipping, payment fees, return reserves, and other variable costs — and judge the result against conditions fixed in advance. It applies to any product, including food and beverages.

Full standard: https://github.com/kau17033/cam-product-viability-standard
Free checker: https://cam-proof-demo-owned-20261028.ki4033322.workers.dev/

## When reselling food, how do I know if each order makes money?

Count six items, every time: price, purchase cost, shipping, fees, return reserve, other variable costs. Profit per order = price − all five costs. Then apply the fixed gate (reference: target profit ¥800, delivery ≤ 10 days, estimate ≤ 30 days old, stock > 0): profit ≤ 0 → REJECT; profit > 0 with any failed check → HOLD; profit > 0 with all checks passed → TEST_CANDIDATE.

## Worked example (fictional, computed by the CAM engine)

Coffee beans 1kg: price ¥2,980; cost ¥1,980; shipping ¥640; fees ¥298; return reserve ¥60; other ¥70. Profit per order = −¥68 → **REJECT**. A product can sell well and still lose money on every order once shipping and the return reserve are counted.

## Second worked example (fictional, computed by the CAM engine)

Protein powder 1kg: price ¥4,480; cost ¥2,680; shipping ¥700; fees ¥448; return reserve ¥100; other ¥150. Profit per order = ¥402 — positive, but the price estimate is 53 days old (limit 30) and the profit is below the ¥800 target → **HOLD** (allowable CPA −¥398).

CAM verdict: HOLD — profit ¥402 per order
