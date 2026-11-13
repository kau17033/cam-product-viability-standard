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

## Real, observable baseline discrepancies (not silently repaired)
On the base main at integration time, \`logic.cjs\` emits HOLD with
\`incomplete: true\` on missing money, although the textual standard says
no verdict should be issued. Also, a complete money input with \`na\`
nonmoney gates may produce TEST_CANDIDATE. The Python port has a different
stock-absent representation. The JavaScript freshness check depends on
\`options.today\` (otherwise wall-clock time). These are separate contract
migration tasks. **Do not claim they are fixed by this package.**
An existing open v2 PR addresses part of that migration but changes the
public output contract; merging it requires its own compatibility gate.
65,000,000 historical cases are not rerun and are not a proof of this package.

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
