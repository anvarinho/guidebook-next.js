import Link from 'next/link';
import { readPlaces } from '../lib/data';
import { Collection, text } from '../ui/Collection';
export default async function Page({ searchParams }) {
 const params = await searchParams; const query = params.q || ''; const page = params.page || '1';
 const { count, places } = await readPlaces(query,page);
 return <Collection title="Places" description="Review and maintain your published travel content." path="/admin/places" query={query} page={page} count={count} columns={['Name','URL','Views','Action']} rows={places.map(record => ({ id:String(record._id), cells:[text(record.name),record.url,Number(record.viewCount || 0).toLocaleString('en'),<Link key="edit" prefetch={false} href={'/admin/places/'+record.url}>Edit <span className="sr-only">{text(record.name)}</span>→</Link>] }))}/>;
}
