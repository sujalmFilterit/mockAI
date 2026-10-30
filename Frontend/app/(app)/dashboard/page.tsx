'use client';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Plus,
  Briefcase,
  Target,
  TrendingUp,
  Clock3,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import {
  Heading,
  useBootstrap,
  Skeleton,
  ErrorState,
  InterviewTable,
  average,
} from '@/components/common';
import { TrendChart, SkillsChart } from '@/components/charts/charts';
import { Card } from '@/components/ui/card';
import { makeReport } from '@/lib/db/report';
export default function Dashboard() {
  const { data, error, reload } = useBootstrap();
  if (error) return <ErrorState message={error} retry={reload} />;
  if (!data) return <Skeleton />;
  const completed = data.interviews
    .filter((i) => i.status !== 'active')
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  const scores = completed.map(average);
  const overall = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;
  const last = completed.at(-1);
  const skills = last
    ? makeReport(last).skill_scores
    : Object.fromEntries(
        (
          data.profile?.skills ?? [
            'React',
            'Node.js',
            'SQL',
            'Python',
            'System Design',
          ]
        ).map((s) => [s, 0]),
      );
  const improvement = scores.length > 1 ? scores.at(-1)! - scores[0] : 0;
  const stats = [
    {
      label: 'Interviews completed',
      value: String(completed.length).padStart(2, '0'),
      note: 'Every conversation is a step forward',
      icon: Briefcase,
      color: '#2563eb',
    },
    {
      label: 'Average score',
      value: `${overall}`,
      suffix: '/100',
      note: 'Across all completed sessions',
      icon: Target,
      color: '#7c3aed',
    },
    {
      label: 'Score improvement',
      value: `${improvement >= 0 ? '+' : ''}${improvement}`,
      suffix: 'pts',
      note: 'From your first to latest interview',
      icon: TrendingUp,
      color: '#16a34a',
    },
    {
      label: 'Questions practiced',
      value: String(
        completed.reduce((a, i) => a + i.evaluations.length, 0),
      ).padStart(2, '0'),
      note: 'Building confidence, one answer at a time',
      icon: Clock3,
      color: '#d97706',
    },
  ];
  return (
    <div className="stack">
      <Heading
        eyebrow="YOUR GROWTH, AT A GLANCE"
        title={`Welcome back, ${data.user.name.split(' ')[0]} 👋`}
        description="A little more prepared. A little more confident. Let’s keep your momentum going."
        action={
          <Link href="/interview/setup" className="btn btn-primary">
            <Plus size={15} /> New interview
          </Link>
        }
      />
      <section className="welcome">
        <div>
          <span className="eyebrow">PREPARE WITH PURPOSE</span>
          <h2>
            Your next big opportunity.
            <br />
            Your best-prepared self.
          </h2>
          <p>
            Practice interviews that adapt to your skills, understand your
            resume, and help you improve with every answer.
          </p>
          <Link href="/interview/setup" className="btn btn-primary">
            Start a practice interview <ArrowRight size={14} />
          </Link>
          <span
            className="small muted"
            style={{ marginLeft: 12, fontSize: 10 }}
          >
            Tailored to you. Powered by AI.
          </span>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <div className="orb">
            <Sparkles size={34} />
          </div>
          <div className="float-label" style={{ top: 9, right: -6 }}>
            <span style={{ color: '#16a34a' }}>✦</span> Resume-aware
          </div>
          <div className="float-label" style={{ bottom: 3, left: -7 }}>
            <CheckCircle2
              size={11}
              style={{ display: 'inline', color: '#2563eb', marginRight: 4 }}
            />{' '}
            Adaptive by design
          </div>
        </div>
      </section>
      <div className="stats">
        {stats.map(({ label, value, suffix, note, icon: Icon, color }) => (
          <Card key={label} className="stat">
            <div className="flex-row spread">
              <span className="stat-label">{label}</span>
              <div
                className="stat-icon"
                style={{ color, background: color + '10' }}
              >
                <Icon size={16} />
              </div>
            </div>
            <div className="value">
              {value}
              <span
                style={{
                  fontSize: 13,
                  color: '#94a3b8',
                  marginLeft: 4,
                  fontWeight: 400,
                }}
              >
                {suffix}
              </span>
            </div>
            <div className="stat-bottom">{note}</div>
          </Card>
        ))}
      </div>
      <div className="charts-row">
        <Card className="chart-card">
          <div className="section-head">
            <div>
              <h3>Your progress over time</h3>
              <p className="muted small" style={{ fontSize: 10, marginTop: 5 }}>
                Small improvements. Meaningful progress.
              </p>
            </div>
            <span className="badge gray">All sessions</span>
          </div>
          <TrendChart
            data={completed.map((i) => ({
              name: new Date(i.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
              }),
              score: average(i),
            }))}
          />
          <div
            className="small muted"
            style={{ fontSize: 9, textAlign: 'center', marginTop: 8 }}
          >
            <span className="legend-dot" /> Overall interview score
          </div>
        </Card>
        <Card className="chart-card">
          <div className="section-head">
            <div>
              <h3>Your skill landscape</h3>
              <p className="muted small" style={{ fontSize: 10, marginTop: 5 }}>
                Know your strengths. Find your next focus.
              </p>
            </div>
            <span className="badge">Latest session</span>
          </div>
          <SkillsChart scores={skills} />
          <div
            className="small muted"
            style={{ fontSize: 9, textAlign: 'center', marginTop: 8 }}
          >
            <span className="legend-dot" /> Skill proficiency
          </div>
        </Card>
      </div>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div className="section-head" style={{ padding: '22px 24px 0' }}>
          <div>
            <h3>Recent interviews</h3>
            <p className="small muted" style={{ fontSize: 10, marginTop: 5 }}>
              Every session tells a story of progress.
            </p>
          </div>
          <Link
            href="/history"
            className="flex-row"
            style={{ fontSize: 11, color: '#2563eb' }}
          >
            View all history <ArrowUpRight size={13} />
          </Link>
        </div>
        <InterviewTable
          interviews={[...data.interviews].reverse().slice(0, 4)}
        />
      </Card>
      <div className="notice flex-row">
        <Sparkles size={17} />
        <span>
          <strong>Make your practice personal.</strong>{' '}
          {data.profile
            ? 'Your resume profile is ready. Questions will adapt to your skills and projects.'
            : 'Upload your resume to get questions that reflect your experience.'}
        </span>
        <Link
          href="/resume"
          style={{ marginLeft: 'auto', whiteSpace: 'nowrap', fontWeight: 600 }}
        >
          View resume <ArrowRight size={12} style={{ display: 'inline' }} />
        </Link>
      </div>
    </div>
  );
}
