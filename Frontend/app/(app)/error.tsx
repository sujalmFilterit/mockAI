'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="card">
      <h1>We couldn’t load this page</h1>
      <p className="muted">Please try again to continue your practice.</p>
      <button className="btn btn-primary" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
