import './globals.css';
import { redirect } from 'next/navigation';
import { requireAdmin, signOut } from '@/lib/auth';
import AdminShell from './ui/AdminShell';
export const metadata = { robots: { index:false, follow:false }, title:'Administration | GuideBook' };
export const dynamic = 'force-dynamic';
export default async function AdminLayout({ children }: { children:React.ReactNode }) {
  let user;
  try { user = await requireAdmin(); } catch { redirect('/login'); }
  return <html lang="en"><body className="admin-body"><AdminShell user={user} logoutAction={signOut}>{children}</AdminShell></body></html>;
}
