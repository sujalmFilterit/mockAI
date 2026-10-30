import type { Interview, Report } from '@/types';
export function makeReport(interview: Interview): Report {
  const skills: Record<string, number[]> = {};
  for (const e of interview.evaluations) {
    const skill =
      interview.questions.find((q) => q.question_id === e.question_id)?.skill ??
      'General';
    (skills[skill] ??= []).push(e.finalScore);
  }
  const scores = Object.fromEntries(
    Object.entries(skills).map(([k, v]) => [
      k,
      Math.round(v.reduce((a, b) => a + b, 0) / v.length),
    ]),
  );
  return {
    report_id: `report-${interview.interview_id}`,
    interview_id: interview.interview_id,
    overall_score: interview.evaluations.length
      ? Math.round(
          interview.evaluations.reduce((a, e) => a + e.finalScore, 0) /
            interview.evaluations.length,
        )
      : 0,
    strengths: Object.keys(scores).filter((k) => scores[k] >= 75),
    skill_gaps: Object.keys(scores).filter((k) => scores[k] < 75),
    skill_scores: scores,
    missing_concepts: [
      ...new Set(
        interview.evaluations.flatMap((e) => e.signal3.missingConcepts),
      ),
    ],
  };
}
