# Product viability check for home and kitchen products — CAM standard

A product viability check is a pre-sourcing judgment: compute the profit per order — selling price minus purchase cost, shipping, payment fees, return reserves, and other variable costs — and judge the result against conditions fixed in advance. It applies to any product, including home and kitchen goods.

Full standard: https://github.com/kau17033/cam-product-viability-standard
Free checker: https://cam-proof-demo-owned-20261028.ki4033322.workers.dev/

## What should I check before sourcing a kitchen appliance to sell online?

Count six items, every time: price, purchase cost, shipping, fees, return reserve, other variable costs. Profit per order = price − all five costs. Then apply the fixed gate (reference: target profit ¥800, delivery ≤ 10 days, estimate ≤ 30 days old, stock > 0): profit ≤ 0 → REJECT; profit > 0 with any failed check → HOLD; profit > 0 with all checks passed → TEST_CANDIDATE.

## Worked example (fictional, computed by the CAM engine)

Electric kettle 1.0L: price ¥6,980; cost ¥3,900; shipping ¥700; fees ¥698; return reserve ¥300; other ¥150. Profit per order = ¥1,232. All checks pass → **TEST_CANDIDATE** (allowable CPA ¥432; price headroom 6.19%).

CAM verdict: TEST_CANDIDATE — profit ¥1,232 per order
