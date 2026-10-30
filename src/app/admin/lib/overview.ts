import 'server-only';
import type { Db, Document } from 'mongodb';
import { API_ROUTES, CONTENT_KINDS, LOCALES, RESPONSE_CLASSES, type Period, changePercent, localizedExpr, nonnegativeInteger, paddedDays, readyExpr, safeArray, textCompleteExpr } from './metrics';

const MAX_CONTENT = 10000;
const MAX_WINDOWS = 100000;
const OPTIONS = { maxTimeMS:5000, allowDiskUse:false };
const sum = (value: unknown) => ({$sum:{$cond:[value,1,0]}});
const safeTitle = (field: string) => ({$substrCP:[localizedExpr(field),0,140]});
export function contentPipeline(kind: typeof CONTENT_KINDS[number], now: Date): Document[] {
  return [
    {$limit:MAX_CONTENT+1},
    {$project:{_id:1,url:1,title:safeTitle(kind==='places'?'$name':'$title'),updatedAt:1,
      viewCount:{$cond:[validCount('$viewCount'),'$viewCount',0]},
      ready:readyExpr(kind),...Object.fromEntries(LOCALES.map(code=>['translated_'+code,textCompleteExpr(kind,code)]))}},
    {$facet:{
      summary:[{$group:{_id:null,total:{$sum:1},ready:sum('$ready'),...Object.fromEntries(LOCALES.map(code=>[code,sum('$translated_'+code)]))}}],
      popular:[{$match:{viewCount:{$gt:0},url:{$type:'string'}}},{$sort:{viewCount:-1,_id:-1}},{$limit:5},{$project:{_id:0,title:1,url:1,viewCount:1}}],
      updated:[{$match:{updatedAt:{$type:'date',$lte:now},url:{$type:'string'}}},{$sort:{updatedAt:-1,_id:-1}},{$limit:4},{$project:{_id:0,title:1,url:1,updatedAt:1}}],
    }},
  ];
}
const validCount = (value: unknown) => ({$cond:[{$isNumber:value},{$and:[{$gte:[value,0]},{$lte:[value,Number.MAX_SAFE_INTEGER]},{$eq:[value,{$trunc:value}]}]},false]});
const safeRoute = (value: unknown) => ({$cond:[{$in:[value,API_ROUTES]},value,'Other API routes']});
export function responseExpressions() {
  const rows = safeArray('$routes');
  const values = safeArray('$$row.responses');
  const validRow = {$and:[{$eq:[{$size:values},8]},{$allElementsTrue:[{$map:{input:values,as:'count',in:validCount('$$count')}}]}]};
  const v2 = {$and:[{$eq:['$schemaVersion',2]},{$eq:['$responseClasses',RESPONSE_CLASSES]},{$isArray:'$routes'},{$lte:[{$size:rows},19]},{$allElementsTrue:[{$map:{input:rows,as:'row',in:validRow}}]}]};
  const legacy = {$and:[{$in:[{$ifNull:['$schemaVersion',1]},[1]]},validCount('$statusCode'),{$gte:['$statusCode',100]},{$lte:['$statusCode',599]}]};
  return {recognized:{$or:[v2,legacy]},entries:{$cond:[v2,{$map:{input:rows,as:'row',in:{route:safeRoute('$$row.route'),responses:{$sum:values},errors:{$sum:{$slice:[values,3,5]}}}}},{$cond:[legacy,[{route:safeRoute('$route'),responses:1,errors:{$cond:[{$gte:['$statusCode',400]},1,0]}}],[]]}]}};
}
export function trafficPipeline(period: Period): Document[] {
  const expressions=responseExpressions();
  return [
    {$match:{timestamp:{$gte:period.previousStart,$lt:period.end}}},{$sort:{timestamp:-1}},{$limit:MAX_WINDOWS+1},
    {$project:{timestamp:1,recognized:expressions.recognized,entries:expressions.entries}},
    {$facet:{
      metadata:[{$group:{_id:null,windows:{$sum:1},unsupported:sum({$not:['$recognized']})}}],
      days:[{$unwind:'$entries'},{$group:{_id:{period:{$cond:[{$gte:['$timestamp',period.from]},'current','previous']},day:{$dateToString:{date:'$timestamp',format:'%Y-%m-%d',timezone:'UTC'}}},responses:{$sum:'$entries.responses'},errors:{$sum:'$entries.errors'}}}],
      routes:[{$match:{timestamp:{$gte:period.from}}},{$unwind:'$entries'},{$group:{_id:'$entries.route',responses:{$sum:'$entries.responses'},errors:{$sum:'$entries.errors'}}},{$sort:{responses:-1,_id:1}},{$limit:6}],
    }},
  ];
}
function count(value: unknown) { return nonnegativeInteger(value); }
async function traffic(db: Db, period: Period) {
  try {
    const [result, earliest] = await Promise.all([
      db.collection('statistics').aggregate(trafficPipeline(period),OPTIONS).next(),
      db.collection('statistics').find({timestamp:{$type:'date'}},{projection:{timestamp:1},maxTimeMS:5000}).sort({timestamp:1}).limit(1).next(),
    ]);
    if(count(result?.metadata?.[0]?.windows)>MAX_WINDOWS) throw new Error('Range exceeds scan budget');
    const rows: Document[] = result?.days || [];
    const current=rows.filter(row=>row._id.period==='current');
    const previous=rows.filter(row=>row._id.period==='previous');
    const total=current.reduce((n,row)=>n+count(row.responses),0);
    const errors=current.reduce((n,row)=>n+count(row.errors),0);
    const previousTotal=previous.reduce((n,row)=>n+count(row.responses),0);
    const unsupported=count(result?.metadata?.[0]?.unsupported);
    const comparable=period.complete && earliest?.timestamp instanceof Date && earliest.timestamp<=period.previousStart && unsupported===0;
    return {
      available:true,total,errors,previousTotal,comparable,change:comparable?changePercent(total,previousTotal):null,
      errorRate:total?Math.round(errors/total*10000)/100:null,unsupported,
      days:paddedDays(period,current.map(row=>({day:row._id.day,responses:count(row.responses),errors:count(row.errors)}))),
      previousDays:previous.map(row=>({day:row._id.day,responses:count(row.responses),errors:count(row.errors)})),
      routes:(result?.routes || []).map((row: Document)=>({route:String(row._id),responses:count(row.responses),errors:count(row.errors)})),
    };
  } catch {
    return {available:false,total:0,errors:0,previousTotal:0,comparable:false,change:null,errorRate:null,unsupported:0,days:paddedDays(period,[]),previousDays:[],routes:[]};
  }
}
export async function queryOverview(db: Db, period: Period, now=new Date()) {
  const [collections,users,requests] = await Promise.all([
    Promise.all(CONTENT_KINDS.map(async kind=>{
      const result=await db.collection(kind).aggregate(contentPipeline(kind,now),OPTIONS).next();
      const summary=result?.summary?.[0] || {};
      const checked=count(summary.total);
      const overflow=checked>MAX_CONTENT;
      const total=overflow?await db.collection(kind).countDocuments({},{hint:'_id_',maxTimeMS:5000}):checked;
      return {kind,total,ready:overflow?null:count(summary.ready),translations:overflow?null:Object.fromEntries(LOCALES.map(code=>[code,count(summary[code])])),
        popular:overflow?[]:(result?.popular || []).map((row: Document)=>({kind,title:String(row.title || 'Untitled'),url:String(row.url),views:count(row.viewCount)})),
        updated:overflow?[]:(result?.updated || []).map((row: Document)=>({kind,title:String(row.title || 'Untitled'),url:String(row.url),at:(row.updatedAt as Date).toISOString()})),
      };
    })),
    db.collection('users').aggregate([{$group:{_id:null,total:{$sum:1},active:sum({$eq:['$isActive',true]}),admins:sum({$and:[{$eq:['$isAdmin',true]},{$eq:['$isActive',true]}]})}}],OPTIONS).next(),
    traffic(db,period),
  ]);
  const total=collections.reduce((n,row)=>n+row.total,0);
  const qualityAvailable=collections.every(row=>row.ready!==null);
  const ready=collections.reduce((n,row)=>n+(row.ready || 0),0);
  const popular=collections.flatMap(row=>row.popular).sort((a,b)=>b.views-a.views||a.url.localeCompare(b.url)).slice(0,5);
  const updated=collections.flatMap(row=>row.updated).sort((a,b)=>b.at.localeCompare(a.at)||a.url.localeCompare(b.url)).slice(0,6);
  return {collections,total,qualityAvailable,ready,popular,updated,traffic:requests,
    users:{total:count(users?.total),active:count(users?.active),admins:count(users?.admins)},asOf:now.toISOString()};
}
