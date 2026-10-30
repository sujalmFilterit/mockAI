'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Code2 } from 'lucide-react';
import { api } from '@/lib/services/api';
import type { Interview } from '@/types';
export function useBootstrap() {
  const [data, setData] = useState<Awaited<
    ReturnType<typeof api.bootstrap>
  > | null>(null);
  const [error, setError] = useState('');
  const reload = useCallback(() => {
    setError('');
    api
      .bootstrap()
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);
  useEffect(reload, [reload]);
  return { data, error, reload };
}
export function Heading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div className="section-head" style={{ marginBottom: 0 }}>
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p className="muted">{description}</p>
        </div>
        {action}
      </div>
    </div>
  );
}
export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div role="alert" className="error">
      {message}{' '}
      {retry && (
        <button className="btn btn-outline" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}
export function Skeleton() {
  return (
    <div className="stack" role="status" aria-label="Loading">
      <div className="skeleton" />
      <div className="grid-2">
        <div className="skeleton" style={{ height: 280 }} />
        <div className="skeleton" style={{ height: 280 }} />
      </div>
    </div>
  );
}
export function average(i: Interview) {
  return i.evaluations.length
    ? Math.round(
        i.evaluations.reduce((a, e) => a + e.finalScore, 0) /
          i.evaluations.length,
      )
    : 0;
}
export function InterviewTable({ interviews }: { interviews: Interview[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Interview / role</th>
            <th>Date</th>
            <th>Difficulty</th>
            <th>Score</th>
            <th>Status</th>
            <th>
              <span className="sr-only">Action</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {interviews.map((i) => (
            <tr key={i.interview_id}>
              <td>
                <div className="flex-row">
                  <div className="role-icon">
                    <Code2 size={16} />
                  </div>
                  <div>
                    <strong>{i.role}</strong>
                    <div
                      style={{ fontSize: 9, color: '#94a3b8', marginTop: 5 }}
                    >
                      {i.questions.length} questions · Resume-based
                    </div>
                  </div>
                </div>
              </td>
              <td className="muted">
                {new Date(i.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </td>
              <td>
                <span
                  className={`badge ${i.current_difficulty === 'Hard' ? 'purple' : i.current_difficulty === 'Medium' ? 'amber' : ''}`}
                >
                  {i.current_difficulty}
                </span>
              </td>
              <td>
                <span className="score">
                  {average(i)}
                  <span
                    className="muted"
                    style={{ fontWeight: 400, fontSize: 9 }}
                  >
                    {' '}
                    / 100
                  </span>
                </span>
                <div className="score-bar">
                  <i style={{ width: `${average(i)}%` }} />
                </div>
              </td>
              <td>
                <span
                  className={`badge ${i.status === 'completed' ? 'green' : 'gray'}`}
                >
                  {i.status === 'completed'
                    ? 'Completed'
                    : i.status === 'active'
                      ? 'In progress'
                      : 'Ended early'}
                </span>
              </td>
              <td>
                <Link
                  className="flex-row"
                  style={{ color: '#2563eb', fontWeight: 500, fontSize: 10 }}
                  href={`/interview/${i.interview_id}${i.status === 'active' ? '' : '/report'}`}
                >
                  {i.status === 'active' ? 'Continue' : 'View report'}
                  <ArrowUpRight size={12} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!interviews.length && (
        <p className="muted" style={{ padding: 25, textAlign: 'center' }}>
          No interviews yet. Your first practice session is a click away.
        </p>
      )}
    </div>
  );
}
