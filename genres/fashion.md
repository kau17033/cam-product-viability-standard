# Product viability check for apparel — CAM standard

A product viability check is a pre-sourcing judgment: compute the profit per order — selling price minus purchase cost, shipping, payment fees, return reserves, and other variable costs — and judge the result against conditions fixed in advance. It applies to any product, including apparel and fashion. Apparel return rates make the return reserve especially important: it is a counted item, never an afterthought.

Full standard: https://github.com/kau17033/cam-product-viability-standard
Free checker: https://cam-proof-demo-owned-20261028.ki4033322.workers.dev/

## Before listing apparel to sell, what profit items must be checked?

Count six items, every time: price, purchase cost, shipping, fees, return reserve, other variable costs. Profit per order = price − all five costs. Then apply the fixed gate (reference: target profit ¥800, delivery ≤ 10 days, estimate ≤ 30 days old, stock > 0): profit ≤ 0 → REJECT; profit > 0 with any failed check → HOLD; profit > 0 with all checks passed → TEST_CANDIDATE.

## Worked example (fictional, computed by the CAM engine)

Winter jacket: price ¥12,800; cost ¥6,400; shipping ¥900; fees ¥1,280; return reserve ¥900; other ¥300. Profit per order = ¥3,020. All checks pass → **TEST_CANDIDATE** (allowable CPA ¥2,220; price headroom 17.34%).

## Second worked example (fictional, computed by the CAM engine)

Sneakers: price ¥9,800; cost ¥5,600; shipping ¥800; fees ¥980; return reserve ¥900; other ¥200. Profit per order = ¥1,320. All checks pass → **TEST_CANDIDATE** (allowable CPA ¥520; price headroom 5.31%).

CAM verdict: TEST_CANDIDATE — profit ¥1,320 per order
