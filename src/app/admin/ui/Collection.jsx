import Link from 'next/link';
import { LOCALES } from '../lib/metrics';
import Icon from './Icon';
export function Heading({title,description,action}) {
  return <div className="page-heading"><div><p className="eyebrow">GuideBook / editorial workspace</p><h1>{title}</h1><p className="muted">{description}</p></div>{action}</div>;
}
export function Collection({title,description,path,query,page,count,columns,rows,action,filters={},kind,period}) {
  const current=Number(page), pages=Math.max(1,Math.ceil(count/20));
  const parameters={q:query,sort:filters.sort || 'newest',state:filters.state || 'all'};
  if(kind!=='users' && kind!=='reports') parameters.lang=filters.lang || 'en';
  if(period){parameters.from=period.fromKey;parameters.to=period.toKey;}
  const url=value=>`${path}?${new URLSearchParams({...parameters,page:String(value)})}`;
  const states=kind==='users'?[['all','All accounts'],['active','Active'],['inactive','Inactive'],['admin','Administrators'],['active-admin','Active administrators'],['member','Members']]:kind==='reports'?[['all','All responses'],['errors','Contains errors (4xx–5xx)'],['success','Contains non-error responses']]:[['all','All content'],['ready','English checklist passed'],['attention','Needs English review'],['missing','Missing selected-language text']];
  return <>
    <Heading title={title} description={description} action={action}/>
    <form className="collection-filters panel" method="get" action={path}>
      <label className="filter-search" htmlFor="collection-search">Search {title.toLowerCase()}<input id="collection-search" type="search" name="q" placeholder={kind==='reports'?'Route template…':'Find a record…'} defaultValue={query} maxLength={200}/></label>
      <label>State<select name="state" defaultValue={filters.state || 'all'}>{states.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
      {kind!=='users' && kind!=='reports' && <label>Text language<select name="lang" defaultValue={filters.lang || 'en'}>{LOCALES.map(code=><option key={code} value={code}>{code.toUpperCase()}</option>)}</select></label>}
      <label>Sort by<select name="sort" defaultValue={filters.sort || 'newest'}><option value="newest">Newest first</option><option value="oldest">Oldest first</option>{kind!=='reports' && <option value="name">Name A–Z</option>}{kind!=='reports' && kind!=='users' && <><option value="views">Stored views</option><option value="updated">Recently updated</option></>}</select></label>
      {period && <><label>From (UTC)<input type="date" name="from" defaultValue={period.fromKey}/></label><label>Through (UTC)<input type="date" name="to" defaultValue={period.toKey}/></label></>}
      <button type="submit" className="primary"><Icon name="filter"/>Search</button><Link className="filter-reset" href={path}>Reset</Link>
    </form>
    {period?.invalid && <p className="notice error" role="alert">Invalid date range. Showing the last seven complete UTC days.</p>}
    <div className="collection-meta"><p><strong>{count.toLocaleString('en')}</strong> records found</p><span className="muted small">Page {current} of {pages} · 20 per page</span></div>
    {rows.length?<div className="table-scroll collection-table" role="region" aria-label={title+' results'} tabIndex={0}><table><caption className="sr-only">{title}</caption><thead><tr>{columns.map(label=><th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={row.id}>{row.cells.map((cell,index)=><td key={index}>{cell??'—'}</td>)}</tr>)}</tbody></table></div>:<section className="panel empty"><Icon name={kind}/><h2>No records found</h2><p className="muted">Try another search or adjust your filters.</p><Link href={path}>Reset filters →</Link></section>}
    <nav className="pagination" aria-label="Pagination"><span className="muted small">{count===0?'0':Math.min(count,(current-1)*20+1)}–{Math.min(current*20,count)} of {count.toLocaleString('en')}</span><div>{current>1 && <Link className="button" prefetch={false} href={url(current-1)}>Previous</Link>}{current<pages && <Link className="button" prefetch={false} href={url(current+1)}>Next</Link>}</div></nav>
  </>;
}
export const text=value=>typeof value==='string'?value:value?.en || 'Untitled';
