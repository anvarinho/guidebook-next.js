import { readPlace } from '../../lib/data';
import ContentEditor from '../../ui/ContentEditor';
import type { Query } from '../../lib/metrics';
export default async function Page({ params, searchParams }: { params: Promise<{ url: string }>; searchParams: Promise<Query> }) {
 const { url } = await params; const query = await searchParams;
 const record = await readPlace(url);
 return <ContentEditor kind="places" record={record} locale={typeof query.lang === 'string' ? query.lang : 'en'}/>;
}
