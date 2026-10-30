'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';
import Icon from './Icon';
const links = [['/admin','Overview','overview'],['/admin/places','Places','places'],['/admin/tours','Tours','tours'],['/admin/articles','Articles','articles'],['/admin/users','Team & users','users'],['/admin/reports','Reports','reports']];
export default function AdminShell({ children, user, logoutAction }) {
  const pathname = usePathname();
  const drawer = useRef(null);
  const trigger = useRef(null);
  function keepFocus(event) {
    if (event.key !== 'Tab') return;
    const targets = [...event.currentTarget.querySelectorAll('button:not(:disabled), a[href]')];
    const first = targets[0], last = targets[targets.length-1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  const navigation = <nav aria-label="Administration" className="nav-list">{links.map(([href,label,icon]) => <Link prefetch={false} key={href} href={href} aria-current={(href === '/admin' ? pathname === href : pathname.startsWith(href)) ? 'page' : undefined} onClick={() => drawer.current?.close()}><Icon name={icon}/>{label}</Link>)}</nav>;
  const logout = <form action={logoutAction}><button type="submit">Sign out</button></form>;
  return <div className="admin-shell">
    <a className="skip-link" href="#admin-main">Skip to content</a>
    <aside className="admin-sidebar"><Link className="brand" href="/admin">GuideBook<small>The editorial workspace</small></Link><div><p className="nav-caption">Workspace</p>{navigation}</div><div className="sidebar-bottom"><div className="sidebar-profile"><span className="avatar" aria-hidden="true">{user.username?.slice(0,1).toUpperCase()}</span><div><p>{user.username}</p><p className="muted small">Administrator</p></div></div>{logout}</div></aside>
    <dialog ref={drawer} className="drawer" aria-label="Administration menu" onKeyDown={keepFocus} onClose={() => trigger.current?.focus()}>
      <button autoFocus className="drawer-close" onClick={() => drawer.current.close()}>Close menu</button>{navigation}<div className="sidebar-bottom">{logout}</div>
    </dialog>
    <div className="admin-content"><header className="admin-header"><div><button className="mobile-menu" ref={trigger} onClick={() => drawer.current.showModal()} aria-haspopup="dialog">Open menu</button><span className="desktop-label breadcrumb">Editorial workspace <span aria-hidden="true">/</span><strong>{links.find(([href])=>href!=='/admin' && pathname.startsWith(href))?.[1] || 'Overview'}</strong></span></div><a className="header-link" href="/en" target="_blank" rel="noreferrer">View website <Icon name="external"/></a></header><main id="admin-main" tabIndex={-1} className="admin-main">{children}</main><footer className="admin-footer">GuideBook administration · Central Asia</footer></div>
  </div>;
}
