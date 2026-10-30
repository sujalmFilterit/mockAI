export default function Loading() {
  return (
    <div className="stack" role="status" aria-label="Loading workspace">
      <div className="skeleton" style={{ height: 60 }} />
      <div className="skeleton" />
      <div className="grid-2">
        <div className="skeleton" style={{ height: 260 }} />
        <div className="skeleton" style={{ height: 260 }} />
      </div>
    </div>
  );
}
