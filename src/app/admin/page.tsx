import { readOverview } from './lib/data';
import OverviewDashboard from './ui/OverviewDashboard';
export default async function Overview() {
  const data=await readOverview();
  return <OverviewDashboard data={data}/>;
}
