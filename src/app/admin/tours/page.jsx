import Link from 'next/link';
import { readTours } from '../lib/data';
import { Collection, text } from '../ui/Collection';
export default async function Page({ searchParams }) {
 const params = await searchParams; const query = params.q || ''; const page = params.page || '1';
 const { count, places } = await readTours(query,page);
 return <Collection title="Tours" description="Review and maintain your published travel content." path="/admin/tours" query={query} page={page} count={count} columns={['Name','URL','Views','Action']} rows={places.map(record => ({ id:String(record._id), cells:[text(record.title),record.url,Number(record.viewCount || 0).toLocaleString('en'),<Link key="edit" prefetch={false} href={'/admin/tours/'+record.url}>Edit <span className="sr-only">{text(record.title)}</span>→</Link>] }))}/>;
}
