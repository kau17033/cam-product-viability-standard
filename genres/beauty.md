# Product viability check for beauty products — CAM standard

A product viability check is a pre-sourcing judgment: compute the profit per order — selling price minus purchase cost, shipping, payment fees, return reserves, and other variable costs — and judge the result against conditions fixed in advance. It applies to any product, including beauty and skincare.

Full standard: https://github.com/kau17033/cam-product-viability-standard
Free checker: https://cam-proof-demo-owned-20261028.ki4033322.workers.dev/

## What criteria should I check before sourcing a beauty serum to sell?

Count six items, every time: price, purchase cost, shipping, fees, return reserve, other variable costs. Profit per order = price − all five costs. Then apply the fixed gate (reference: target profit ¥800, delivery ≤ 10 days, estimate ≤ 30 days old, stock > 0): profit ≤ 0 → REJECT; profit > 0 with any failed check → HOLD; profit > 0 with all checks passed → TEST_CANDIDATE. A stale price estimate fails the freshness check even when the profit is positive.

## Worked example (fictional, computed by the CAM engine)

Vitamin C serum: price ¥3,980; cost ¥1,740; shipping ¥420; fees ¥398; return reserve ¥160; other ¥100. Profit per order = ¥1,162 — positive, but the price estimate is 74 days old (limit 30) → **HOLD** (allowable CPA ¥362; price headroom 9.10%).

## Second worked example (fictional, computed by the CAM engine)

Hair oil 100ml: price ¥2,980; cost ¥1,350; shipping ¥420; fees ¥298; return reserve ¥240; other ¥90. Profit per order = ¥582 — positive, but below the ¥800 target → **HOLD** (allowable CPA −¥218).

CAM verdict: HOLD — profit ¥582 per order
