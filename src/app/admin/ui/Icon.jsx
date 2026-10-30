const shapes = {
  overview:<><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
  places:<><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  tours:<><circle cx="5" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 5h8a4 4 0 0 1 0 8H9a4 4 0 0 0 0 8h3"/></>,
  articles:<><path d="M5 3h14v18H5zM9 7h6M9 11h6M9 15h4"/></>,
  users:<><circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 5"/></>,
  reports:<><path d="M4 3v18h17M8 16v-4M13 16V7M18 16v-7"/></>,
  arrow:<path d="M5 12h14m-5-5 5 5-5 5"/>,
  filter:<><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2" fill="currentColor"/><circle cx="15" cy="17" r="2" fill="currentColor"/></>,
  external:<><path d="M14 3h7v7M21 3 10 14M10 5H4v16h16v-6"/></>,
};
export default function Icon({name}) {return <svg className="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name] || shapes.overview}</svg>;}
