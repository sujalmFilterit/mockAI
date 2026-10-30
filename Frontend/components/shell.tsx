'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Mic,
  History,
  Sparkles,
  ArrowUpRight,
  LogOut,
  Menu,
  ChevronRight,
  GraduationCap,
  ShieldCheck,
  X,
} from 'lucide-react';
import { api, request } from '@/lib/services/api';
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Nova home">
      <span className="brand-mark">
        <Sparkles size={20} />
      </span>
      <span>
        nova<span>.</span>
      </span>
    </Link>
  );
}
const links = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/resume', label: 'My resume', icon: FileText },
  { href: '/interview/setup', label: 'Practice interview', icon: Mic },
  { href: '/history', label: 'Interview history', icon: History },
];
export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('Your workspace');
  useEffect(() => {
    api
      .bootstrap()
      .then((data) => setName(data.user.name))
      .catch(() => undefined);
  }, []);
  const current =
    links.find((l) => pathname.startsWith(l.href))?.label ??
    'Practice interview';
  return (
    <>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="flex-row spread">
          <Brand />
          <button
            className="btn btn-ghost mobile-menu"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X size={16} />
          </button>
        </div>
        <div className="brand-caption">INTERVIEW INTELLIGENCE</div>
        <div className="nav-label">WORKSPACE</div>
        <nav aria-label="Main navigation">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={pathname.startsWith(href) ? 'active' : ''}
              aria-current={pathname.startsWith(href) ? 'page' : undefined}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="practice-note">
            <div
              className="flex-row"
              style={{ color: '#2563eb', marginBottom: 8 }}
            >
              <GraduationCap size={17} />
              <strong>A little practice. A big leap.</strong>
            </div>
            <p className="muted">
              Your next opportunity starts with one good conversation.
            </p>
            <Link
              href="/interview/setup"
              className="flex-row"
              style={{ color: '#2563eb', marginTop: 10, fontWeight: 600 }}
            >
              Let’s practice <ArrowUpRight size={13} />
            </Link>
          </div>
          <div
            className="flex-row"
            style={{ borderTop: '1px solid #e2e8f0', paddingTop: 19 }}
          >
            <div className="avatar">
              {name
                .split(' ')
                .map((s) => s[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div style={{ flex: 1 }}>
              <strong className="small">{name}</strong>
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>
                Personal workspace
              </div>
            </div>
            <button
              className="btn-ghost"
              style={{ border: 0, padding: 4 }}
              aria-label="Sign out"
              onClick={async () => {
                await request('auth/logout', {});
                router.push('/');
                router.refresh();
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
      <div className="shell-main">
        <header className="topbar">
          <div className="flex-row">
            <button
              className="btn btn-ghost mobile-menu"
              aria-label="Open navigation"
              onClick={() => setOpen(true)}
            >
              <Menu size={19} />
            </button>
            <div className="breadcrumb">
              Workspace <ChevronRight size={11} />
              <strong>{current}</strong>
            </div>
          </div>
          <div className="flex-row">
            <span className="badge green hide-mobile">
              <span
                style={{
                  width: 5,
                  height: 5,
                  background: '#16a34a',
                  borderRadius: '50%',
                }}
              />{' '}
              AI practice workspace
            </span>
            
          </div>
        </header>
        <main id="main" className="workspace">
          {children}
          <footer className="footer">
            <span>© {new Date().getFullYear()} Nova · By Team Nova Coders</span>
            <span className="flex-row">
              <ShieldCheck size={12} /> Your progress, your potential.
            </span>
          </footer>
        </main>
      </div>
    </>
  );
}
