import assert from 'node:assert/strict';

const base = process.env.SMOKE_BASE_URL || 'http://localhost:3000';
let cookie = '';
async function call(path, body, expected = 200, authenticated = true) {
  const response = await fetch(`${base}/api/${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      ...(authenticated && cookie ? { Cookie: cookie } : {}),
      ...(body instanceof FormData
        ? {}
        : { 'Content-Type': 'application/json' }),
    },
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
  });
  const data = await response.json();
  assert.equal(response.status, expected, `${path}: ${JSON.stringify(data)}`);
  return { response, data };
}

await call('bootstrap', undefined, 401, false);
const protectedPage = await fetch(`${base}/dashboard`, { redirect: 'manual' });
assert.equal(protectedPage.status, 307);
assert.match(protectedPage.headers.get('location'), /login/);
await call(
  'auth/register',
  { name: 'Smoke Test', email: 'invalid', password: 'short' },
  400,
);
const email = `smoke-${Date.now()}@example.test`;
const credentials = {
  name: 'Smoke Test',
  email,
  password: 'smoke-test-password-123',
};
const registration = await call('auth/register', credentials);
cookie = registration.response.headers.get('set-cookie').split(';')[0];
assert.match(registration.response.headers.get('set-cookie'), /httponly/i);
await call('auth/login', { email, password: 'incorrect-password' }, 401);
await call('auth/login', credentials);
let result = await call('bootstrap');
assert.equal(result.data.user.email, email);
assert.equal(result.data.user.passwordHash, undefined);
assert.equal(result.data.profile, null);
const invalid = new FormData();
invalid.append(
  'file',
  new Blob(['invalid'], { type: 'application/pdf' }),
  'invalid.pdf',
);
await call('resume/parse', invalid, 400);
const upload = new FormData();
upload.append(
  'file',
  new Blob(['%PDF-1.4\n mock document'], { type: 'application/pdf' }),
  'resume.pdf',
);
const parsed = await call('resume/parse', upload);
assert.ok(parsed.data.skills.length);
await call('profile', parsed.data);
const session = await call('interviews', {
  role: 'Full Stack Developer',
  total: 5,
  difficulty: 'Medium',
  voice: false,
});
const id = session.data.interview_id;
assert.match(session.data.questions[0].text, /Commerce Cloud/);
for (let index = 0; index < 5; index++) {
  const text =
    index % 2 === 0
      ? 'state props hooks render memoization event loop async middleware streams error index join transaction query normalization generator iterator memory exception decorator cache load balancer database queue replication '.repeat(
          5,
        )
      : 'I am not sure.';
  const evaluation = await call('evaluate', { interviewId: id, text });
  assert.ok(
    evaluation.data.finalScore >= 0 && evaluation.data.finalScore <= 100,
  );
  if (index < 4) {
    const next = await call('questions/next', { interviewId: id });
    assert.equal(next.data.nextQuestion.order, index + 2);
    assert.ok(next.data.reason);
  }
}
result = await call(`interviews/${id}`);
assert.equal(result.data.status, 'completed');
assert.equal(result.data.evaluations.length, 5);
assert.equal(result.data.questions.length, 5);
assert.ok(Object.keys(result.data.report.skill_scores).length);
await call('questions/next', { interviewId: id }, 400);
const early = await call('interviews', {
  role: 'Frontend Developer',
  total: 5,
  difficulty: 'Easy',
  voice: false,
});
await call(`interviews/${early.data.interview_id}/end`, {});
await call(
  'evaluate',
  { interviewId: early.data.interview_id, text: 'state and props' },
  400,
);
assert.equal(
  (await call(`interviews/${early.data.interview_id}`)).data.status,
  'ended',
);
for (const route of [
  '/',
  '/login',
  '/register',
  '/dashboard',
  '/resume',
  '/interview/setup',
  '/history',
  `/interview/${id}`,
  `/interview/${id}/report`,
]) {
  const response = await fetch(`${base}${route}`, {
    headers: { Cookie: cookie },
  });
  assert.equal(response.status, 200, route);
  assert.match(await response.text(), /Nova|nova/);
}
const demo = await call('auth/demo', {});
cookie = demo.response.headers.get('set-cookie').split(';')[0];
await call(`interviews/${id}`, undefined, 404);
await call('auth/logout', {});
console.log(
  'Smoke checks passed: authentication, ownership, uploads, all pages, five-question adaptive session, early ending, and report.',
);
