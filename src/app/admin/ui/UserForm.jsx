'use client';
import Link from 'next/link';
import { useActionState,useRef,useState,useEffect } from 'react';
import useUnsavedChanges from './useUnsavedChanges';
import { saveUser } from '../lib/actions';
export default function UserForm({ user }) {
  const [state, action, pending] = useActionState(saveUser, { message:'', ok:false });
  const [values,setValues]=useState({username:user?.username || '',email:user?.email || '',password:'',isAdmin:String(user?.isAdmin ?? false),isActive:String(user?.isActive ?? true),phone:user?.phone || '',address:user?.address || ''});
  useEffect(()=>{if(state.ok)setValues(current=>({...current,password:'',username:current.username.trim(),email:current.email.toLowerCase()}));},[state]);
  const update=event=>{const {name,value}=event.target;setValues(current=>({...current,[name]:value}));};
  const form=useRef(null);
  const {dirty,markDirty}=useUnsavedChanges(form,state);
  return <form ref={form} onChange={markDirty} action={action} aria-busy={pending} className="panel editor-panel">
    <div className="form-section"><p className="eyebrow">Account details</p><h2>A person behind every story</h2><p className="muted">Keep account details current and choose access carefully.</p></div>
    {user && <input type="hidden" name="id" value={user._id}/>}
    <div className="form-grid">
      <label>Username<input name="username" required minLength={3} maxLength={20} value={values.username} onChange={update} autoComplete="off"/></label>
      <label>Email address<input name="email" type="email" required maxLength={254} value={values.email} onChange={update} autoComplete="off"/></label>
      {!user && <label className="full">Initial password<input name="password" type="password" value={values.password} onChange={update} required minLength={12} autoComplete="new-password"/><span className="field-help">At least 12 characters, at most 72 UTF-8 bytes.</span></label>}
      <label>Role<select name="isAdmin" value={values.isAdmin} onChange={update}><option value="false">Member</option><option value="true">Administrator</option></select></label>
      <label>Account status<select name="isActive" value={values.isActive} onChange={update}><option value="true">Active</option><option value="false">Inactive</option></select></label>
      <label>Phone<input name="phone" type="tel" maxLength={40} value={values.phone} onChange={update}/></label>
      <label>Address / notes<textarea name="address" rows={3} maxLength={1000} value={values.address} onChange={update}/></label>
    </div>
    <p className="field-help">Administrators can manage all content and users. You cannot deactivate or demote your own account here. Password resets are performed by a server operator.</p>
    {state.message && <div role={state.ok?'status':'alert'} className={'notice'+(state.ok?'':' error')}>{state.message}</div>}
    <div className="editor-action-bar"><button className="primary" disabled={pending}>{pending?'Saving…':user?'Save user':'Create user'}</button><Link href="/admin/users">Back to users</Link><span className="save-state" aria-live="polite">{dirty?'Unsaved changes':'No unsaved changes'}</span></div>
  </form>;
}
