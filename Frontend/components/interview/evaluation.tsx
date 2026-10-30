import type { Evaluation } from '@/types';
import { ScanText, BrainCircuit, ListChecks } from 'lucide-react';
export function EvaluationCards({ evaluation: e }: { evaluation: Evaluation }) {
  const signals = [
    {
      title: 'Semantic similarity',
      subtitle: 'Sentence Transformers · mock',
      icon: ScanText,
      value: `${Math.round(e.signal1.cosineSimilarity * 100)}%`,
      output: 'Cosine similarity',
      detail: `${e.signal1.cosineSimilarity.toFixed(2)} / 1.00`,
    },
    {
      title: 'Technical correctness',
      subtitle: 'ML classifier · mock',
      icon: BrainCircuit,
      value: e.signal2.label,
      output: 'Confidence',
      detail: `${Math.round(e.signal2.confidence * 100)}%`,
    },
    {
      title: 'Depth & clarity',
      subtitle: 'Structured LLM rubric · mock',
      icon: ListChecks,
      value: `${(Object.values(e.signal3.rubric).reduce((a, b) => a + b, 0) / 4).toFixed(1)} / 10`,
      output: 'Rubric assessment',
      detail: '4 dimensions',
    },
  ];
  return (
    <div className="stack">
      <div className="grid-3">
        {signals.map(
          ({ title, subtitle, icon: Icon, value, output, detail }, i) => (
            <div className="card signal" key={title}>
              <div className="flex-row spread">
                <span className="eyebrow" style={{ margin: 0 }}>
                  SIGNAL 0{i + 1}
                </span>
                <Icon size={19} color={['#2563eb', '#7c3aed', '#0d9488'][i]} />
              </div>
              <h3>{title}</h3>
              <span style={{ fontSize: 10, color: '#94a3b8' }}>{subtitle}</span>
              <strong style={{ fontFamily: 'var(--font-space)', fontSize: 22 }}>
                {value}
              </strong>
              {i === 2 && (
                <div className="small muted" style={{ fontSize: 10 }}>
                  {Object.entries(e.signal3.rubric)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(' · ')}
                </div>
              )}
              <div className="output">
                <strong>Output:</strong> {output} · {detail}
              </div>
            </div>
          ),
        )}
      </div>
      <div className="notice">
        <div className="flex-row spread">
          <strong>Your feedback</strong>
          <span
            className={`badge ${e.level === 'HIGH' ? 'green' : e.level === 'MEDIUM' ? 'amber' : 'gray'}`}
          >
            {e.finalScore}/100 · {e.level}
          </span>
        </div>
        <p style={{ marginTop: 8 }}>{e.signal3.feedback}</p>
        {e.signal3.missingConcepts.length > 0 && (
          <p style={{ marginTop: 8 }}>
            <strong>Revisit:</strong> {e.signal3.missingConcepts.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}
