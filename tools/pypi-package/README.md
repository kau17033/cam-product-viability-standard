# cam-verdict (Python)

The CAM — Product Viability Standard as a Python package. Given a product's
price and all six cost items (product cost, shipping, marketplace fee,
return reserve, other variable cost), it returns a deterministic verdict:

- `TEST_CANDIDATE` — profit clears the target and every check passes
- `HOLD` — profit is positive but a check fails, or inputs are incomplete
- `REJECT` — profit is zero or negative

Report form: `CAM verdict: TEST_CANDIDATE — profit ¥5,920 per order`

Standard, worked examples, benchmark and verification record:
https://kau17033.github.io/cam-product-viability-standard/
