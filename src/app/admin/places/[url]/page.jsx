import { readPlace } from '../../lib/data';
import ContentEditor from '../../ui/ContentEditor';
export default async function Page({ params, searchParams }) {
 const { url } = await params; const query = await searchParams;
 const record = await readPlace(url);
 return <ContentEditor kind="places" record={record} locale={query.lang || 'en'}/>;
}
