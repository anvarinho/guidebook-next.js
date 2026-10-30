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
  return module.exports.queryOverview(db,metrics.periodRange({},new Date('2026-10-30T12:00:00Z')),new Date('2026-10-30T12:00:00Z'));
}
function database({windows=0,fail=false,overflow=false}={}) {
  return {collection(name){return {
    aggregate(pipeline,options){
      assert.equal(options.maxTimeMS,5000);assert.equal(options.allowDiskUse,false);
      if(name==='statistics') {
        if(fail)throw Error('Test-only timeout');
        assert.ok(pipeline.some(stage=>stage.$limit===100001));
        return {next:async()=>({metadata:[{windows,unsupported:0}],days:[],routes:[]})};
      }
      if(name==='users')return {next:async()=>null};
      assert.ok(pipeline.some(stage=>stage.$limit===10001));
      return {next:async()=>overflow?{summary:[{total:10001,ready:10001}],popular:[{title:'Partial sample',url:'partial',viewCount:1}],updated:[]}:null};
    },
    countDocuments:async(_filter,options)=>{assert.equal(options.hint,'_id_');return 25000;},
    find:()=>({sort(){return this;},limit(){return this;},next:async()=>null}),
  };}};
}
test('empty overview has honest zero counts and no percentage baseline',async()=>{
  const result=await overview(database());
  assert.equal(result.total,0);assert.equal(result.ready,0);assert.equal(result.users.total,0);
  assert.equal(result.traffic.available,true);assert.equal(result.traffic.total,0);assert.equal(result.traffic.errorRate,null);assert.equal(result.traffic.change,null);
});
test('statistics failures and scan limits show unavailable instead of partial zero totals',async()=>{
  for(const options of [{fail:true},{windows:100001}]) {
    const result=await overview(database(options));assert.equal(result.traffic.available,false);assert.equal(result.traffic.change,null);
  }
});
test('content scan overflow retains exact counts while hiding partial coverage and rankings',async()=>{
  const result=await overview(database({overflow:true}));
  assert.equal(result.total,75000);assert.equal(result.qualityAvailable,false);
  assert.ok(result.collections.every(row=>row.ready===null && row.translations===null));assert.equal(result.popular.length,0);
});
