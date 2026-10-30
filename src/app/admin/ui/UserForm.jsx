'use client';
import Link from 'next/link';
import { useActionState } from 'react';
import { saveUser } from '../lib/actions';
export default function UserForm({ user }) {
  const [state, action, pending] = useActionState(saveUser, { message:'', ok:false });
  return <form action={action} aria-busy={pending} className="panel">
    {user && <input type="hidden" name="id" value={user._id}/>}
    <div className="form-grid">
      <label>Username<input name="username" required minLength={3} maxLength={20} defaultValue={user?.username || ''} autoComplete="off"/></label>
      <label>Email address<input name="email" type="email" required maxLength={254} defaultValue={user?.email || ''} autoComplete="off"/></label>
      {!user && <label className="full">Initial password<input name="password" type="password" required minLength={12} autoComplete="new-password"/><span className="field-help">At least 12 characters, at most 72 UTF-8 bytes.</span></label>}
      <label>Role<select name="isAdmin" defaultValue={String(user?.isAdmin ?? false)}><option value="false">Member</option><option value="true">Administrator</option></select></label>
      <label>Account status<select name="isActive" defaultValue={String(user?.isActive ?? true)}><option value="true">Active</option><option value="false">Inactive</option></select></label>
      <label>Phone<input name="phone" type="tel" maxLength={40} defaultValue={user?.phone || ''}/></label>
      <label>Address / notes<textarea name="address" rows={3} maxLength={1000} defaultValue={user?.address || ''}/></label>
    </div>
    <p className="field-help">Administrators can manage all content and users. You cannot deactivate or demote your own account here. Password resets are performed by a server operator.</p>
    {state.message && <div role={state.ok?'status':'alert'} className={'notice'+(state.ok?'':' error')}>{state.message}</div>}
    <div className="form-actions"><button className="primary" disabled={pending}>{pending?'Saving…':user?'Save user':'Create user'}</button><Link href="/admin/users">Back to users</Link></div>
  </form>;
}
