import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { CandidateProfile, Interview, User } from '@/types';
export const demoProfile: CandidateProfile = {
  profile_id: 'profile-demo',
  user_id: 'demo',
  extracted_text:
    'Demo candidate: full-stack developer with React, Node.js, PostgreSQL and Python experience.',
  skills: ['React', 'Node.js', 'SQL', 'Python', 'System Design'],
  tools: ['Git', 'Docker', 'PostgreSQL', 'VS Code'],
  projects: [
    {
      name: 'Commerce Cloud',
      description:
        'A full-stack commerce application with React, Node.js and PostgreSQL.',
    },
    {
      name: 'Insight Analytics',
      description: 'A Python analytics pipeline with interactive dashboards.',
    },
  ],
};
type Account = User & { passwordHash?: string };
type Data = {
  users: Account[];
  profiles: CandidateProfile[];
  interviews: Interview[];
};
export interface Repository {
  read(): Promise<Data>;
  update<T>(fn: (data: Data) => T): Promise<T>;
}
function seed(): Data {
  return {
    users: [{ user_id: 'demo', name: 'Alex Morgan', email: 'demo@nova.local' }],
    profiles: [demoProfile],
    interviews: [68, 76, 82].map((score, i) => ({
      interview_id: `demo-${i}`,
      user_id: 'demo',
      role: [
        'Frontend Developer',
        'Full Stack Developer',
        'Full Stack Developer',
      ][i],
      status: 'completed',
      current_difficulty: 'Hard',
      created_at: new Date(Date.now() - (12 - i * 4) * 86400000).toISOString(),
      total: 5,
      voice: false,
      profile: demoProfile,
      questions: Array.from({ length: 5 }, (_, j) => ({
        question_id: `seed-${i}-${j}`,
        interview_id: `demo-${i}`,
        skill: demoProfile.skills[j],
        difficulty: j < 2 ? 'Medium' : 'Hard',
        text: `Explain a key architectural decision in ${demoProfile.projects[0].name} involving ${demoProfile.skills[j]}.`,
        order: j + 1,
      })),
      evaluations: Array.from({ length: 5 }, (_, j) => ({
        answer_id: `answer-${i}-${j}`,
        question_id: `seed-${i}-${j}`,
        text: 'I used a modular architecture with clear boundaries, tested the critical paths, and measured the resulting performance improvements.',
        signal1: { cosineSimilarity: score / 100 },
        signal2: { label: 'Correct', confidence: 0.88 },
        signal3: {
          rubric: { depth: 8, completeness: 8, accuracy: 8, clarity: 9 },
          missingConcepts: j === 2 ? ['query optimization'] : [],
          feedback:
            'Clear explanation with good practical context. Quantify the tradeoffs in more detail.',
        },
        finalScore: score + (j % 2 === 0 ? 3 : -3),
        level: score >= 75 ? 'HIGH' : 'MEDIUM',
      })),
    })),
  };
}
const file = path.join(process.cwd(), '.data', 'nova.json');
let queue: Promise<unknown> = Promise.resolve();
export const repository: Repository = {
  async read() {
    await queue;
    try {
      return JSON.parse(await fs.readFile(file, 'utf8')) as Data;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      return seed();
    }
  },
  async update<T>(fn: (data: Data) => T) {
    const operation = queue.then(async () => {
      let data: Data;
      try {
        data = JSON.parse(await fs.readFile(file, 'utf8')) as Data;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        data = seed();
      }
      const result = fn(data);
      await fs.mkdir(path.dirname(file), { recursive: true });
      const temp = file + '.tmp';
      await fs.writeFile(temp, JSON.stringify(data, null, 2));
      await fs.rename(temp, file);
      return result;
    });
    queue = operation.catch(() => undefined);
    return operation;
  },
};
export { makeReport } from './report';
