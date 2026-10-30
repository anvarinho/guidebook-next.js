import Link from 'next/link';
import { Heading, text } from './Collection';
import ContentForm from './ContentForm';
const locales = ['en','it','fr','de','es','jp','kr','ae','cn','ru'];
export default function ContentEditor({ kind, record, locale }) {
  const names = kind==='places'?['name','title','region','keywords','description']:kind==='tours'?['title','keywords','description']:['title','subtitle','keywords'];
  const supported = names.some(name => record[name] && typeof record[name] === 'object') ? locales : ['en'];
  const language = supported.includes(locale) ? locale : 'en';
  const value = item => typeof item === 'string' ? item : item?.[language] || '';
  const fields = Object.fromEntries(names.filter(name => language==='en' || typeof record[name] !== 'string').map(name => [name,value(record[name])]));
  const paragraphs = kind === 'articles' ? (record.paragraphs || []).map(item => ({ title:value(item.title),text:value(item.text) })) : undefined;
  return <><Heading title={text(record.name || record.title)} description={'Edit '+kind.slice(0,-1)+' · '+record.url}/><section className="panel"><h2>Content language</h2><nav aria-label="Content language" className="toolbar">{supported.map(code => <Link key={code} prefetch={false} className={'button'+(code===language?' primary':'')} aria-current={code===language?'page':undefined} href={'/admin/'+kind+'/'+record.url+'?lang='+code}>{code.toUpperCase()}</Link>)}</nav><p className="muted small">Language fields update independently. Fields stored as plain text are edited in English.</p></section><ContentForm key={`${kind}:${record.url}:${language}`} kind={kind} url={record.url} locale={language} fields={fields} paragraphs={paragraphs}/></>;
}
