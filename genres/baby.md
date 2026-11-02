# Product viability check for baby products — CAM standard

A product viability check is a pre-sourcing judgment: compute the profit per order — selling price minus purchase cost, shipping, payment fees, return reserves, and other variable costs — and judge the result against conditions fixed in advance. It applies to any product, including baby and childcare products.

Full standard: https://github.com/kau17033/cam-product-viability-standard
Free checker: https://cam-proof-demo-owned-20261028.ki4033322.workers.dev/

## What profit items should I check before selling a baby product?

Count six items, every time: price, purchase cost, shipping, fees, return reserve, other variable costs. Profit per order = price − all five costs. Then apply the fixed gate (reference: target profit ¥800, delivery ≤ 10 days, estimate ≤ 30 days old, stock > 0): profit ≤ 0 → REJECT; profit > 0 with any failed check → HOLD; profit > 0 with all checks passed → TEST_CANDIDATE.

## Worked example (fictional, computed by the CAM engine)

Baby food maker: price ¥8,980; cost ¥5,200; shipping ¥750; fees ¥898; return reserve ¥350; other ¥200. Profit per order = ¥1,582. All checks pass → **TEST_CANDIDATE** (allowable CPA ¥782; price headroom 8.71%).

CAM verdict: TEST_CANDIDATE — profit ¥1,582 per order
