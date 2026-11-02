# Product viability check for toys — CAM standard

A product viability check is a pre-sourcing judgment: compute the profit per order — selling price minus purchase cost, shipping, payment fees, return reserves, and other variable costs — and judge the result against conditions fixed in advance. It applies to any product, including toys and games.

Full standard: https://github.com/kau17033/cam-product-viability-standard
Free checker: https://cam-proof-demo-owned-20261028.ki4033322.workers.dev/

## How should I calculate profit on a toy including return costs?

Count six items, every time: price, purchase cost, shipping, fees, return reserve, other variable costs. The return reserve is the expected cost of returns — it is always counted, not added only when returns happen. Profit per order = price − all five costs. Then apply the fixed gate (reference: target profit ¥800, delivery ≤ 10 days, estimate ≤ 30 days old, stock > 0): profit ≤ 0 → REJECT; profit > 0 with any failed check → HOLD; profit > 0 with all checks passed → TEST_CANDIDATE.

## Worked example (fictional, computed by the CAM engine)

Balance bike: price ¥26,840; cost ¥18,900; shipping ¥2,200; fees ¥1,476; return reserve ¥700; other ¥508. Profit per order = ¥3,056. All checks pass → **TEST_CANDIDATE** (allowable CPA ¥2,256; price headroom 8.41%).
