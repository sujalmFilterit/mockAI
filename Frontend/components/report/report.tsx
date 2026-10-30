'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Download,
  RotateCcw,
  CheckCircle2,
  Target,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { api, type InterviewDetail } from '@/lib/services/api';
import { Heading, Skeleton, ErrorState } from '@/components/common';
import { SkillsChart } from '@/components/charts/charts';
import { EvaluationCards } from '@/components/interview/evaluation';
export function ReportView({ id }: { id: string }) {
  const [data, setData] = useState<InterviewDetail | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(() => {
    setError('');
    api
      .get(id)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [id]);
  useEffect(load, [load]);
  if (error) return <ErrorState message={error} retry={load} />;
  if (!data) return <Skeleton />;
  const report = data.report;
  return (
    <div className="stack">
      <Heading
        eyebrow="YOUR ADAPTIVE REPORT"
        title="A clearer path to what’s next."
        description={`${data.role} · ${new Date(data.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · ${data.evaluations.length} of ${data.total} questions answered`}
        action={
          <div className="flex-row no-print">
            <button
              className="btn btn-outline"
              onClick={() => {
                document
                  .querySelectorAll('details')
                  .forEach((d) => (d.open = true));
                window.print();
              }}
            >
              <Download size={15} /> Download PDF
            </button>
            <Link className="btn btn-primary" href="/interview/setup">
              <RotateCcw size={14} /> Retake
            </Link>
          </div>
        }
      />
      {data.status === 'active' && (
        <div className="notice">
          This session is still in progress.{' '}
          <Link href={`/interview/${id}`} style={{ fontWeight: 600 }}>
            Continue your interview →
          </Link>
        </div>
      )}
      {!data.evaluations.length && (
        <div className="notice">
          No answers were submitted. Complete a practice session to receive
          feedback and skill insights.
        </div>
      )}
      <div className="grid-3">
        <div className="card" style={{ textAlign: 'center' }}>
          <span className="eyebrow">OVERALL PERFORMANCE</span>
          <div
            className="gauge"
            style={{
              background: `conic-gradient(#2563eb ${report.overall_score}%,#eaf0f9 0)`,
            }}
          >
            <div className="gauge-inner">
              <strong>{report.overall_score}</strong>
              <div className="small muted">out of 100</div>
            </div>
          </div>
          <span
            className={`badge ${report.overall_score >= 75 ? 'green' : 'amber'}`}
          >
            {report.overall_score >= 75
              ? 'Strong foundation'
              : report.overall_score >= 40
                ? 'Building momentum'
                : 'Room to grow'}
          </span>
          <p className="small muted" style={{ marginTop: 12 }}>
            Based on {data.evaluations.length} submitted answers
          </p>
        </div>
        <div className="card chart-card report-skill-card">
          <div className="section-head">
            <h3>Your skill performance</h3>
            <span className="badge">Score / 100</span>
          </div>
          <SkillsChart scores={report.skill_scores} bar />
        </div>
      </div>
      <div className="grid-3">
        {[
          {
            title: 'Your strengths',
            icon: CheckCircle2,
            items: report.strengths,
            empty: 'Keep practicing to reveal your strongest skills.',
            color: '#16a34a',
          },
          {
            title: 'Your next focus',
            icon: Target,
            items: report.skill_gaps,
            empty: 'No skill gaps identified in this session.',
            color: '#d97706',
          },
          {
            title: 'Concepts to revisit',
            icon: Lightbulb,
            items: report.missing_concepts,
            empty: 'No missing concepts identified.',
            color: '#7c3aed',
          },
        ].map(({ title, icon: Icon, items, empty, color }) => (
          <div
            className="card"
            style={{ borderTop: `3px solid ${color}` }}
            key={title}
          >
            <div className="flex-row">
              <Icon size={19} color={color} />
              <h3>{title}</h3>
            </div>
            {items.length ? (
              <ul
                style={{
                  listStyle: 'none',
                  marginTop: 20,
                  display: 'grid',
                  gap: 12,
                }}
              >
                {items.map((s) => (
                  <li className="flex-row small" key={s}>
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        background: color,
                        borderRadius: '50%',
                      }}
                    />
                    {s}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="small muted" style={{ marginTop: 20 }}>
                {empty}
              </p>
            )}
          </div>
        ))}
      </div>
      <section className="card">
        <span className="eyebrow">HOW THE CONVERSATION EVOLVED</span>
        <h3>Your difficulty progression</h3>
        <div className="timeline" style={{ marginTop: 22 }}>
          {data.questions.map((q) => (
            <div className="timeline-item" key={q.question_id}>
              <span className="small muted">Question {q.order}</span>
              <div style={{ margin: '9px 0' }}>
                <span
                  className={`badge ${q.difficulty === 'Hard' ? 'purple' : q.difficulty === 'Medium' ? 'amber' : 'green'}`}
                >
                  {q.difficulty}
                </span>
              </div>
              <span className="small">{q.skill}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="card">
        <span className="eyebrow">EVERY ANSWER IS AN OPPORTUNITY</span>
        <h2>Question-by-question breakdown</h2>
        {data.questions.map((q) => {
          const e = data.evaluations.find(
            (e) => e.question_id === q.question_id,
          );
          return (
            <details key={q.question_id}>
              <summary>
                Q{q.order} · {q.skill}{' '}
                <span className="muted" style={{ float: 'right' }}>
                  {e ? `${e.finalScore}/100` : 'Not answered'}
                </span>
                <p
                  className="muted small"
                  style={{ marginTop: 8, paddingRight: 20 }}
                >
                  {q.text}
                </p>
              </summary>
              <div>
                {e ? (
                  <>
                    <label>Your answer</label>
                    <p
                      style={{ whiteSpace: 'pre-wrap', marginBottom: 20 }}
                      className="small muted"
                    >
                      {e.text}
                    </p>
                    <EvaluationCards evaluation={e} />
                  </>
                ) : (
                  <p className="muted">
                    No answer was submitted for this question.
                  </p>
                )}
              </div>
            </details>
          );
        })}
      </section>
      <div className="notice flex-row no-print">
        <Lightbulb size={20} />
        <p>
          <strong>Make your next session count.</strong> Review one missing
          concept, explain it in your own words, then try again.
        </p>
        <Link
          href="/interview/setup"
          style={{ marginLeft: 'auto', whiteSpace: 'nowrap', fontWeight: 600 }}
        >
          Keep growing <ArrowRight size={13} style={{ display: 'inline' }} />
        </Link>
      </div>
      <p className="small muted">
        Prototype evaluation: semantic, classifier, and rubric signals are
        simulated using answer length and concept overlap. Scores are practice
        indicators.
      </p>
    </div>
  );
}
