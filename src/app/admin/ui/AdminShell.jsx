'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';
const links = [['/admin','Overview','◈'],['/admin/places','Places','◎'],['/admin/tours','Tours','↗'],['/admin/articles','Articles','▤'],['/admin/users','Team & users','♙'],['/admin/reports','Reports','▥']];
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
  const navigation = <nav aria-label="Administration" className="nav-list">{links.map(([href,label,icon]) => <Link prefetch={false} key={href} href={href} aria-current={(href === '/admin' ? pathname === href : pathname.startsWith(href)) ? 'page' : undefined} onClick={() => drawer.current?.close()}><span className="nav-icon" aria-hidden="true">{icon}</span>{label}</Link>)}</nav>;
  const logout = <form action={logoutAction}><button type="submit">Sign out</button></form>;
  return <div className="admin-shell">
    <a className="skip-link" href="#admin-main">Skip to content</a>
    <aside className="admin-sidebar"><Link className="brand" href="/admin">GuideBook<span> / admin</span></Link>{navigation}<div className="sidebar-bottom"><div><p>{user.username}</p><p className="muted small">Administrator</p></div>{logout}</div></aside>
    <dialog ref={drawer} className="drawer" aria-label="Administration menu" onKeyDown={keepFocus} onClose={() => trigger.current?.focus()}>
      <button autoFocus className="drawer-close" onClick={() => drawer.current.close()}>Close menu</button>{navigation}<div className="sidebar-bottom">{logout}</div>
    </dialog>
    <div className="admin-content"><header className="admin-header"><div><button className="mobile-menu" ref={trigger} onClick={() => drawer.current.showModal()} aria-haspopup="dialog">Open menu</button><span className="desktop-label muted">Your workspace, thoughtfully organized.</span></div><a href="/en" target="_blank" rel="noreferrer">View website ↗</a></header><main id="admin-main" tabIndex={-1} className="admin-main">{children}</main><footer className="admin-footer">GuideBook administration · Central Asia</footer></div>
  </div>;
}
