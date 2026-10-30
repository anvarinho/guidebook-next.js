import type { Document } from 'mongodb';

export const LOCALES = ['en','it','fr','de','es','jp','kr','ae','cn','ru'] as const;
export const CONTENT_KINDS = ['places','tours','articles'] as const;
export type ContentKind = typeof CONTENT_KINDS[number];
export type Query = Record<string, string | string[] | undefined>;
export const DAY = 86400000;
export const RESPONSE_CLASSES = ['1xx','2xx','3xx','4xx_other','5xx_other','429','503','504'];
export const API_ROUTES = ['/api/user/login','/api/user/signup','/api/user/:id','/api/admin','/api/places','/api/places/home','/api/places/region','/api/places/ios','/api/places/more','/api/places/:id','/api/orders','/api/orders/:id','/api/tours','/api/tours/:slug','/api/articles','/api/articles/:slug','/api/reviews','invalid','unmatched'];
const scalar = (value: unknown) => typeof value === 'string' ? value : '';
export const dayKey = (date: Date) => date.toISOString().slice(0,10);
function parseDay(value: unknown): Date | null {
  if (typeof value !== 'string' || !/^20\d\d-\d\d-\d\d$/.test(value)) return null;
  const date = new Date(value + 'T00:00:00.000Z');
  return Number.isFinite(date.getTime()) && dayKey(date) === value ? date : null;
}
export function periodRange(query: Query = {}, now = new Date()) {
  const today = new Date(Math.floor(now.getTime()/DAY)*DAY);
  let from = new Date(today.getTime()-7*DAY);
  let to = new Date(today.getTime()-DAY);
  let invalid = false;
  if (query.from !== undefined || query.to !== undefined) {
    const first = parseDay(query.from), last = parseDay(query.to);
    if (first && last && first<=last && last<=today && (last.getTime()-first.getTime())/DAY<31) { from=first; to=last; }
    else invalid=true;
  }
  const end = new Date(to.getTime()+DAY);
  const days = (end.getTime()-from.getTime())/DAY;
  return { from, end, previousStart:new Date(from.getTime()-days*DAY), days, fromKey:dayKey(from), toKey:dayKey(to), invalid, complete:end<=today };
}
export type Period = ReturnType<typeof periodRange>;
export function collectionQuery(query: Query = {}, kind: string) {
  const page = /^[1-9]\d{0,5}$/.test(scalar(query.page)) ? Number(query.page) : 1;
  const sortChoices = kind==='reports' ? ['newest','oldest'] : kind==='users' ? ['newest','oldest','name'] : ['newest','oldest','name','views','updated'];
  const states = kind==='users' ? ['all','active','inactive','admin','member','active-admin'] : kind==='reports' ? ['all','errors','success'] : ['all','ready','attention','missing'];
  return {
    q:scalar(query.q).slice(0,200), page,
    sort:sortChoices.includes(scalar(query.sort)) ? scalar(query.sort) : 'newest',
    state:states.includes(scalar(query.state)) ? scalar(query.state) : 'all',
    lang:LOCALES.includes(scalar(query.lang) as typeof LOCALES[number]) ? scalar(query.lang) : 'en',
  };
}
export function changePercent(current: number, previous: number): number | null {
  return previous>0 && Number.isFinite(current) && Number.isFinite(previous) ? Math.round((current-previous)/previous*1000)/10 : null;
}
export function localizedText(value: unknown, locale: string): string {
  const text = typeof value==='string' ? (locale==='en'?value:'') : value && typeof value==='object' ? (value as Record<string,unknown>)[locale] : '';
  return typeof text==='string' ? text.trim() : '';
}
export function contentCheck(record: Document, kind: ContentKind, locale='en') {
  const fields = kind==='places' ? ['name','title','description'] : kind==='tours' ? ['title','description'] : ['title'];
  const paragraphs = Array.isArray(record.paragraphs) ? record.paragraphs : [];
  const text = fields.every(field=>!!localizedText(record[field],locale)) && (kind!=='articles' || (paragraphs.length>0 && paragraphs.every(p=>!!localizedText(p?.text,locale))));
  const images = [...(Array.isArray(record.images)?record.images:[]),record.image,...paragraphs.map(p=>p?.image)];
  const image = images.some(value=>typeof value==='string' && value.trim().length>0);
  return { text, image, ready:text && image };
}
export const safeArray = (field: unknown) => ({ $cond:[{$isArray:field},field,[]] });
const stringExpr = (field: unknown) => ({$cond:[{$eq:[{$type:field},'string']},field,'']});
export const nonblank = (field: unknown) => ({$gt:[{$strLenCP:{$trim:{input:stringExpr(field)}}},0]});
export function localizedExpr(field: string, locale='en'): Document {
  return {$cond:[{$eq:[{$type:field},'string']},locale==='en'?field:'',stringExpr(field+'.'+locale)]};
}
export function textCompleteExpr(kind: ContentKind, locale='en'): Document {
  const fields = kind==='places' ? ['name','title','description'] : kind==='tours' ? ['title','description'] : ['title'];
  const checks: Document[] = fields.map(field=>nonblank(localizedExpr('$'+field,locale)));
  if(kind==='articles') checks.push({$gt:[{$size:safeArray('$paragraphs')},0]},{$allElementsTrue:[{$map:{input:safeArray('$paragraphs'),as:'paragraph',in:nonblank(localizedExpr('$$paragraph.text',locale))}}]});
  return {$and:checks};
}
export function readyExpr(kind: ContentKind): Document {
  return {$and:[textCompleteExpr(kind),{$anyElementTrue:[{$map:{input:{$concatArrays:[safeArray('$images'),['$image'],safeArray('$paragraphs.image')]},as:'image',in:nonblank('$$image')}}]}]};
}
export function nonnegativeInteger(value: unknown): number {
  return typeof value==='number' && Number.isSafeInteger(value) && value>=0 ? value : 0;
}
export function knownRoute(value: unknown): string {
  return typeof value==='string' && API_ROUTES.includes(value) ? value : 'Other API routes';
}
export function supportedResponseRecord(record: Document): boolean {
  if(record.schemaVersion===2) return JSON.stringify(record.responseClasses)===JSON.stringify(RESPONSE_CLASSES) && Array.isArray(record.routes) && record.routes.length<=19 && record.routes.every(row=>row && Array.isArray(row.responses) && row.responses.length===8 && row.responses.every((n: unknown)=>typeof n==='number' && Number.isSafeInteger(n) && n>=0));
  return (record.schemaVersion===undefined || record.schemaVersion===null || record.schemaVersion===1) && typeof record.statusCode==='number' && Number.isInteger(record.statusCode) && record.statusCode>=100 && record.statusCode<=599;
}
export function responseRows(record: Document): {route:string;responses:number;errors:number}[] {
  if(!supportedResponseRecord(record)) return [];
  if(record.schemaVersion===2) return record.routes.map((row: Document)=>({route:knownRoute(row.route),responses:row.responses.reduce((a: number,b: number)=>a+b,0),errors:row.responses.slice(3).reduce((a: number,b: number)=>a+b,0)}));
  return [{route:knownRoute(record.route),responses:1,errors:record.statusCode>=400?1:0}];
}
export function paddedDays(period: Period, values: {day:string; responses:number; errors:number}[]) {
  const map=new Map(values.map(value=>[value.day,value]));
  return Array.from({length:period.days},(_,index)=>{
    const day=dayKey(new Date(period.from.getTime()+index*DAY));
    return map.get(day) || {day,responses:0,errors:0};
  });
}
