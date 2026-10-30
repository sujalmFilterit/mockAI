import { z } from 'zod';
export const difficultySchema = z.enum(['Easy', 'Medium', 'Hard']);
export type Difficulty = z.infer<typeof difficultySchema>;
export const userSchema = z.object({
  user_id: z.string(),
  name: z.string(),
  email: z.string().email(),
});
export type User = z.infer<typeof userSchema>;
export const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
});
export const profileSchema = z.object({
  profile_id: z.string(),
  user_id: z.string(),
  extracted_text: z.string(),
  skills: z.array(z.string().min(1)).min(1),
  tools: z.array(z.string()),
  projects: z.array(projectSchema),
});
export type CandidateProfile = z.infer<typeof profileSchema>;
export const questionSchema = z.object({
  question_id: z.string(),
  interview_id: z.string(),
  skill: z.string(),
  difficulty: difficultySchema,
  text: z.string(),
  order: z.number().int().positive(),
});
export type Question = z.infer<typeof questionSchema>;
export const evaluationSchema = z.object({
  answer_id: z.string(),
  question_id: z.string(),
  text: z.string(),
  signal1: z.object({ cosineSimilarity: z.number().min(0).max(1) }),
  signal2: z.object({
    label: z.enum(['Correct', 'Partially Correct', 'Incorrect']),
    confidence: z.number().min(0).max(1),
  }),
  signal3: z.object({
    rubric: z.object({
      depth: z.number().min(0).max(10),
      completeness: z.number().min(0).max(10),
      accuracy: z.number().min(0).max(10),
      clarity: z.number().min(0).max(10),
    }),
    missingConcepts: z.array(z.string()),
    feedback: z.string(),
  }),
  finalScore: z.number().min(0).max(100),
  level: z.enum(['HIGH', 'MEDIUM', 'LOW']),
});
export type Evaluation = z.infer<typeof evaluationSchema>;
export const interviewSchema = z.object({
  interview_id: z.string(),
  user_id: z.string(),
  role: z.string(),
  status: z.enum(['active', 'completed', 'ended']),
  current_difficulty: difficultySchema,
  created_at: z.string(),
  total: z.union([z.literal(5), z.literal(8), z.literal(10)]),
  voice: z.boolean(),
  profile: profileSchema,
  questions: z.array(questionSchema),
  evaluations: z.array(evaluationSchema),
});
export type Interview = z.infer<typeof interviewSchema>;
export const answerSchema = z.object({
  answer_id: z.string(),
  question_id: z.string(),
  text: z.string(),
  similarity_score: z.number().min(0).max(1),
  ml_label: evaluationSchema.shape.signal2.shape.label,
  rubric: evaluationSchema.shape.signal3.shape.rubric,
  missing_concepts: z.array(z.string()),
  feedback: z.string(),
  final_score: z.number().min(0).max(100),
});
export type Answer = z.infer<typeof answerSchema>;
export const reportSchema = z.object({
  report_id: z.string(),
  interview_id: z.string(),
  overall_score: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  skill_gaps: z.array(z.string()),
  skill_scores: z.record(z.number().min(0).max(100)),
  missing_concepts: z.array(z.string()),
});
export type Report = z.infer<typeof reportSchema>;
export const setupSchema = z.object({
  role: z.string().min(2),
  total: z.union([z.literal(5), z.literal(8), z.literal(10)]),
  difficulty: difficultySchema,
  voice: z.boolean(),
});
export const authSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Use at least 8 characters'),
});
