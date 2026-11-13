import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const full=read('../llms-full.txt');
const section=(name,next)=>{
  const marker='==== '+name+' ====\n\n';
  const from=full.indexOf(marker);
  const to=full.indexOf('==== '+next+' ====\n\n',from+marker.length);
  assert.ok(from>=0&&to>=0,name+' boundaries');
  return full.slice(from+marker.length,to).trim();
};
for(const [name,next] of [['README.md','verification.md'],['verification.md','faq.md']]){
  assert.equal(section(name,next),read('../'+name).trim(),'full-text mirror: '+name);
}
const copies=['../tools/mcp/logic.cjs','../tools/npm-package/logic.cjs','../tools/translator/logic.cjs'].map(read);
assert.ok(copies.every(x=>x===copies[0]),'all 3 JS engines must be byte-identical');
assert.equal(read('../tools/mcp/server.mjs'),read('../tools/npm-package/mcp-server.mjs'),'two Node MCP copies must match');
assert.ok(!full.includes('Profit > 0 with no failed checks → TEST_CANDIDATE'),'stale gate phrase in full text');
assert.ok(read('../llms.txt').includes('remains unconfirmed'));
console.log('PASS: full-text mirror, three engine copies, MCP copies, llms summary');
