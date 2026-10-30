import { config } from './config';
import { concepts, normalizeSkill } from './questions';
import type { Evaluation, Question } from '@/types';
export function aggregateScore(
  similarity: number,
  label: Evaluation['signal2']['label'],
  rubric: Evaluation['signal3']['rubric'],
  weights = config.weights,
) {
  const sum = weights.similarity + weights.classifier + weights.rubric;
  if (sum <= 0) throw new Error('Weights must have a positive total');
  const classifier = { Correct: 1, 'Partially Correct': 0.55, Incorrect: 0.15 }[
    label
  ];
  const average = Object.values(rubric).reduce((a, b) => a + b, 0) / 40;
  return Math.round(
    Math.max(
      0,
      Math.min(
        100,
        ((similarity * weights.similarity +
          classifier * weights.classifier +
          average * weights.rubric) /
          sum) *
          100,
      ),
    ),
  );
}
export function evaluateAnswer(question: Question, text: string): Evaluation {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const reference = concepts[normalizeSkill(question.skill)];
  const found = reference.filter((c) => text.toLowerCase().includes(c));
  const overlap = found.length / reference.length;
  const length = Math.min(words / 100, 1);
  const similarity = Math.min(0.98, overlap * 0.7 + length * 0.3);
  const label =
    similarity >= 0.65
      ? 'Correct'
      : similarity >= 0.3
        ? 'Partially Correct'
        : 'Incorrect';
  const rubric = {
    depth: Math.round(length * 8 + overlap * 2),
    completeness: Math.round(overlap * 8 + length * 2),
    accuracy: Math.round(similarity * 10),
    clarity: Math.round(Math.min(10, words / 8)),
  };
  const finalScore = aggregateScore(similarity, label, rubric);
  const missingConcepts = reference.filter((c) => !found.includes(c));
  return {
    answer_id: crypto.randomUUID(),
    question_id: question.question_id,
    text,
    signal1: { cosineSimilarity: Number(similarity.toFixed(2)) },
    signal2: {
      label,
      confidence: Number(
        Math.min(0.97, 0.6 + Math.abs(similarity - 0.5) * 0.7).toFixed(2),
      ),
    },
    signal3: {
      rubric,
      missingConcepts,
      feedback:
        finalScore >= 75
          ? 'Strong explanation. Add a concrete tradeoff and a measurable result to deepen your answer.'
          : `Build your explanation around ${missingConcepts.slice(0, 3).join(', ') || 'a concrete example'}. Explain the mechanism, then connect it to your project.`,
    },
    finalScore,
    level: finalScore >= 75 ? 'HIGH' : finalScore >= 40 ? 'MEDIUM' : 'LOW',
  };
}
