import Link from 'next/link';
export function Heading({ title, description, action }) {
  return <div className="page-heading"><div><p className="eyebrow">GuideBook workspace</p><h1>{title}</h1><p className="muted">{description}</p></div>{action}</div>;
}
export function Collection({ title, description, path, query, page, count, columns, rows, action }) {
  const current = Number(page);
  const pages = Math.max(1,Math.ceil(count/20));
  const url = value => `${path}?${new URLSearchParams({ q:query, page:String(value) })}`;
  return <><Heading title={title} description={description} action={action}/><form className="toolbar search-form" method="get" action={path}><label htmlFor="collection-search">Search {title.toLowerCase()}<input id="collection-search" type="search" name="q" defaultValue={query} maxLength={200}/></label><button type="submit">Search</button>{query && <Link className="button" href={path}>Clear</Link>}</form><p className="muted small">{count.toLocaleString('en')} records · Page {current} of {pages}</p>{rows.length ? <div className="table-scroll" role="region" aria-label={title+' results'} tabIndex={0}><table><caption className="sr-only">{title}</caption><thead><tr>{columns.map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id}>{row.cells.map((cell,index) => <td key={index}>{cell ?? '—'}</td>)}</tr>)}</tbody></table></div> : <section className="panel empty"><h2>No records found</h2><p className="muted">{query?'Try a different search.':'Records will appear here when they are available.'}</p></section>}<nav className="pagination" aria-label="Pagination"><span className="muted small">20 records per page</span><div>{current>1 && <Link className="button" prefetch={false} href={url(current-1)}>Previous</Link>}{current<pages && <Link className="button" prefetch={false} href={url(current+1)}>Next</Link>}</div></nav></>;
}
export const text = value => typeof value === 'string' ? value : value?.en || 'Untitled';
