import { readStats } from '../lib/data';
import { collectionQuery } from '../lib/metrics';
import { Collection } from '../ui/Collection';
export default async function Reports({searchParams}) {
 const params=await searchParams; const filters=collectionQuery(params,'reports');
 const {count,places,period}=await readStats(filters.q,filters.page,{...params,...filters});
 return <><Collection title="Reports" description="Stored backend response windows and legacy requests. UTC completion timestamps; not visitor analytics." path="/admin/reports" kind="reports" query={filters.q} page={filters.page} count={count} filters={filters} period={period}
 columns={['Completed (UTC)','Record type','Route templates','Responses','Errors (4xx–5xx)']} rows={places.map(record=>({id:record._id,cells:[record.timestamp instanceof Date?record.timestamp.toISOString().replace('T',' ').slice(0,19):'Unknown',record.kind,record.routes || 'Unrecognized record',record.supported?record.responses.toLocaleString('en'):'—',record.supported?record.errors.toLocaleString('en'):'—']}))}/>
 <p className="metric-note">Each response window may contain multiple routes and responses. Counts reflect matching known route templates within each stored window. The state filter selects windows containing that response class; rows retain all matching-route counts. No IP addresses, session identifiers, or user agents are exposed.</p></>;
}
