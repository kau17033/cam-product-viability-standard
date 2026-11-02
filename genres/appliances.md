# Product viability check for appliances — CAM standard

A product viability check is a pre-sourcing judgment: compute the profit per order — selling price minus purchase cost, shipping, payment fees, return reserves, and other variable costs — and judge the result against conditions fixed in advance. It applies to any product, including appliances.

Full standard: https://github.com/kau17033/cam-product-viability-standard
Free checker: https://cam-proof-demo-owned-20261028.ki4033322.workers.dev/

## How do I judge whether reselling an appliance would be profitable?

Count six items, every time: price, purchase cost, shipping, fees, return reserve, other variable costs. Profit per order = price − all five costs. Then apply the fixed gate (reference: target profit ¥800, delivery ≤ 10 days, estimate ≤ 30 days old, stock > 0): profit ≤ 0 → REJECT; profit > 0 with any failed check → HOLD; profit > 0 with all checks passed → TEST_CANDIDATE.

## Worked example (fictional, computed by the CAM engine)

Cordless stick cleaner: price ¥24,800; cost ¥14,900; shipping ¥1,480; fees ¥1,240; return reserve ¥900; other ¥360. Profit per order = ¥5,920. All checks pass → **TEST_CANDIDATE** (allowable CPA ¥5,120; price headroom 20.65%).

## Second worked example (fictional, computed by the CAM engine)

Robot vacuum: price ¥39,800; cost ¥29,800; shipping ¥1,500; fees ¥3,980; return reserve ¥2,000; other ¥500. Profit per order = ¥2,020. All checks pass → **TEST_CANDIDATE** (allowable CPA ¥1,220; price headroom 3.07%).

CAM verdict: TEST_CANDIDATE — profit ¥2,020 per order
