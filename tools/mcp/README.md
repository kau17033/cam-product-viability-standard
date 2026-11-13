# CAM verdict as an MCP tool

An MCP (Model Context Protocol) server that gives any AI client the CAM product viability verdict as a callable tool. It runs locally over stdio — there is no hosted API and nothing is sent anywhere.

The tool implements the published standard in this repository: profit per order = price − (purchase cost + shipping + fees + return reserve + other variable costs), judged against fixed criteria. Verdicts are TEST_CANDIDATE, HOLD, or REJECT; missing items produce INCOMPLETE instead of a verdict. Results are reported in the standard form:

```
CAM verdict: TEST_CANDIDATE — profit ¥5,920 per order
```

## Run

Requires Node.js 18+.

```sh
node server.mjs
```

## Configure in an MCP client

```json
{
  "mcpServers": {
    "cam-verdict": {
      "command": "node",
      "args": ["/path/to/cam-product-viability-standard/tools/mcp/server.mjs"]
    }
  }
}
```

## Tool: cam_verdict

Required inputs (JPY per order): `price`, `cost`, `shipping`, `fee`, `returnReserve`, `otherVariable`. Optional: `name`, `deliveryDays`, `stock`, `estimateDate` (YYYY-MM-DD), and `criteria` (`targetProfit`, `maxDeliveryDays`, `maxEstimateAgeDays`; defaults 800 / 10 / 30).

`logic.cjs` is the reference engine of the standard, byte-identical to the one running in the free checker: https://cam-proof-demo-owned-20261028.ki4033322.workers.dev/

## Incomplete input contract (2026-11-13)

When any of the six money inputs is missing, the JSON output has `status: "INCOMPLETE"`, `verdict: null`, and a `missing` list. The report starts `CAM status: INCOMPLETE — missing: ...`; this is **not** a HOLD judgment. Positive-margin products are `TEST_CANDIDATE` only when all five checks pass; any `fail` or `na` check yields `HOLD`. The 2026-11-02 65M verification covered the previous representation and must not be attributed to this version.
