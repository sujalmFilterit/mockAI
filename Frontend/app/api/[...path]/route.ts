import { NextResponse, type NextRequest } from 'next/server';
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { currentUserId, signToken } from '@/lib/auth';
import { demoProfile, repository, makeReport } from '@/lib/db/mock-db';
import {
  authSchema,
  profileSchema,
  setupSchema,
  type Interview,
} from '@/types';
import { validateResume } from '@/lib/validation';
import { planNext } from '@/lib/adaptive';
import { evaluateAnswer } from '@/lib/scoring';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
function passwordHash(
  password: string,
  salt = randomBytes(16).toString('hex'),
) {
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
async function handle(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  try {
    const route = params.path.join('/');
    const method = request.method;
    if (route.startsWith('auth/')) {
      if (method !== 'POST')
        return NextResponse.json(
          { error: 'Method not allowed.' },
          { status: 405 },
        );
      if (route === 'auth/logout') {
        const response = NextResponse.json({ ok: true });
        response.cookies.delete('nova-session');
        return response;
      }
      let id = 'demo';
      if (route !== 'auth/demo') {
        const body = await request.json();
        const input = authSchema.parse(body);
        const data = await repository.read();
        const account = data.users.find(
          (u) => u.email.toLowerCase() === input.email.toLowerCase(),
        );
        if (route === 'auth/register') {
          if (account)
            return NextResponse.json(
              { error: 'An account with this email already exists.' },
              { status: 409 },
            );
          const name = z.string().min(2).parse(body.name);
          id = crypto.randomUUID();
          await repository.update((db) =>
            db.users.push({
              user_id: id,
              name,
              email: input.email.toLowerCase(),
              passwordHash: passwordHash(input.password),
            }),
          );
        } else if (route === 'auth/login') {
          if (!account?.passwordHash)
            return NextResponse.json(
              { error: 'Invalid email or password.' },
              { status: 401 },
            );
          const [salt, hash] = account.passwordHash.split(':');
          const received = passwordHash(input.password, salt).split(':')[1];
          if (
            !timingSafeEqual(
              Buffer.from(hash, 'hex'),
              Buffer.from(received, 'hex'),
            )
          )
            return NextResponse.json(
              { error: 'Invalid email or password.' },
              { status: 401 },
            );
          id = account.user_id;
        } else
          return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      const response = NextResponse.json({ ok: true });
      response.cookies.set('nova-session', await signToken(id), {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 604800,
      });
      return response;
    }
    const userId = await currentUserId();
    if (!userId)
      return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
    if (process.env.USE_MOCKS === 'false')
      return NextResponse.json(
        {
          error:
            'Configure the external API base URL in your service environment.',
        },
        { status: 503 },
      );
    if (route === 'bootstrap') {
      const db = await repository.read();
      const account = db.users.find((u) => u.user_id === userId);
      if (!account)
        return NextResponse.json(
          { error: 'Account not found.' },
          { status: 401 },
        );
      return NextResponse.json({
        user: {
          user_id: account.user_id,
          name: account.name,
          email: account.email,
        },
        profile: db.profiles.find((p) => p.user_id === userId) ?? null,
        interviews: db.interviews.filter((i) => i.user_id === userId),
      });
    }
    if (route === 'resume/parse' && method === 'POST') {
      const form = await request.formData();
      const file = form.get('file');
      if (!(file instanceof File)) throw new Error('Select a file.');
      const error = validateResume(file);
      if (error) return NextResponse.json({ error }, { status: 400 });
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdf =
        bytes[0] === 37 &&
        bytes[1] === 80 &&
        bytes[2] === 68 &&
        bytes[3] === 70;
      const docx = bytes[0] === 80 && bytes[1] === 75;
      if (
        (file.name.toLowerCase().endsWith('.pdf') && !pdf) ||
        (file.name.toLowerCase().endsWith('.docx') && !docx)
      )
        return NextResponse.json(
          { error: 'File content does not match its extension.' },
          { status: 400 },
        );
      /* TODO: replace with Python parser; no actual text extraction occurs in demo mode. */ return NextResponse.json(
        {
          ...demoProfile,
          profile_id: crypto.randomUUID(),
          user_id: userId,
          extracted_text: `Mock profile for ${file.name}. This demonstration does not extract the document contents.`,
        },
      );
    }
    if (route === 'profile' && method === 'POST') {
      const profile = profileSchema.parse(await request.json());
      profile.user_id = userId;
      await repository.update((db) => {
        db.profiles = db.profiles.filter((p) => p.user_id !== userId);
        db.profiles.push(profile);
      });
      return NextResponse.json(profile);
    }
    if (route === 'interviews' && method === 'POST') {
      const setup = setupSchema.parse(await request.json());
      const db = await repository.read();
      const profile = db.profiles.find((p) => p.user_id === userId);
      if (!profile)
        return NextResponse.json(
          { error: 'Confirm a resume profile first.' },
          { status: 400 },
        );
      const id = crypto.randomUUID();
      const planned = planNext({
        profile,
        questions: [],
        total: setup.total,
        interviewId: id,
        startingDifficulty: setup.difficulty,
      });
      const interview: Interview = {
        interview_id: id,
        user_id: userId,
        role: setup.role,
        status: 'active',
        current_difficulty: setup.difficulty,
        created_at: new Date().toISOString(),
        total: setup.total,
        voice: setup.voice,
        profile,
        questions: planned ? [planned.nextQuestion] : [],
        evaluations: [],
      };
      await repository.update((db) => db.interviews.push(interview));
      return NextResponse.json(interview);
    }
    if (params.path[0] === 'interviews' && params.path[1]) {
      const db = await repository.read();
      const interview = db.interviews.find(
        (i) => i.interview_id === params.path[1] && i.user_id === userId,
      );
      if (!interview)
        return NextResponse.json(
          { error: 'Interview not found.' },
          { status: 404 },
        );
      if (params.path[2] === 'end' && method === 'POST') {
        await repository.update((db) => {
          const item = db.interviews.find(
            (i) => i.interview_id === interview.interview_id,
          )!;
          item.status = 'ended';
        });
        return NextResponse.json({ ok: true });
      }
      return NextResponse.json({ ...interview, report: makeReport(interview) });
    }
    if (
      (route === 'evaluate' || route === 'questions/next') &&
      method === 'POST'
    ) {
      const body = z
        .object({
          interviewId: z.string(),
          text: z.string().trim().min(1).max(20000).optional(),
        })
        .parse(await request.json());
      const result = await repository.update((db) => {
        const interview = db.interviews.find(
          (i) => i.interview_id === body.interviewId && i.user_id === userId,
        );
        if (!interview) throw new Error('Interview not found.');
        if (interview.status !== 'active')
          throw new Error('This interview has ended.');
        const question = interview.questions.at(-1)!;
        if (route === 'evaluate') {
          if (!body.text) throw new Error('Write an answer first.');
          const existing = interview.evaluations.find(
            (e) => e.question_id === question.question_id,
          );
          if (existing) return existing;
          const evaluation = evaluateAnswer(question, body.text);
          interview.evaluations.push(evaluation);
          if (interview.evaluations.length >= interview.total)
            interview.status = 'completed';
          return evaluation;
        }
        const lastEvaluation = interview.evaluations.find(
          (e) => e.question_id === question.question_id,
        );
        if (!lastEvaluation)
          return {
            nextQuestion: question,
            difficulty: question.difficulty,
            skill: question.skill,
            reason: 'Continue your current question',
          };
        const planned = planNext({
          profile: interview.profile,
          questions: interview.questions,
          lastEvaluation,
          total: interview.total,
          interviewId: interview.interview_id,
          startingDifficulty: interview.current_difficulty,
        });
        if (planned) {
          interview.questions.push(planned.nextQuestion);
          interview.current_difficulty = planned.difficulty;
        }
        return planned;
      });
      return NextResponse.json(result);
    }
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof z.ZodError
            ? error.issues[0].message
            : error instanceof Error
              ? error.message
              : 'Request failed.',
      },
      { status: 400 },
    );
  }
}
export const GET = handle;
export const POST = handle;
