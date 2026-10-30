'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import {
  Heading,
  useBootstrap,
  ErrorState,
  Skeleton,
  InterviewTable,
} from '@/components/common';
export default function History() {
  const { data, error, reload } = useBootstrap();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  if (error) return <ErrorState message={error} retry={reload} />;
  if (!data) return <Skeleton />;
  const interviews = [...data.interviews]
    .reverse()
    .filter(
      (i) =>
        i.role.toLowerCase().includes(search.toLowerCase()) &&
        (status === 'all' || i.status === status) &&
        (difficulty === 'all' || i.current_difficulty === difficulty),
    );
  return (
    <>
      <Heading
        eyebrow="YOUR PRACTICE JOURNEY"
        title="Interview history"
        description="Revisit your conversations, track your progress, and find your next breakthrough."
        action={
          <Link href="/interview/setup" className="btn btn-primary">
            <Plus size={15} /> New interview
          </Link>
        }
      />
      <div className="card stack">
        <div className="flex-row" style={{ flexWrap: 'wrap' }}>
          <div className="flex-row" style={{ flex: 1, minWidth: 180 }}>
            <Search size={17} />
            <input
              aria-label="Search interviews by role"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by role…"
            />
          </div>
          <select
            style={{ width: 170 }}
            aria-label="Filter by status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="completed">Completed</option>
            <option value="active">In progress</option>
            <option value="ended">Ended early</option>
          </select>
          <select
            style={{ width: 170 }}
            aria-label="Filter by difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="all">All difficulties</option>
            {['Easy', 'Medium', 'Hard'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <InterviewTable interviews={interviews} />
        <p className="muted small">
          Showing {interviews.length} of {data.interviews.length} interviews
        </p>
      </div>
    </>
  );
}
