'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  Mic,
  CheckCircle2,
  Loader2,
  Clock3,
  Layers,
} from 'lucide-react';
import {
  Heading,
  useBootstrap,
  Skeleton,
  ErrorState,
} from '@/components/common';
import { api } from '@/lib/services/api';
import type { Difficulty } from '@/types';
export default function Setup() {
  const router = useRouter();
  const { data, error: loadError, reload } = useBootstrap();
  const [role, setRole] = useState('Full Stack Developer');
  const [total, setTotal] = useState<5 | 8 | 10>(5);
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [voice, setVoice] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (loadError) return <ErrorState message={loadError} retry={reload} />;
  if (!data) return <Skeleton />;
  return (
    <>
      <Heading
        eyebrow="MAKE IT YOURS"
        title="Set the stage for your next step."
        description="Choose your focus. We’ll build a conversation around your experience."
      />
      <div className="question-layout">
        <div className="card stack">
          <div>
            <h2>Your practice preferences</h2>
            <p className="small muted" style={{ marginTop: 8 }}>
              A focused session, designed around you.
            </p>
          </div>
          <div>
            <label htmlFor="role">Target role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {[
                'Full Stack Developer',
                'Frontend Developer',
                'Backend Developer',
                'Python Developer',
                'Machine Learning Engineer',
                'Software Engineer',
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <fieldset>
            <legend
              className="small"
              style={{ fontWeight: 600, marginBottom: 10 }}
            >
              Number of questions
            </legend>
            <div className="grid-3">
              {([5, 8, 10] as const).map((n) => (
                <button
                  key={n}
                  className={`setup-choice ${total === n ? 'selected' : ''}`}
                  aria-pressed={total === n}
                  onClick={() => setTotal(n)}
                >
                  <strong style={{ fontSize: 22 }}>{n}</strong>
                  <div className="small muted" style={{ marginTop: 6 }}>
                    ~{n * 3} min
                  </div>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend
              className="small"
              style={{ fontWeight: 600, marginBottom: 10 }}
            >
              Starting difficulty
            </legend>
            <div className="grid-3">
              {(['Easy', 'Medium', 'Hard'] as const).map((s) => (
                <button
                  key={s}
                  className={`setup-choice ${difficulty === s ? 'selected' : ''}`}
                  aria-pressed={difficulty === s}
                  onClick={() => setDifficulty(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="small muted" style={{ marginTop: 10 }}>
              Your difficulty adapts as the conversation unfolds.
            </p>
          </fieldset>
          <label
            className="check-row"
            htmlFor="voice"
            style={{ padding: 18, background: '#f8fafc', borderRadius: 10 }}
          >
            <input
              id="voice"
              type="checkbox"
              checked={voice}
              onChange={(e) => setVoice(e.target.checked)}
            />
            <Mic size={19} color="#2563eb" />
            <span>
              Enable voice answers
              <span
                className="muted"
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 400,
                  marginTop: 5,
                }}
              >
                Use speech-to-text where your browser supports it.
              </span>
            </span>
          </label>
          {!data.profile && (
            <div className="notice">
              Upload and confirm your resume profile before starting.{' '}
              <Link href="/resume" style={{ fontWeight: 700 }}>
                Add your resume →
              </Link>
            </div>
          )}
          {error && <ErrorState message={error} />}
          <button
            className="btn btn-primary"
            disabled={busy || !data.profile}
            onClick={async () => {
              setBusy(true);
              try {
                const interview = await api.start({
                  role,
                  total,
                  difficulty,
                  voice,
                });
                router.push(`/interview/${interview.interview_id}`);
              } catch (e) {
                setError((e as Error).message);
                setBusy(false);
              }
            }}
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : null}Start
            my interview <ArrowRight size={15} />
          </button>
        </div>
        <div className="stack" style={{ alignSelf: 'start' }}>
          <div className="card">
            <span className="eyebrow">YOUR SESSION AT A GLANCE</span>
            <h2>{role}</h2>
            <div className="stack" style={{ gap: 16, marginTop: 25 }}>
              <div className="flex-row">
                <Layers size={17} color="#2563eb" />
                {total} resume-aware questions
              </div>
              <div className="flex-row">
                <Clock3 size={17} color="#2563eb" />3 minutes per question
              </div>
              <div className="flex-row">
                <CheckCircle2 size={17} color="#16a34a" />
                Three signals of feedback
              </div>
            </div>
          </div>
          <div className="notice">
            <strong>A space to learn, not a test to pass.</strong>
            <p style={{ marginTop: 7 }}>
              Think out loud, explain your tradeoffs, and use examples from your
              projects. Every answer helps shape what comes next.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
