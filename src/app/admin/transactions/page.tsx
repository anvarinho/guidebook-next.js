import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
export default async function Transactions() { await requireAdmin(); redirect('/admin/reports'); }
