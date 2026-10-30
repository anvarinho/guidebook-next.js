import Link from 'next/link';
import { readUsers } from '../lib/data';
import { Collection } from '../ui/Collection';
export default async function Users({ searchParams }) {
 const params = await searchParams; const query = params.q || ''; const page = params.page || '1';
 const { count, places } = await readUsers(query,page);
 return <Collection title="Users" description="Manage your team and their access to GuideBook." path="/admin/users" query={query} page={page} count={count} action={<Link className="button primary" href="/admin/users/add">Create user</Link>} columns={['Name','Email','Role','Status','Action']} rows={places.map(user => ({ id:user._id, cells:[user.username,user.email,<span key="role" className="badge neutral">{user.isAdmin?'Administrator':'Member'}</span>,<span key="status" className={'badge'+(user.isActive?'':' neutral')}>{user.isActive?'Active':'Inactive'}</span>,<Link key="edit" prefetch={false} href={'/admin/users/'+user._id}>Edit <span className="sr-only">{user.username}</span>→</Link>] }))}/>;
}
