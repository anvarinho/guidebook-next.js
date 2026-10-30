import { readOverview } from './lib/data';
import OverviewDashboard from './ui/OverviewDashboard';
export default async function Overview({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const data=await readOverview(await searchParams);
  return <OverviewDashboard data={data}/>;
}
