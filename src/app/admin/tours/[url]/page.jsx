import { readTour } from '../../lib/data';
import ContentEditor from '../../ui/ContentEditor';
export default async function Page({ params, searchParams }) {
 const { url } = await params; const query = await searchParams;
 const record = await readTour(url);
 return <ContentEditor kind="tours" record={record} locale={query.lang || 'en'}/>;
}
