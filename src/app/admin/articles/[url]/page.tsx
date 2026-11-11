import { readArticle } from '../../lib/data';
import ContentEditor from '../../ui/ContentEditor';
import type { Query } from '../../lib/metrics';
export default async function Page({ params, searchParams }: { params: Promise<{ url: string }>; searchParams: Promise<Query> }) {
 const { url } = await params; const query = await searchParams;
 const record = await readArticle(url);
 return <ContentEditor kind="articles" record={record} locale={typeof query.lang === 'string' ? query.lang : 'en'}/>;
}
