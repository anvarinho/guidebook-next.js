import type { Document } from 'mongodb';

export const LOCALES = ['en','it','fr','de','es','jp','kr','ae','cn','ru'] as const;
export const CONTENT_KINDS = ['places','tours','articles'] as const;
export type ContentKind = typeof CONTENT_KINDS[number];
// Raw search params, or the already-parsed filters from collectionQuery (numeric page).
export type Query = Record<string, string | number | string[] | undefined>;
const scalar = (value: unknown) => typeof value === 'string' ? value : '';
export function collectionQuery(query: Query = {}, kind: string) {
  const page = /^[1-9]\d{0,5}$/.test(scalar(query.page)) ? Number(query.page) : 1;
  const sortChoices = kind==='users' ? ['newest','oldest','name'] : ['newest','oldest','name','views','updated'];
  const states = kind==='users' ? ['all','active','inactive','admin','member','active-admin'] : ['all','ready','attention','missing'];
  return {
    q:scalar(query.q).slice(0,200), page,
    sort:sortChoices.includes(scalar(query.sort)) ? scalar(query.sort) : 'newest',
    state:states.includes(scalar(query.state)) ? scalar(query.state) : 'all',
    lang:LOCALES.includes(scalar(query.lang) as typeof LOCALES[number]) ? scalar(query.lang) : 'en',
  };
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
