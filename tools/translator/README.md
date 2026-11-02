# CAM Translator

The translation machine between the world's information and the AI's
canonical verdict language.

**World side** — product data as it actually exists: JSON with loosely named
fields in English or Japanese (`fee`, `手数料`, `返品備え`, `returnReserve`…),
a CSV row, or `key: value` lines in either language, with or without `¥` and
thousands separators.

**Quantization** — the continuous mess is discretized into the standard's
fixed units: six money items, five checks, three verdict states.

**AI side** — one canonical output, every time: the line
`CAM verdict: TEST_CANDIDATE — profit ¥5,920 per order`, plus the structured
JSON of [verdict-schema.json](../../verdict-schema.json), plus a Japanese
gloss. Deterministic, zero dependencies, runs in milliseconds.

```bash
node cam-translate.mjs '{"price":3980,"cost":1450,"shipping":520,"fee":318,"returnReserve":160,"otherVariable":370,"deliveryDays":5,"stock":20,"estimateDate":"2026-08-20"}'
# -> "line": "CAM verdict: HOLD — profit ¥1,162 per order"

node cam-translate.mjs --csv 'price,cost,shipping,fee,returnReserve,otherVariable
2980,1900,680,298,0,170'
# -> "line": "CAM verdict: REJECT — profit ¥-68 per order"

printf '価格: 1980\n原価: 900\n送料: 750\n手数料: 198\n返品備え: 200\nその他変動費: 0\n' | node cam-translate.mjs --kv
# -> "line": "CAM verdict: REJECT — profit ¥-68 per order"
```

Missing money items are never guessed. The result is `INCOMPLETE` and names
exactly which items are missing, in English and Japanese — because a
translator that invents the missing words is not a translator.

`logic.cjs` is the same reference engine as the MCP tool in this repository
(byte-identical). Run `node test.mjs` for the format/equivalence tests.
