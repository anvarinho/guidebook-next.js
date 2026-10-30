import { readUser } from '../../lib/data';
import { Heading } from '../../ui/Collection';
import UserForm from '../../ui/UserForm';
export default async function EditUser({ params }) { const { id } = await params; const user = await readUser(id); return <><Heading title="Edit user" description={'Manage access for '+user.username}/><UserForm key={user._id} user={user}/></>; }
