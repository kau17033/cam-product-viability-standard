# Verification of the CAM verdict computation

The arithmetic and verdict logic of this standard were verified by comparing the
reference implementation against an independent implementation written from the
specification text only (no shared code), over fixed-seed synthetic cases.

## Result (2026-11-02)

- Total cases: **65,000,000**
- Violations: **0**
- Seed: 20261102 (fixed; the run is deterministic and re-runnable)
- Runtime used for the check: Node v24.22.1; base date for freshness checks: 2026-11-02

## Breakdown

| Class | Cases | Violations |
| --- | ---: | ---: |
| Complete-input grid | 46,656 | 0 |
| Condition crosses (target / delivery / freshness) | 23,328 | 0 |
| Complete-input fuzz | 21,000,000 | 0 |
| Partial-input monotonicity | 22,000,000 | 0 |
| Boundary algebra (missing-cost break-even) | 21,930,016 | 0 |
| Cross-check against the published tool build | 300 | 0 mismatches |

An earlier 1,000,000-case run (same seed, same method) also produced 0 violations;
the 65,000,000-case run is a strict superset.

## Artifact hashes (SHA-256)

- Results file: `08270a38154df004fca9863dd610f58a3984eefdb0b95b8ce5216b2d025bcf35`
- Verification harness: `a5f7c0f9d1175b8e1a0c9d9a5fb1ab4e4b33f8a4815c8337585f762cf7f8a735`
- Independent spec implementation: `f0431bc67cd748abbbaa9e85494951544cbf9cdc4e8d138d6802662065812b7b`

## Observations (not violations)

1. On partial inputs, the reference implementation returns `incomplete: true` and no
   profit; the verdict field carries the label "HOLD" in all 22,000,000 partial cases.
   This is a representation detail of the implementation: an incomplete input is not a
   judgment, and no profit figure is ever produced for it.
2. When the sum of known costs exactly equals the price (profit exactly 0), the verdict
   is REJECT, consistently across 13,275,411 boundary probes. Profit of exactly zero
   does not pass.

## Scope

This verification covers arithmetic and logic only: given the same inputs, the verdict
is always the same, and it matches the specification. It says nothing about whether a
product judged TEST_CANDIDATE will actually sell — realized outcomes are a separate,
empirical question that synthetic cases cannot answer.

## Historical verification scope and contract migration (2026-11-13)

The 65,000,000-case / zero-violation result above is a **historical, fixed-seed result** for the implementation verified on 2026-11-02. It is not a new verification run of the amended output contract. The historical implementation represented incomplete inputs as `incomplete: true` and a placeholder `verdict: "HOLD"` even though no verdict was issued. The current contract makes that representation unambiguous: `status: "INCOMPLETE"`, `verdict: null`; unconfirmed checks prevent `TEST_CANDIDATE`. The original records and hashes remain unchanged. Fresh independent verification of the amended contract must be recorded separately; do not label the historical 65M result as validation of the amended behavior.
