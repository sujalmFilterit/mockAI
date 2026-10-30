import Link from 'next/link';
export default function NotFound() {
  return (
    <main
      id="main"
      className="card"
      style={{ maxWidth: 600, margin: '15vh auto' }}
    >
      <span className="eyebrow">PAGE NOT FOUND</span>
      <h1>Let’s get you back on track.</h1>
      <p className="muted" style={{ margin: '15px 0' }}>
        This page isn’t available.
      </p>
      <Link className="btn btn-primary" href="/dashboard">
        Go to your workspace
      </Link>
    </main>
  );
}
