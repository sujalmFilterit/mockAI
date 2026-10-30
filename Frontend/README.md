# Nova — Adaptive AI-Based Mock Interview Platform

By Team Nova Coders. Next.js 14 App Router, strict TypeScript, Tailwind, shadcn-style Radix Button, Lucide, Recharts, Zustand, Zod, and React Hook Form.

## Run locally

Requires Node.js 20+ and npm. From this repository:

```sh
cd Frontend
npm install
npm run dev
```

Open http://localhost:3000. Choose **Explore demo mode** for a seeded dashboard, or register a new account and upload a resume. On Windows PowerShell systems that block npm.ps1, use `npm.cmd` in place of `npm`.

No database, API key, or environment file is needed for development. Google fonts are fetched at build time by next/font. A network connection is needed for the first dependency install and font download.

## Configuration

### Vercel deployment

Set the Vercel project Root Directory to the folder containing this README and the Next.js package.json (`Frontend` if the whole workspace is pushed; `.` if only the app folder is pushed). Select **Next.js** as Framework Preset, use `npm run build`, and disable the Output Directory override (remove `public`). The included vercel.json pins the Next.js preset. Vercel builds use `.next`; local production builds retain `.next-production`.

Set `AUTH_SECRET` in Vercel environment variables before running the deployed authentication endpoints. The JSON repository is a local-development adapter: Vercel serverless functions cannot use it as durable writable storage. Replace it with the PostgreSQL repository before expecting hosted sign-up or interview persistence to work.

Copy `.env.example` to `.env.local` to override defaults:

| Variable                   | Default                   | Purpose                                                                                                                    |
| -------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `USE_MOCKS`                | `true`                    | Enables the local mock orchestration endpoints. Set `false` when using a real backend.                                     |
| `NEXT_PUBLIC_API_BASE_URL` | `/api`                    | Base URL for every service call, including authentication. Set to your Node gateway URL, e.g. `http://localhost:4000/api`. |
| `AUTH_SECRET`              | Development-only fallback | Set a random 32+ character secret for production signing. Required when running a production server.                       |

## Workflow

Landing → login/register or demo → dashboard → resume → setup → live interview → report. History supports role search, status and difficulty filters. Upload validates extension, MIME, file signature and 5 MB size. The demo parser returns a labeled sample profile; it does **not** extract uploaded text or save the document. Review and edit chips and project cards before confirming.

The live session persists answer drafts in localStorage and question deadlines in sessionStorage. The countdown is a practice guide: at zero, the candidate can finish and submit. Voice input depends on the browser Web Speech API and microphone permission; typed input always works. Ending early preserves submitted answers. PDF download opens the browser print dialog; select Save as PDF. Report accordions are expanded before printing.

## Folder overview

```text
app/(marketing)/          Landing
app/(auth)/               Login and register
app/(app)/                Protected dashboard, resume, setup, live, report, history
app/api/[...path]/        Mock route-handler dispatcher
components/ui/            Radix Slot + CVA Button and Card primitives
components/charts/        Recharts trend, radar and bar charts
components/interview/     Live session and tri-signal evaluation
components/report/        Adaptive report and print action
lib/adaptive.ts           Pure question planning policy
lib/questions.ts          42 bank templates, 7 skills, 3 tiers + project templates
lib/scoring.ts            Mock signals and configurable score aggregation
lib/config.ts             Signal weights, duration, size limit
lib/services/api.ts       All network access behind InterviewService
lib/db/                   Repository interface, JSON persistence and seed data
store/                    Zustand persisted answer drafts
types/                    Domain models and Zod schemas
prisma/schema.prisma      PostgreSQL migration draft
tests/                    Vitest adaptive, scoring and upload tests
```

Mock endpoints use one catch-all Route Handler to keep validation, authentication and error handling together. URLs match the individual service contracts:

