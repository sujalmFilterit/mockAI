'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { authSchema } from '@/types';
import { request } from '@/lib/services/api';
import { Brand } from './shell';
const schema = authSchema.extend({ name: z.string().optional() });
export function DemoButton({
  className = 'btn btn-outline',
}: {
  className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return (
    <>
      <button
        className={className}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await request('auth/demo', {});
            router.push('/dashboard');
            router.refresh();
          } catch (e) {
            setError((e as Error).message);
            setBusy(false);
          }
        }}
      >
        {busy ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <Sparkles size={15} />
        )}{' '}
        Explore demo mode
      </button>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
export function AuthForm({ register = false }: { register?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });
  return (
    <div className="auth-page">
      <section className="auth-story">
        <div>
          <Brand />
          <div className="brand-caption">BY TEAM NOVA CODERS</div>
        </div>
        <div>
          <span className="eyebrow" style={{ color: '#93c5fd' }}>
            PRACTICE WITH PURPOSE
          </span>
          <h1>Great interviews start before the interview.</h1>
          <p style={{ color: '#b7c8e4', maxWidth: 400, marginTop: 25 }}>
            Build confidence with questions tailored to your experience and
            feedback that gives you a clear path forward.
          </p>
          <div className="flex-row" style={{ marginTop: 30 }}>
            <span className="badge">Resume-aware</span>
            <span className="badge">Adaptive practice</span>
            <span className="badge">Three AI signals</span>
          </div>
        </div>
        <p className="small" style={{ color: '#94a3b8' }}>
          Your potential, a little more prepared.
        </p>
      </section>
      <main id="main" className="auth-form">
        <div className="auth-form-inner">
          <span className="eyebrow">YOUR NEXT CHAPTER</span>
          <h1>{register ? 'Create your account' : 'Welcome back'}</h1>
          <p className="muted">
            {register
              ? 'Start building your interview confidence.'
              : 'Your next opportunity is worth preparing for.'}
          </p>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              setError('');
              if (register && (!values.name || values.name.trim().length < 2)) {
                form.setError('name', {
                  message: 'Enter your name (at least 2 characters)',
                });
                return;
              }
              try {
                await request(
                  `auth/${register ? 'register' : 'login'}`,
                  values,
                );
                router.push('/dashboard');
                router.refresh();
              } catch (e) {
                setError((e as Error).message);
              }
            })}
            noValidate
          >
            {register && (
              <div className="form-field">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  autoComplete="name"
                  {...form.register('name')}
                  aria-invalid={!!form.formState.errors.name}
                />
                {form.formState.errors.name && (
                  <p className="error">{form.formState.errors.name.message}</p>
                )}
              </div>
            )}
            <div className="form-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...form.register('email')}
                aria-invalid={!!form.formState.errors.email}
              />
              {form.formState.errors.email && (
                <p className="error">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete={register ? 'new-password' : 'current-password'}
                placeholder="At least 8 characters"
                {...form.register('password')}
                aria-invalid={!!form.formState.errors.password}
              />
              {form.formState.errors.password && (
                <p className="error">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : null}
              {register ? 'Create account' : 'Sign in'}
              <ArrowRight size={15} />
            </button>
          </form>
          <p
            className="small muted"
            style={{ textAlign: 'center', margin: '22px 0' }}
          >
            or get a feel for Nova
          </p>
          <DemoButton className="btn btn-outline w-full" />
          <p
            className="small muted"
            style={{ textAlign: 'center', marginTop: 25 }}
          >
            {register ? 'Already have an account?' : 'New to Nova?'}{' '}
            <Link
              style={{ color: '#2563eb', fontWeight: 600 }}
              href={register ? '/login' : '/register'}
            >
              {register ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
          <p
            className="small muted"
            style={{ fontSize: 10, marginTop: 25, textAlign: 'center' }}
          >
            Local prototype · Use a password you don’t use elsewhere.
          </p>
        </div>
      </main>
    </div>
  );
}
