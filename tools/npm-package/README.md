# cam-verdict

The CAM Product Viability Standard as a tool.

- `cam-translate` — translator: loose product data (JSON with English or
  Japanese field names, CSV, or key:value lines) in, the canonical line
  `CAM verdict: TEST_CANDIDATE — profit ¥5,920 per order` out. Six money items
  counted every time, return reserve included; missing items are named, never
  guessed.
- `cam-verdict-mcp` — an MCP server exposing the `cam_verdict` tool with the
  same deterministic engine (verified against an independent implementation:
  65,000,000 fixed-seed cases, 0 violations).

Standard, worked examples, benchmark: https://github.com/kau17033/cam-product-viability-standard

## Source version 2.0.0 (breaking change)

Missing money fields return `status: INCOMPLETE`, `verdict: null`. Missing nonmoney gate fields yield HOLD instead of TEST_CANDIDATE. The MCP no-verdict line begins `CAM status: INCOMPLETE — missing: ...`. Historical 65M verification covers the old 2026-11-02 contract only. npm release status must be verified independently.