| Endpoint                  | Method | Contract                                    |
| ------------------------- | ------ | ------------------------------------------- |
| `/api/auth/register`      | POST   | `{name,email,password}` → session cookie    |
| `/api/auth/login`         | POST   | `{email,password}` → session cookie         |
| `/api/auth/demo`          | POST   | Shared demo session cookie                  |
| `/api/auth/logout`        | POST   | Clears cookie                               |
| `/api/bootstrap`          | GET    | `{user,profile,interviews}`                 |
| `/api/resume/parse`       | POST   | multipart `file` → CandidateProfile         |
| `/api/profile`            | POST   | CandidateProfile → saved profile            |
| `/api/interviews`         | POST   | `{role,total,difficulty,voice}` → Interview |
| `/api/interviews/:id`     | GET    | Interview + computed report                 |
| `/api/evaluate`           | POST   | `{interviewId,text}` → Evaluation           |
| `/api/questions/next`     | POST   | `{interviewId}` → planned question + reason |
| `/api/interviews/:id/end` | POST   | Marks interview ended                       |

## Connecting the real Node/Python backend

1. Implement these contracts on your Node gateway, forwarding parsing, question generation and tri-signal evaluation to Python. The client depends only on `InterviewService`; all requests run through `request` in `lib/services/api.ts`.
2. Set `NEXT_PUBLIC_API_BASE_URL` to the gateway API URL and `USE_MOCKS=false`; restart/rebuild Next.js because public environment variables are embedded at build time. No component changes are needed.
3. The gateway must issue a `nova-session` JWT compatible with the middleware: HS256, a user ID in `sub`, expiry in `exp`, and the same `AUTH_SECRET`. For same-origin deployment, reverse-proxy the gateway under `/api`. For cross-origin use, configure credentialed CORS and cookie domain/SameSite/Secure so the Next.js host receives the cookie. A cookie scoped only to another hostname cannot authenticate Next.js middleware.
4. Replace the repository adapter with Prisma/PostgreSQL and create migrations from the supplied draft. Snapshot the candidate profile at interview creation, as the mock does, to keep historical reports stable.
5. Replace the mock parser TODO with actual PDF/DOCX extraction and a validated profile response. Replace keyword heuristics with Sentence Transformers, the classifier and structured rubric output. Preserve the response shape in `types/index.ts`.

Default aggregation is similarity 30%, classifier 30%, rubric 40%. Classifier values are Correct=1, Partially Correct=.55, Incorrect=.15. Rubric average is divided by 10. Scores ≥75 escalate, 40–74 follow up on missing concepts, <40 reduce difficulty. Skills rotate after two consecutive questions. These prototype scores are not a validated hiring assessment.

## Persistence and auth boundaries

Data is stored in `.data/nova.json`, created on first mutation. Updates serialize through an in-process queue and write via a temporary file. This is suitable for one local Node process, not multiple replicas or serverless ephemeral storage. Stop the server and delete `.data/nova.json` to reset demo data. Demo mode is a shared, deliberately mutable workspace. Registered accounts have independent data. Passwords are salted and scrypt-hashed; signed JWT cookies are httpOnly, sameSite=lax, and Secure in production. Production auth still needs rate limiting, recovery and email verification.

## Verification

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

Build output uses `.next-production`, separate from `.next` development output so a running dev server cannot overwrite a production build. To run the API/page smoke checks against a running server, use `node tests/smoke.mjs` (or set `SMOKE_BASE_URL` for another port). It registers an isolated test account and exercises authentication, uploads, all routes, ownership checks, a full adaptive session, early ending, and reporting.

Vitest covers score boundaries, tier caps, skill rotation, total question caps, project context, aggregation, concept overlap, and resume size/type validation. `npm run format` formats the source with Prettier.

## Mock replacement checklist

- [ ] Resume sample → Python document parser and real extracted profile.
- [ ] Template question bank → Node/Python question planner.
- [ ] Keyword/length scores → semantic embeddings, classifier, LLM rubric.
- [ ] Local JSON repository → Prisma/PostgreSQL and transactional writes.
- [ ] Prototype auth/demo session → production account lifecycle and abuse controls.
- [ ] Browser print-to-PDF → optional dedicated PDF renderer, if needed.

Browser speech-to-text and browser printing are functional browser integrations; their availability depends on the client environment.
