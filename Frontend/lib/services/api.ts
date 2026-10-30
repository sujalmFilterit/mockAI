import type {
  CandidateProfile,
  Evaluation,
  Interview,
  Report,
  User,
} from '@/types';
import type { planNext } from '@/lib/adaptive';
export type InterviewDetail = Interview & { report: Report };
export interface InterviewService {
  bootstrap(): Promise<{
    user: User;
    profile: CandidateProfile | null;
    interviews: Interview[];
  }>;
  parse(file: File): Promise<CandidateProfile>;
  saveProfile(profile: CandidateProfile): Promise<CandidateProfile>;
  start(input: {
    role: string;
    total: 5 | 8 | 10;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    voice: boolean;
  }): Promise<Interview>;
  get(id: string): Promise<InterviewDetail>;
  evaluate(id: string, text: string): Promise<Evaluation>;
  next(id: string): Promise<ReturnType<typeof planNext>>;
  end(id: string): Promise<{ ok: boolean }>;
}
export async function request<T>(path: string, body?: unknown): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
  const response = await fetch(`${base}/${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    credentials: 'include',
    headers:
      body instanceof FormData
        ? undefined
        : { 'Content-Type': 'application/json' },
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error || 'Something went wrong. Try again.');
  return data as T;
}
export const api: InterviewService = {
  bootstrap: () => request('bootstrap'),
  parse: (file) => {
    const form = new FormData();
    form.append('file', file);
    return request('resume/parse', form);
  },
  saveProfile: (profile) => request('profile', profile),
  start: (input) => request('interviews', input),
  get: (id) => request(`interviews/${id}`),
  evaluate: (id, text) => request('evaluate', { interviewId: id, text }),
  next: (id) => request('questions/next', { interviewId: id }),
  end: (id) => request(`interviews/${id}/end`, {}),
};
