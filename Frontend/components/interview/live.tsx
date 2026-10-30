'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Clock3,
  Mic,
  MicOff,
  ArrowRight,
  Send,
  Loader2,
  LogOut,
  X,
} from 'lucide-react';
import { api, type InterviewDetail } from '@/lib/services/api';
import { config } from '@/lib/config';
import { useInterviewStore } from '@/store/interview-store';
import { Skeleton, ErrorState } from '@/components/common';
import { EvaluationCards } from './evaluation';
import type { Evaluation } from '@/types';
type RecognitionEvent = {
  results: {
    [index: number]: { [index: number]: { transcript: string } };
    length: number;
  };
  resultIndex: number;
};
type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
};
function Typewriter({ text }: { text: string }) {
  const [display, setDisplay] = useState('');
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(text);
      return;
    }
    let count = 0;
    setDisplay('');
    const timer = setInterval(() => {
      count += 3;
      setDisplay(text.slice(0, count));
      if (count >= text.length) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [text]);
  return (
    <>
      <span aria-hidden="true">{display}</span>
      <span className="sr-only">{text}</span>
    </>
  );
}
export function LiveInterview({ id }: { id: string }) {
  const router = useRouter();
  const [interview, setInterview] = useState<InterviewDetail | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [reason, setReason] = useState(
    'Personalized from your resume and projects',
  );
  const [seconds, setSeconds] = useState(config.questionSeconds);
  const [confirm, setConfirm] = useState(false);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognition = useRef<Recognition | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const question = interview?.questions.at(-1);
  const key = question?.question_id ?? '';
  const answer = useInterviewStore((s) => s.drafts[key] ?? '');
  const setDraft = useInterviewStore((s) => s.setDraft);
  const clearDraft = useInterviewStore((s) => s.clearDraft);
  const load = useCallback(() => {
    setError('');
    api
      .get(id)
      .then((i) => {
        if (i.status !== 'active') {
          router.replace(`/interview/${id}/report`);
          return;
        }
        setInterview(i);
        setEvaluation(
          i.evaluations.find(
            (e) => e.question_id === i.questions.at(-1)?.question_id,
          ) ?? null,
        );
      })
      .catch((e) => setError(e.message));
  }, [id, router]);
  useEffect(load, [load]);
  useEffect(() => {
    const speech = window as SpeechWindow;
    setSupported(
      !!(speech.SpeechRecognition || speech.webkitSpeechRecognition),
    );
    return () => recognition.current?.stop();
  }, []);
  useEffect(() => {
    if (!key) return;
    const storageKey = `nova-deadline-${key}`;
    const saved = sessionStorage.getItem(storageKey);
    const deadline = saved
      ? Number(saved)
      : Date.now() + config.questionSeconds * 1000;
    if (!saved) sessionStorage.setItem(storageKey, String(deadline));
    const tick = () =>
      setSeconds(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    tick();
    if (evaluation) return;
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [key, evaluation]);
  useEffect(() => {
    if (confirm) {
      cancelRef.current?.focus();
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setConfirm(false);
        if (e.key === 'Tab') {
          const elements = document.querySelectorAll<HTMLButtonElement>(
            '[role="dialog"] button',
          );
          const first = elements[0];
          const last = elements[elements.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }
  }, [confirm]);
  function toggleVoice() {
    if (listening) {
      recognition.current?.stop();
      return;
    }
    const speech = window as SpeechWindow;
    const Constructor =
      speech.SpeechRecognition || speech.webkitSpeechRecognition;
    if (!Constructor) return;
    const instance = new Constructor();
    recognition.current = instance;
    instance.lang = 'en-US';
    instance.continuous = true;
    instance.interimResults = false;
    instance.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++)
        transcript += event.results[i][0].transcript + ' ';
      const current = useInterviewStore.getState().drafts[key] ?? '';
      setDraft(key, (current + ' ' + transcript).trim());
    };
    instance.onerror = (event) => {
      setError(`Voice input: ${event.error}. You can continue by typing.`);
      setListening(false);
    };
    instance.onend = () => setListening(false);
    try {
      instance.start();
      setListening(true);
    } catch {
      setError('Microphone could not start. Continue by typing.');
    }
  }
  async function submit() {
    if (!question || !answer.trim() || busy) return;
    recognition.current?.stop();
    setBusy(true);
    setError('');
    try {
      const result = await api.evaluate(id, answer);
      setEvaluation(result);
      setInterview((current) =>
        current
          ? {
              ...current,
              evaluations: [
                ...current.evaluations.filter(
                  (item) => item.question_id !== result.question_id,
                ),
                result,
              ],
            }
          : current,
      );
      clearDraft(key);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (!interview)
    return error ? <ErrorState message={error} retry={load} /> : <Skeleton />;
  if (!question) return <ErrorState message="No question is available." />;
  return (
    <div className="stack">
      <div className="section-head" style={{ marginBottom: 0 }}>
        <div>
          <span className="eyebrow">YOUR PRACTICE CONVERSATION</span>
          <h1>{interview.role}</h1>
        </div>
        <button className="btn btn-outline" onClick={() => setConfirm(true)}>
          <LogOut size={14} /> End interview
        </button>
      </div>
      <div className="card">
        <div className="flex-row spread">
          <span className="small">
            <strong>Question {question.order}</strong>{' '}
            <span className="muted">of {interview.total}</span>
          </span>
          <span
            className="timer"
            style={{ color: seconds < 30 ? '#dc2626' : '#64748b' }}
          >
            <Clock3 size={16} />
            {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
          </span>
        </div>
        <div
          className="progress"
          role="progressbar"
          aria-label="Interview progress"
          aria-valuenow={interview.evaluations.length}
          aria-valuemin={0}
          aria-valuemax={interview.total}
          style={{ marginTop: 15 }}
        >
          <span
            style={{
              width: `${(interview.evaluations.length / interview.total) * 100}%`,
            }}
          />
        </div>
      </div>
      {error && <ErrorState message={error} />}
      <div className="question-layout">
        <div className="card ai-panel">
          <div className="orb live">
            <Sparkles size={36} />
          </div>
          <span className="eyebrow">NOVA · YOUR AI INTERVIEWER</span>
          <div className="flex-row" style={{ justifyContent: 'center' }}>
            <span
              className={`badge ${question.difficulty === 'Hard' ? 'purple' : question.difficulty === 'Medium' ? 'amber' : 'green'}`}
            >
              {question.difficulty}
            </span>
            <span className="badge">{question.skill}</span>
          </div>
          <h2 className="question-text">
            <Typewriter text={question.text} />
          </h2>
          <p className="small muted" style={{ fontSize: 10, marginTop: 25 }}>
            {reason}
          </p>
        </div>
        <div className="card">
          <span className="eyebrow">A LITTLE GUIDANCE</span>
          <h3>Let your thinking show.</h3>
          <div className="stack muted small" style={{ marginTop: 23, gap: 20 }}>
            <p>
              <strong style={{ color: '#0f172a' }}>
                01 · Start with the idea
              </strong>
              <br />
              Explain the concept in your own words.
            </p>
            <p>
              <strong style={{ color: '#0f172a' }}>
                02 · Make it concrete
              </strong>
              <br />
              Connect your explanation to a real project.
            </p>
            <p>
              <strong style={{ color: '#0f172a' }}>
                03 · Explore the tradeoffs
              </strong>
              <br />
              Share why you chose an approach, and what you’d improve.
            </p>
          </div>
          <div className="notice" style={{ marginTop: 25 }}>
            Your answer is assessed across semantic similarity, technical
            correctness, and a four-part rubric.
          </div>
        </div>
      </div>
      {!evaluation ? (
        <section className="card">
          <div className="section-head">
            <h3>Your answer</h3>
            {interview.voice && (
              <button
                className="btn btn-outline"
                disabled={!supported || busy}
                onClick={toggleVoice}
              >
                {listening ? <MicOff size={15} /> : <Mic size={15} />}{' '}
                {listening ? 'Stop recording' : 'Use microphone'}
              </button>
            )}
          </div>
          {interview.voice && !supported && (
            <p className="small muted" style={{ marginBottom: 12 }}>
              Voice input is unavailable in this browser. You can type your
              answer below.
            </p>
          )}
          {seconds === 0 && (
            <div className="notice" role="status" style={{ marginBottom: 12 }}>
              Time’s up. Finish your thought and submit when you’re ready.
            </div>
          )}
          <label htmlFor="answer" className="sr-only">
            Your answer to question {question.order}
          </label>
          <textarea
            id="answer"
            rows={7}
            maxLength={20000}
            placeholder="Walk through your approach, explain the why, and share an example…"
            value={answer}
            disabled={busy}
            onChange={(e) => setDraft(key, e.target.value)}
          />
          <div className="flex-row spread" style={{ marginTop: 16 }}>
            <span className="small muted">
              {answer.trim() ? answer.trim().split(/\s+/).length : 0} words ·
              Draft saved on this device
            </span>
            <button
              className="btn btn-primary"
              disabled={!answer.trim() || busy}
              onClick={submit}
            >
              {busy ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}{' '}
              {busy ? 'Evaluating…' : 'Submit answer'}
            </button>
          </div>
        </section>
      ) : (
        <>
          <div className="section-head" style={{ margin: 0 }}>
            <div>
              <span className="eyebrow">A CLEARER PICTURE</span>
              <h2>Your answer, from three perspectives.</h2>
            </div>
          </div>
          <EvaluationCards evaluation={evaluation} />
          <div style={{ textAlign: 'right' }}>
            <button
              className="btn btn-primary"
              disabled={busy}
              onClick={async () => {
                if (question.order >= interview.total) {
                  router.push(`/interview/${id}/report`);
                  return;
                }
                setBusy(true);
                try {
                  const next = await api.next(id);
                  if (!next) {
                    router.push(`/interview/${id}/report`);
                    return;
                  }
                  setReason(next.reason);
                  setEvaluation(null);
                  const updated = await api.get(id);
                  setInterview(updated);
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? <Loader2 className="animate-spin" size={15} /> : null}
              {question.order >= interview.total
                ? 'See my adaptive report'
                : 'Next question'}
              <ArrowRight size={15} />
            </button>
          </div>
        </>
      )}
      {confirm && (
        <div className="dialog-backdrop">
          <div
            className="card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="end-title"
          >
            <div className="section-head">
              <h2 id="end-title">Wrap up your session?</h2>
              <button
                className="btn btn-ghost"
                aria-label="Close dialog"
                onClick={() => setConfirm(false)}
              >
                <X size={17} />
              </button>
            </div>
            <p className="muted">
              Your submitted answers will be saved. Your report will reflect the
              questions you’ve completed so far.
            </p>
            <div
              className="flex-row"
              style={{ justifyContent: 'flex-end', marginTop: 25 }}
            >
              <button
                ref={cancelRef}
                className="btn btn-outline"
                onClick={() => setConfirm(false)}
              >
                Keep practicing
              </button>
              <button
                className="btn btn-primary"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    recognition.current?.stop();
                    await api.end(id);
                    router.push(`/interview/${id}/report`);
                  } catch (e) {
                    setError((e as Error).message);
                    setConfirm(false);
                    setBusy(false);
                  }
                }}
              >
                End & view report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
