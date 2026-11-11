import ContentCollection from '../ui/ContentCollection';
import type { Query } from '../lib/metrics';
export default function Page({searchParams}: { searchParams: Promise<Query> }) { return <ContentCollection kind="articles" searchParams={searchParams}/>; }
