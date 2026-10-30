import { readArticle } from '../../lib/data';
import ContentEditor from '../../ui/ContentEditor';
export default async function Page({ params, searchParams }) {
 const { url } = await params; const query = await searchParams;
 const record = await readArticle(url);
 return <ContentEditor kind="articles" record={record} locale={query.lang || 'en'}/>;
}
