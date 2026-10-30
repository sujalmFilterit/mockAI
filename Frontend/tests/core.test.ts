import { describe, it, expect } from 'vitest';
import { planNext } from '@/lib/adaptive';
import { aggregateScore, evaluateAnswer } from '@/lib/scoring';
import { validateResume } from '@/lib/validation';
import type { CandidateProfile, Question } from '@/types';
const profile: CandidateProfile = {
  profile_id: 'p',
  user_id: 'u',
  extracted_text: '',
  skills: ['React', 'SQL'],
  tools: [],
  projects: [{ name: 'Commerce', description: 'Store' }],
};
const question: Question = {
  question_id: 'q1',
  interview_id: 'i',
  skill: 'React',
  difficulty: 'Medium',
  text: 'Explain React',
  order: 1,
};
const evaluation = evaluateAnswer(
  question,
  'state props hooks render memoization '.repeat(25),
);
function plan(score: number, questions: Question[] = [question]) {
  return planNext({
    profile,
    questions,
    lastEvaluation: {
      ...evaluation,
      finalScore: score,
      signal3: { ...evaluation.signal3, missingConcepts: ['indexing'] },
    },
    total: 5,
    interviewId: 'i',
    startingDifficulty: 'Medium',
  });
}
describe('adaptive planner', () => {
  it('escalates at the HIGH boundary and references a project', () => {
    const next = plan(75);
    expect(next?.difficulty).toBe('Hard');
    expect(next?.nextQuestion.text).toContain('Commerce');
  });
  it('targets a missing component at MEDIUM boundaries', () => {
    for (const score of [40, 74]) {
      expect(plan(score)?.skill).toBe('React');
      expect(plan(score)?.nextQuestion.text).toContain('indexing');
    }
  });
  it('reduces difficulty below 40', () =>
    expect(plan(39)?.difficulty).toBe('Easy'));
  it('never exceeds the planned count', () =>
    expect(
      plan(
        90,
        Array.from({ length: 5 }, () => question),
      ),
    ).toBeNull());
  it('rotates a skill after two consecutive occurrences', () =>
    expect(
      plan(60, [question, { ...question, question_id: 'q2', order: 2 }])?.skill,
    ).toBe('SQL'));
  it('never exceeds Hard or goes below Easy', () => {
    expect(plan(99, [{ ...question, difficulty: 'Hard' }])?.difficulty).toBe(
      'Hard',
    );
    expect(plan(0, [{ ...question, difficulty: 'Easy' }])?.difficulty).toBe(
      'Easy',
    );
  });
  it('creates the first resume-aware question', () => {
    const result = planNext({
      profile,
      questions: [],
      total: 5,
      interviewId: 'i',
      startingDifficulty: 'Easy',
    });
    expect(result?.nextQuestion.order).toBe(1);
    expect(result?.nextQuestion.text).toContain('Commerce');
  });
});
describe('score aggregation', () => {
  it('uses the configured weights', () =>
    expect(
      aggregateScore(0.8, 'Correct', {
        depth: 8,
        completeness: 8,
        accuracy: 8,
        clarity: 8,
      }),
    ).toBe(86));
  it('normalizes custom weights', () =>
    expect(
      aggregateScore(
        1,
        'Correct',
        { depth: 10, completeness: 10, accuracy: 10, clarity: 10 },
        { similarity: 3, classifier: 3, rubric: 4 },
      ),
    ).toBe(100));
  it('rejects a zero total', () =>
    expect(() =>
      aggregateScore(
        0,
        'Incorrect',
        { depth: 0, completeness: 0, accuracy: 0, clarity: 0 },
        { similarity: 0, classifier: 0, rubric: 0 },
      ),
    ).toThrow());
  it('rewards relevant concepts over verbosity alone', () => {
    const generic = evaluateAnswer(question, 'unrelated '.repeat(150));
    expect(evaluation.finalScore).toBeGreaterThan(generic.finalScore);
    expect(evaluation.level).toBe('HIGH');
    expect(evaluateAnswer(question, 'I do not know').level).toBe('LOW');
  });
});
describe('resume validation', () => {
  it('accepts PDF and DOCX', () => {
    expect(
      validateResume({ name: 'cv.pdf', size: 100, type: 'application/pdf' }),
    ).toBeNull();
    expect(
      validateResume({
        name: 'cv.DOCX',
        size: 100,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      }),
    ).toBeNull();
  });
  it('accepts the exact 5 MB boundary', () =>
    expect(
      validateResume({
        name: 'cv.pdf',
        size: 5 * 1024 * 1024,
        type: 'application/pdf',
      }),
    ).toBeNull());
  it('rejects empty, oversized, and unsupported files', () => {
    for (const file of [
      { name: 'x.pdf', size: 0, type: 'application/pdf' },
      { name: 'x.pdf', size: 5242881, type: 'application/pdf' },
      { name: 'x.exe', size: 1, type: 'application/octet-stream' },
      { name: 'x.docx', size: 1, type: 'application/pdf' },
    ])
      expect(validateResume(file)).not.toBeNull();
  });
});
