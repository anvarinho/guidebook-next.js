import 'server-only';
import type { Db, Document } from 'mongodb';
import { CONTENT_KINDS, LOCALES, localizedExpr, nonnegativeInteger, readyExpr, textCompleteExpr } from './metrics';

const MAX_CONTENT = 10000;
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
function count(value: unknown) { return nonnegativeInteger(value); }
export async function queryOverview(db: Db, now=new Date()) {
  const [collections,users] = await Promise.all([
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
  ]);
  const total=collections.reduce((n,row)=>n+row.total,0);
  const qualityAvailable=collections.every(row=>row.ready!==null);
  const ready=collections.reduce((n,row)=>n+(row.ready || 0),0);
  const popular=collections.flatMap(row=>row.popular).sort((a,b)=>b.views-a.views||a.url.localeCompare(b.url)).slice(0,5);
  const updated=collections.flatMap(row=>row.updated).sort((a,b)=>b.at.localeCompare(a.at)||a.url.localeCompare(b.url)).slice(0,6);
  return {collections,total,qualityAvailable,ready,popular,updated,
    users:{total:count(users?.total),active:count(users?.active),admins:count(users?.admins)},asOf:now.toISOString()};
}
