import Link from 'next/link';
import { readPlaces,readTours,readArticles } from '../lib/data';
import { collectionQuery,nonnegativeInteger } from '../lib/metrics';
import { Collection,text } from './Collection';
const readers={places:readPlaces,tours:readTours,articles:readArticles};
export default async function ContentCollection({kind,searchParams}) {
  const params=await searchParams;
  const filters=collectionQuery(params,kind);
  const {count,places}=await readers[kind](filters.q,filters.page,filters);
  const title=kind[0].toUpperCase()+kind.slice(1);
  return <Collection title={title} description="Thoughtful travel content, ready for its next chapter." path={'/admin/'+kind} kind={kind} query={filters.q} page={filters.page} filters={filters} count={count}
    columns={['Guide','Stored views','English checklist',filters.lang.toUpperCase()+' text','Action']}
    rows={places.map(record=>({id:String(record._id),cells:[<div key="title" className="record-title"><strong>{text(record.name || record.title)}</strong><span className="muted small">/{record.url}</span></div>,nonnegativeInteger(record.viewCount).toLocaleString('en'),<span key="ready" className={'badge'+(record.ready?'':' amber')}>{record.ready?'Complete':'Needs review'}</span>,<span key="translated" className={'badge'+(record.translated?'':' neutral')}>{record.translated?'Complete':'Missing text'}</span>,<Link key="edit" className="edit-link" prefetch={false} href={'/admin/'+kind+'/'+record.url}>Edit <span className="sr-only">{text(record.name || record.title)}</span>→</Link>]}))}/>;
}
