import { readStats } from '../lib/data';
import { Collection } from '../ui/Collection';
export default async function Reports({ searchParams }) {
 const params = await searchParams; const query = params.q || ''; const page = params.page || '1';
 const { count, places } = await readStats(query,page);
 return <Collection title="Reports" description="Recorded backend requests. Search by route." path="/admin/reports" query={query} page={page} count={count} columns={['Time (UTC)','Route','Status','Language']} rows={places.map(record => ({ id:String(record._id), cells:[record.timestamp ? new Date(record.timestamp).toISOString().replace('T',' ').slice(0,19) : '—',record.route,record.statusCode,record.query?.lang] }))}/>;
}
