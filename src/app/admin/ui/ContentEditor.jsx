import Link from 'next/link';
import { Heading, text } from './Collection';
import ContentForm from './ContentForm';
import { contentCheck } from '../lib/metrics';
const locales = ['en','it','fr','de','es','jp','kr','ae','cn','ru'];
export default function ContentEditor({ kind, record, locale }) {
  const names = kind==='places'?['name','title','region','keywords','description']:kind==='tours'?['title','keywords','description']:['title','subtitle','keywords'];
  const supported = names.some(name => record[name] && typeof record[name] === 'object') ? locales : ['en'];
  const language = supported.includes(locale) ? locale : 'en';
  const value = item => typeof item === 'string' ? item : item?.[language] || '';
  const fields = Object.fromEntries(names.filter(name => language==='en' || typeof record[name] !== 'string').map(name => [name,value(record[name])]));
  const paragraphs = kind === 'articles' ? (record.paragraphs || []).map(item => ({ title:value(item.title),text:value(item.text) })) : undefined;
  return <><Heading title={text(record.name || record.title)} description={'Edit '+kind.slice(0,-1)+' · '+record.url} action={<a className="button" href={'/'+language+'/'+kind+'/'+record.url} target="_blank" rel="noreferrer">View saved page ↗</a>}/>
    <div className="editor-layout"><ContentForm key={`${kind}:${record.url}:${language}`} kind={kind} url={record.url} locale={language} fields={fields} paragraphs={paragraphs}/>
      <aside className="editor-sidebar"><section className="panel"><p className="eyebrow">Across borders</p><h2>Content language</h2><nav aria-label="Content language" className="translation-links">{supported.map(code=><Link key={code} prefetch={false} aria-current={code===language?'page':undefined} href={'/admin/'+kind+'/'+record.url+'?lang='+code} aria-label={code.toUpperCase()+(contentCheck(record,kind,code).text?' text complete':' text missing')}><span>{code.toUpperCase()}</span><i aria-hidden="true" className={'translation-state'+(contentCheck(record,kind,code).text?' complete':'')}/></Link>)}</nav><div className="translation-help"><span><i className="translation-state complete"/>Complete</span><span><i className="translation-state"/>Missing text</span></div><p className="muted small" style={{marginTop:16}}>Languages are saved independently. Plain-text fields are edited in English.</p></section>
      <section className="panel"><p className="eyebrow">English field checklist</p><h2>A useful starting point</h2><div className="status-row"><span>Editorial text</span><span className={'badge'+(contentCheck(record,kind).text?'':' amber')}>{contentCheck(record,kind).text?'Complete':'Missing text'}</span></div><div className="status-row"><span>Image path</span><span className={'badge'+(contentCheck(record,kind).image?'':' amber')}>{contentCheck(record,kind).image?'Present':'Missing'}</span></div><p className="muted small" style={{marginTop:16}}>Saved fields only. Check facts, links, and imagery before considering a guide ready.</p></section></aside>
    </div></>;
}
