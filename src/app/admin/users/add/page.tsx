import { requireAdmin } from '@/lib/auth';
import { Heading } from '../../ui/Collection';
import UserForm from '../../ui/UserForm';
export default async function AddUser() { await requireAdmin(); return <><Heading title="Create user" description="Give a team member the access they need."/><UserForm/></>; }
