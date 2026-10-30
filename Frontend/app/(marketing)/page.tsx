import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  FileText,
  ScanLine,
  Workflow,
  Layers,
  ChartNoAxesCombined,
  Check,
  Target,
} from 'lucide-react';
import { Brand } from '@/components/shell';
import { DemoButton } from '@/components/auth-form';
export default function Landing() {
  return (
    <>
      <nav className="marketing-nav" aria-label="Main">
        <Brand />
        <div
          className="flex-row nav-links"
          style={{ gap: 30, color: '#64748b', fontSize: 12 }}
        >
          <a href="#how-it-works">How it works</a>
          <a href="#signals">The Nova approach</a>
        </div>
        <div className="flex-row">
          <Link href="/login" className="btn btn-ghost">
            Sign in
          </Link>
          <Link href="/register" className="btn btn-primary">
            Get started <ArrowRight size={14} />
          </Link>
        </div>
      </nav>
      <main id="main">
        <section className="hero">
          <div>
            <span className="badge" style={{ marginBottom: 23 }}>
              <Sparkles size={12} /> YOUR POTENTIAL, BETTER PREPARED
            </span>
            <h1>
              Adaptive AI-Based
              <br />
              <span style={{ color: '#2563eb' }}>Mock Interview</span>
              <br />
              Platform
            </h1>
            <p>
              Questions that understand your experience. Feedback that moves you
              forward. Meet a smarter way to prepare for what’s next.
            </p>
            <div className="flex-row" style={{ flexWrap: 'wrap' }}>
              <Link href="/register" className="btn btn-primary">
                Start your journey <ArrowRight size={15} />
              </Link>
              <DemoButton />
            </div>
            <div
              className="flex-row small muted"
              style={{ marginTop: 24, fontSize: 11 }}
            >
              <Check size={14} color="#16a34a" /> Resume-aware <span>·</span>{' '}
              Adaptive by design <span>·</span> Built around you
            </div>
          </div>
          <div className="hero-preview">
            <div className="flex-row spread">
              <span className="badge">
                <span
                  style={{
                    width: 5,
                    height: 5,
                    background: '#2563eb',
                    borderRadius: '50%',
                  }}
                />{' '}
                PRACTICE IN PROGRESS
              </span>
              <span className="small muted">Question 02 / 05</span>
            </div>
            <div style={{ padding: '35px 15px', textAlign: 'center' }}>
              <div className="orb live" style={{ margin: '0 auto 25px' }}>
                <Sparkles size={35} />
              </div>
              <span className="small muted">YOUR AI INTERVIEWER</span>
              <h2 style={{ marginTop: 15, lineHeight: 1.5 }}>
                “In Commerce Cloud, how did you improve your database query
                performance?”
              </h2>
              <div
                className="flex-row"
                style={{ justifyContent: 'center', marginTop: 18 }}
              >
                <span className="badge purple">Medium</span>
                <span className="badge">SQL · Your project</span>
              </div>
            </div>
            <div className="notice flex-row">
              <Target size={20} />
              <div>
                <strong>Practice that evolves with you</strong>
                <p style={{ fontSize: 11, marginTop: 3 }}>
                  Your next question adapts to your last answer.
                </p>
              </div>
            </div>
            <div className="grid-3" style={{ gap: 9, marginTop: 18 }}>
              {['Semantic match', 'ML assessment', 'Rubric analysis'].map(
                (s, i) => (
                  <div
                    key={s}
                    style={{
                      background: '#f8fafc',
                      borderRadius: 9,
                      padding: 12,
                    }}
                  >
                    <span className="eyebrow" style={{ fontSize: 8 }}>
                      SIGNAL 0{i + 1}
                    </span>
                    <span style={{ fontSize: 10 }}>{s}</span>
                  </div>
                ),
              )}
            </div>
          </div>
        </section>
        <section className="marketing-section">
          <span className="eyebrow">THE PROBLEM WE’RE SOLVING</span>
          <h2 style={{ fontSize: 32, marginBottom: 25 }}>
            Preparation should feel personal.
          </h2>
          <div className="grid-3">
            {[
              {
                title: 'Static Question Lists',
                text: 'Generic lists don’t understand your projects, your strengths, or the areas you’re still developing.',
                icon: FileText,
                color: '#d97706',
              },
              {
                title: 'Scalability & Consistency Bottlenecks',
                text: 'Quality interview practice shouldn’t depend on finding the right mentor at the right time.',
                icon: Layers,
                color: '#7c3aed',
              },
              {
                title: 'Resume-Aware AI Solution',
                text: 'Turn your real experience into focused conversations, consistent feedback, and a practical growth plan.',
                icon: Sparkles,
                color: '#2563eb',
              },
            ].map(({ title, text, icon: Icon, color }) => (
              <div
                className="card"
                key={title}
                style={{ borderTop: `3px solid ${color}` }}
              >
                <Icon color={color} size={25} />
                <h3 style={{ margin: '18px 0 10px' }}>{title}</h3>
                <p className="muted small">{text}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="marketing-section" id="how-it-works">
          <span className="eyebrow">EXECUTION LIFECYCLE</span>
          <h2 style={{ fontSize: 32 }}>
            From your experience to your next breakthrough.
          </h2>
          <div className="pipeline">
            {[
              {
                title: 'Resume Ingestion',
                text: 'Upload your experience.',
                icon: FileText,
              },
              {
                title: 'Candidate Profile',
                text: 'Review skills and projects.',
                icon: ScanLine,
              },
              {
                title: 'Question Planner',
                text: 'Get relevant questions.',
                icon: Workflow,
              },
              {
                title: 'Tri-Evaluation',
                text: 'See three perspectives.',
                icon: Layers,
              },
              {
                title: 'Adaptive Report',
                text: 'Find your path forward.',
                icon: ChartNoAxesCombined,
              },
            ].map(({ title, text, icon: Icon }, i) => (
              <div className="card" key={title}>
                <div className="flex-row spread">
                  <div className="step-number">0{i + 1}</div>
                  <Icon size={20} color="#94a3b8" />
                </div>
                <h3 style={{ fontSize: 15 }}>{title}</h3>
                <p
                  className="muted small"
                  style={{ fontSize: 11, marginTop: 8 }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>
        <section id="signals" className="marketing-section">
          <span className="eyebrow">THREE SIGNALS. ONE CLEARER PICTURE.</span>
          <h2 style={{ fontSize: 32, marginBottom: 25 }}>
            Feedback with more perspective.
          </h2>
          <div className="grid-3">
            {[
              {
                title: 'Semantic understanding',
                text: 'Sentence Transformer-style similarity measures how closely your answer matches the reference concepts.',
                output: 'Cosine similarity · 0–1',
              },
              {
                title: 'Technical correctness',
                text: 'A classifier-style assessment identifies correct, partially correct, and incorrect explanations.',
                output: 'Correctness label + confidence',
              },
              {
                title: 'Depth & clarity',
                text: 'A structured rubric examines depth, completeness, accuracy, and clarity while identifying missing concepts.',
                output: 'Rubric scores + actionable feedback',
              },
            ].map((s, i) => (
              <div className="card signal" key={s.title}>
                <span className="eyebrow">SIGNAL 0{i + 1}</span>
                <h3>{s.title}</h3>
                <p className="muted small">{s.text}</p>
                <div className="output">
                  <strong>Output:</strong> {s.output}
                </div>
              </div>
            ))}
          </div>
          <p className="small muted" style={{ marginTop: 16 }}>
            This prototype uses deterministic mock evaluations. Real AI services
            can be connected through the service layer.
          </p>
        </section>
        <section
          className="marketing-section"
          style={{ textAlign: 'center', paddingBottom: 70 }}
        >
          <div className="welcome" style={{ display: 'block', padding: 45 }}>
            <span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
            <h2 style={{ fontSize: 34, maxWidth: 'none' }}>
              Walk into your next interview with confidence.
            </h2>
            <p style={{ margin: '15px auto 25px' }}>
              One conversation at a time. One step closer.
            </p>
            <Link href="/register" className="btn btn-primary">
              Let’s get you ready <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      </main>
      <footer
        className="marketing-nav small muted"
        style={{ borderTop: '1px solid #e2e8f0' }}
      >
        <Brand />
        <span>By Team Nova Coders · {new Date().getFullYear()}</span>
      </footer>
    </>
  );
}
