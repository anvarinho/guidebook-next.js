const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const metrics=require('../src/app/admin/lib/metrics.ts');
function overview(db) {
  const module={exports:{}};
  const text=ts.transpileModule(fs.readFileSync('src/app/admin/lib/overview.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
  vm.runInNewContext(text,{module,exports:module.exports,require(name){if(name==='server-only')return {};if(name==='./metrics')return metrics;return require(name);},Date});
  return module.exports.queryOverview(db,new Date('2026-10-30T12:00:00Z'));
}
function database({overflow=false}={}) {
  return {collection(name){return {
    aggregate(pipeline,options){
      assert.equal(options.maxTimeMS,5000);assert.equal(options.allowDiskUse,false);
      if(name==='users')return {next:async()=>null};
      assert.ok(pipeline.some(stage=>stage.$limit===10001));
      return {next:async()=>overflow?{summary:[{total:10001,ready:10001}],popular:[{title:'Partial sample',url:'partial',viewCount:1}],updated:[]}:null};
    },
    countDocuments:async(_filter,options)=>{assert.equal(options.hint,'_id_');return 25000;},
  };}};
}
test('empty overview has honest zero counts',async()=>{
  const result=await overview(database());
  assert.equal(result.total,0);assert.equal(result.ready,0);assert.equal(result.users.total,0);
});
test('content scan overflow retains exact counts while hiding partial coverage and rankings',async()=>{
  const result=await overview(database({overflow:true}));
  assert.equal(result.total,75000);assert.equal(result.qualityAvailable,false);
  assert.ok(result.collections.every(row=>row.ready===null && row.translations===null));assert.equal(result.popular.length,0);
});
