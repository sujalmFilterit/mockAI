'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  FileText,
  ArrowRight,
  Plus,
  X,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Heading, useBootstrap, ErrorState } from '@/components/common';
import { api } from '@/lib/services/api';
import { validateResume } from '@/lib/validation';
import type { CandidateProfile } from '@/types';
export default function Resume() {
  const router = useRouter();
  const { data } = useBootstrap();
  const [parsed, setParsed] = useState<CandidateProfile | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [drag, setDrag] = useState(false);
  const [skill, setSkill] = useState('');
  const [tool, setTool] = useState('');
  const profile = parsed ?? data?.profile;
  async function upload(file?: File) {
    if (!file) return;
    setError('');
    const invalid = validateResume(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    setProgress(10);
    const timer = setInterval(
      () => setProgress((p) => Math.min(90, p + 12)),
      180,
    );
    try {
      const result = await api.parse(file);
      setProgress(100);
      setParsed(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      clearInterval(timer);
      setBusy(false);
    }
  }
  function edit(update: Partial<CandidateProfile>) {
    if (profile) setParsed({ ...profile, ...update });
  }
  return (
    <>
      <Heading
        eyebrow="RESUME INGESTION"
        title="Your experience. Our starting point."
        description="Build a candidate profile so every question reflects the work you’ve actually done."
      />
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="stack">
          <div className="card">
            <h2>Upload your resume</h2>
            <p className="small muted" style={{ margin: '8px 0 22px' }}>
              A little context makes a big difference.
            </p>
            <div
              className={`upload-zone ${drag ? 'drag' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                if (!busy) void upload(e.dataTransfer.files[0]);
              }}
            >
              <UploadCloud
                size={35}
                color="#2563eb"
                style={{ margin: '0 auto 15px' }}
              />
              <h3>
                {busy
                  ? 'Preparing your demo profile…'
                  : 'Drop your resume here'}
              </h3>
              <p className="small muted" style={{ margin: '8px 0' }}>
                or click to browse your files
              </p>
              <span className="badge gray">PDF or DOCX · Maximum 5 MB</span>
              <input
                aria-label="Upload PDF or DOCX resume"
                type="file"
                accept=".pdf,.docx"
                disabled={busy}
                onChange={(e) => void upload(e.target.files?.[0])}
              />
            </div>
            {progress > 0 && (
              <div style={{ marginTop: 15 }}>
                <div
                  className="progress"
                  role="progressbar"
                  aria-label="Resume processing"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <span style={{ width: `${progress}%` }} />
                </div>
                <p
                  className="small muted"
                  role="status"
                  style={{ marginTop: 8 }}
                >
                  {progress === 100
                    ? 'Demo profile ready to review'
                    : `Uploading and preparing… ${progress}%`}
                </p>
              </div>
            )}
            {error && <ErrorState message={error} />}
          </div>
          <div className="notice">
            <strong>Demo parser is active</strong>
            <p style={{ marginTop: 6 }}>
              Uploads are validated, then a realistic sample profile is
              returned. The current prototype does not extract your document’s
              text. Edit the sample to match your experience.
            </p>
          </div>
        </div>
        <div className="card">
          <div className="section-head">
            <div className="flex-row">
              <FileText size={20} color="#2563eb" />
              <h2>Candidate profile</h2>
            </div>
            {profile && (
              <span className="badge green">
                <CheckCircle2 size={11} /> Ready to review
              </span>
            )}
          </div>
          {!profile ? (
            <div style={{ textAlign: 'center', padding: '65px 15px' }}>
              <FileText
                size={35}
                color="#cbd5e1"
                style={{ margin: '0 auto 15px' }}
              />
              <p className="muted">
                Your skills and projects will appear here.
              </p>
            </div>
          ) : (
            <div className="stack">
              <section>
                <label>Skills</label>
                <div>
                  {profile.skills.map((s) => (
                    <span className="chip" key={s}>
                      {s}
                      <button
                        aria-label={`Remove ${s}`}
                        onClick={() =>
                          edit({
                            skills: profile.skills.filter((x) => x !== s),
                          })
                        }
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex-row" style={{ marginTop: 10 }}>
                  <input
                    aria-label="Add skill"
                    placeholder="Add a skill"
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                  />
                  <button
                    className="btn btn-outline"
                    aria-label="Add skill"
                    onClick={() => {
                      if (
                        skill.trim() &&
                        !profile.skills.includes(skill.trim())
                      ) {
                        edit({ skills: [...profile.skills, skill.trim()] });
                        setSkill('');
                      }
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </section>
              <section>
                <label>Tools</label>
                <div>
                  {profile.tools.map((s) => (
                    <span className="chip" key={s}>
                      {s}
                      <button
                        aria-label={`Remove ${s}`}
                        onClick={() =>
                          edit({ tools: profile.tools.filter((x) => x !== s) })
                        }
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex-row" style={{ marginTop: 10 }}>
                  <input
                    aria-label="Add tool"
                    placeholder="Add a tool"
                    value={tool}
                    onChange={(e) => setTool(e.target.value)}
                  />
                  <button
                    className="btn btn-outline"
                    aria-label="Add tool"
                    onClick={() => {
                      if (tool.trim() && !profile.tools.includes(tool.trim())) {
                        edit({ tools: [...profile.tools, tool.trim()] });
                        setTool('');
                      }
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </section>
              <section>
                <label>Projects</label>
                {profile.projects.map((p, i) => (
                  <div
                    className="stack"
                    style={{
                      gap: 8,
                      padding: 13,
                      background: '#f8fafc',
                      borderRadius: 10,
                      marginBottom: 10,
                    }}
                    key={i}
                  >
                    <div className="flex-row">
                      <input
                        aria-label={`Project ${i + 1} name`}
                        value={p.name}
                        onChange={(e) =>
                          edit({
                            projects: profile.projects.map((v, j) =>
                              i === j ? { ...v, name: e.target.value } : v,
                            ),
                          })
                        }
                      />
                      <button
                        className="btn btn-ghost"
                        aria-label={`Remove project ${i + 1}`}
                        onClick={() =>
                          edit({
                            projects: profile.projects.filter(
                              (_, j) => j !== i,
                            ),
                          })
                        }
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <textarea
                      aria-label={`Project ${i + 1} description`}
                      rows={2}
                      value={p.description}
                      onChange={(e) =>
                        edit({
                          projects: profile.projects.map((v, j) =>
                            i === j ? { ...v, description: e.target.value } : v,
                          ),
                        })
                      }
                    />
                  </div>
                ))}
                <button
                  className="btn btn-outline"
                  onClick={() =>
                    edit({
                      projects: [
                        ...profile.projects,
                        { name: 'New project', description: '' },
                      ],
                    })
                  }
                >
                  <Plus size={14} /> Add project
                </button>
              </section>
              <button
                className="btn btn-primary"
                disabled={
                  saving ||
                  !profile.skills.length ||
                  profile.projects.some((p) => !p.name.trim())
                }
                onClick={async () => {
                  setSaving(true);
                  try {
                    await api.saveProfile(profile);
                    router.push('/interview/setup');
                  } catch (e) {
                    setError((e as Error).message);
                    setSaving(false);
                  }
                }}
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : null}
                Confirm & continue <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
