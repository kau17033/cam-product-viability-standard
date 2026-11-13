# CAM analysis and formal validation, additive v1 (2026-11-13)

## Scope and ownership
This package adds **only** analysis/tests/proofs/docs to
[cam-product-viability-standard](https://github.com/kau17033/cam-product-viability-standard).
The canonical \`tools/mcp/logic.cjs\`, its existing copies, Python engine,
output schema, historic 65M evidence, and published packages are **unchanged**.
It must not be interpreted as a CAM commercial product launch.

**Source boundary**: \`analysis/analysis.cjs\` never calls or mutates core
\`evaluate()\`; the only invocation of that engine occurs in regression tests.
Results do not alter TEST_CANDIDATE / HOLD / REJECT.

## Version boundaries (do not conflate releases)
The original base commit \`5e5b0719\` represented incomplete money as
\`incomplete: true\` with a placeholder HOLD and could issue TEST_CANDIDATE
when optional gates remained \`na\`. During this implementation, PR #1
merged into main at \`ddccc93c\`, changing these semantics in source v2.
This analysis package does not modify or validate that migration.
The JavaScript freshness check still needs an explicit \`options.today\`
to be reproducible from declared inputs. Published distributions must be
verified independently from repository source. The 65,000,000 historical
cases are not rerun and do not prove either the source v2 transition or
this analysis package.

## Arithmetic
All analysis inputs are required, declared **nonnegative safe-integer JPY**
per order; price must be positive. No floats, implicit averages, currencies,
returns rate estimates, tax estimates, exchange-rate retrieval, or demand
assumptions. Unsafe amounts, missing values, unknown interval fields, and
nominal values outside declared bounds raise errors. The analysis API does
not invent a missing baseline price or cost.

- \`m = p - sum(cost_i)\`
- \`d(m)/d(p) = +1\`; \`d(m)/d(cost_i) = -1\` for the **linear fixed-fee** core only.
- \`extraCostToReject = max(m, 0)\`, in integer JPY (already rejected => 0).
- \`extraCostToFailTargetCheck = 0\` if \`m < t\`, else \`m - t + 1\`;
  \`null\` when target is undeclared. This is a **target-check** boundary,
  NOT a guarantee of a transition to HOLD: REJECT may occur first.
- \`mostFragileCost = null\` because five constant -1 coefficients cannot
  order cost categories without externally supplied constraints.
- Each user-declared interval contains the nominal cost:
  \`low_i <= nominal_i <= high_i\`. Unspecified costs use [nominal, nominal].
  \`lowerMargin = p - sum(high_i)\`;
  \`upperMargin = p - sum(low_i)\`. These are inclusion bounds; joint
  attainability is not guaranteed when costs are correlated.
- \`minimumPriceForTarget\` returns the **integer ceiling**
  \`ceil((otherCosts + fixedFee + targetProfit) / (1 - numerator/denominator))\`
  for \`0 <= numerator < denominator\`. This is exact rational algebra
  **before payment-processor rounding**; processors with rounding rules need
  an external model.

## Separation contract
\`analyze(product, {targetProfit, intervals})\` is opt-in and read-only.
It returns \`domain\`, \`margin\`, \`sensitivity\`, \`boundaries\`,
\`interval\` and \`mostFragileCost\`. No \`verdict\` field, so consumers
cannot confuse an interval with the authoritative gate. Existing APIs and
legacy output schema are untouched. Use a wrapper such as
\`{core: evaluate(...), analysis: analyze(...)}\` only in a new API/version,
not as a patch to the existing return object.

## Validation evidence boundary
\`node tests/analysis.test.cjs\` compares 3,000 seeded independent
metamorphic inputs against the untouched JS core, checks no modification,
tests invalid inputs and integer rate-fee inversions. The Z3 script searches
for counterexamples to mathematical integer invariants. Lean independently
proves small integer-algebra theorems, not floating-point behavior,
input coercion, schema conformance, all 65M past cases, or multi-language
equivalence. Do not state stronger claims than actual CI results.

No hosted API, telemetry export, paid services or model inference is added.
