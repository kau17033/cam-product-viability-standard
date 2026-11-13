import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const require=createRequire(import.meta.url);
const fixtures=JSON.parse(readFileSync(new URL('./contract-cases.json',import.meta.url),'utf8'));
for(const path of ['../tools/mcp/logic.cjs','../tools/npm-package/logic.cjs']){
  const engine=require(path);
  for(const f of fixtures){
    const r=engine.evaluate(f.product,f.criteria,{today:new Date(f.today+'T00:00:00Z')});
    assert.equal(r.status,f.expected.status,f.case+' '+path+' status');
    assert.equal(r.verdict,f.expected.verdict,f.case+' '+path+' verdict');
    assert.equal(r.margin,f.expected.profit,f.case+' '+path+' profit');
    assert.equal(r.incomplete,r.status==='INCOMPLETE',f.case+' '+path+' incomplete');
  }
  const mixed=engine.evaluateAll([fixtures[0].product,fixtures[2].product],fixtures[0].criteria,{today:new Date('2026-11-13T00:00:00Z')});
  assert.equal(mixed.counts.INCOMPLETE,1);
  assert.equal(mixed.counts.TEST_CANDIDATE,1);
}
for(const server of ['../tools/mcp/server.mjs','../tools/npm-package/mcp-server.mjs']){
  const input=JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'cam_verdict',arguments:fixtures[2].product}})+'\n';
  const out=spawnSync(process.execPath,[new URL(server,import.meta.url).pathname],{input,encoding:'utf8'});
  assert.equal(out.status,0,server+' exit');
  const response=JSON.parse(out.stdout.trim());
  assert.equal(response.result.isError,false);
  assert.match(response.result.content[0].text,/^CAM status: INCOMPLETE — missing: returnReserve/);
  assert.equal(JSON.parse(response.result.content[0].text.split('\n').slice(1).join('\n')).verdict,null);
}
console.log('PASS: JS contract fixtures, batch counts, both MCP endpoints');
