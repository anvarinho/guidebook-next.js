import Link from 'next/link';
export default function NotFound() { return <section className="panel"><h1>Record not found</h1><p className="muted">This record is no longer available.</p><Link href="/admin">Return to overview</Link></section>; }
