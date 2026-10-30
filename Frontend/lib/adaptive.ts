import type {
  CandidateProfile,
  Difficulty,
  Evaluation,
  Question,
} from '@/types';
import { questionText } from './questions';
export function planNext(input: {
  profile: CandidateProfile;
  questions: Question[];
  lastEvaluation?: Evaluation;
  total: number;
  interviewId: string;
  startingDifficulty: Difficulty;
}) {
  const {
    profile,
    questions,
    lastEvaluation,
    total,
    interviewId,
    startingDifficulty,
  } = input;
  if (questions.length >= total) return null;
  const tiers: Difficulty[] = ['Easy', 'Medium', 'Hard'];
  const previous = questions.at(-1);
  let difficulty = previous?.difficulty ?? startingDifficulty;
  let skill =
    profile.skills[questions.length % profile.skills.length] ?? 'React';
  let reason = 'Selected from your candidate profile';
  if (previous && lastEvaluation) {
    const score = lastEvaluation.finalScore;
    const tier = tiers.indexOf(difficulty);
    if (score >= 75) {
      difficulty = tiers[Math.min(2, tier + 1)];
      reason = 'Strong answer — increasing technical depth';
    } else if (score >= 40) {
      skill = previous.skill;
      reason = `Following up on missing concept: ${lastEvaluation.signal3.missingConcepts[0] ?? 'technical depth'}`;
    } else {
      difficulty = tiers[Math.max(0, tier - 1)];
      reason = 'Building confidence with a foundational concept';
    }
  }
  if (
    questions.length >= 2 &&
    questions.at(-1)?.skill === skill &&
    questions.at(-2)?.skill === skill
  ) {
    skill =
      profile.skills.find((s) => s !== skill) ??
      (skill === 'React' ? 'SQL' : 'React');
    reason += '; rotating skills for balanced coverage';
  }
  let text = questionText(skill, difficulty, questions.length);
  if (
    lastEvaluation &&
    lastEvaluation.finalScore >= 40 &&
    lastEvaluation.finalScore < 75 &&
    skill === previous?.skill
  ) {
    text = `Explain ${lastEvaluation.signal3.missingConcepts[0] ?? 'the key mechanism'} in ${skill}, and give a practical example.`;
  }
  const project = profile.projects[0];
  if (
    project &&
    (questions.length === 0 || (lastEvaluation?.finalScore ?? 0) >= 75)
  ) {
    text = `In your project ${project.name}, ${text.charAt(0).toLowerCase() + text.slice(1)}`;
  }
  const nextQuestion: Question = {
    question_id: `${interviewId}-q${questions.length + 1}`,
    interview_id: interviewId,
    skill,
    difficulty,
    text,
    order: questions.length + 1,
  };
  return { nextQuestion, difficulty, skill, reason };
}
