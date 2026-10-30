'use client';
export default function AdminError({ reset }: { reset:()=>void }) { return <section className="panel"><h1>We couldn’t load this page</h1><p className="muted">Try again in a moment. If the problem continues, contact your administrator.</p><button onClick={reset}>Try again</button></section>; }
