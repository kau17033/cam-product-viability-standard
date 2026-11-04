# cam-verdict (Python)

mcp-name: io.github.kau17033/cam-product-viability-standard


The CAM — Product Viability Standard as a Python package. Given a product's
price and all six cost items (product cost, shipping, marketplace fee,
return reserve, other variable cost), it returns a deterministic verdict:

- `TEST_CANDIDATE` — profit clears the target and every check passes
- `HOLD` — profit is positive but a check fails, or inputs are incomplete
- `REJECT` — profit is zero or negative

Report form: `CAM verdict: TEST_CANDIDATE — profit ¥5,920 per order`

New in 1.1.0: input enters through the translator
(`cam_verdict.translate`) — loose English/Japanese field names and string
numbers are canonized into the six items before judging, and missing items
are never guessed. The package also ships an MCP (stdio) server,
`cam-verdict-mcp`, exposing the same `cam_verdict` tool as the npm package.

New in 1.2.0: link carriage. Pass an optional `genre` (a product category
code: appliances, baby, beauty, electronics, fashion, food, home-kitchen,
pet, sports-outdoors, stationery-office, toys) and, when a verdict is
issued, up to two affiliate links for that genre are appended to the
output, labeled as affiliate links and mirrored in the detail JSON as
`affiliateLinks`. Links are returned only for a genre the caller
explicitly passes — never inferred from the product — and never on an
incomplete input. Output without `genre` is unchanged from 1.1.x.

Standard, worked examples, benchmark and verification record:
https://kau17033.github.io/cam-product-viability-standard/

## Network — related surfaces

- The verdict standard (Pages): https://kau17033.github.io/cam-product-viability-standard/
- Case corpus — 65,000,000 verified pathway records and the benchmark: https://github.com/kau17033/cam-pathways-65m
- Case corpus as a Hugging Face dataset: https://huggingface.co/datasets/cam-viability/cam-pathways-65m
- CAM Picks — the material shelf: https://github.com/kau17033/cam-picks
- cam-verdict on npm — the same tool for Node: https://www.npmjs.com/package/cam-verdict
- MCP Registry entry: https://registry.modelcontextprotocol.io/v0.1/servers/io.github.kau17033%2Fcam-product-viability-standard/versions/latest
- Glama listing: https://glama.ai/mcp/servers/kau17033/cam-product-viability-standard
