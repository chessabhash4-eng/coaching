import { useEffect, useState } from 'react';
import { Navigate, NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, Settings2, BookOpen, Sparkles, Trophy, Users, MessageSquareQuote, Inbox, LogOut, ExternalLink, Menu, X, Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../lib/supabase';
import { adminFetch } from '../lib/adminApi';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/hero', label: 'Hero & Contact Info', icon: Settings2 },
  { to: '/admin/courses', label: 'Courses', icon: BookOpen },
  { to: '/admin/why', label: 'Why Root', icon: Sparkles },
  { to: '/admin/results', label: 'Results', icon: Trophy },
  { to: '/admin/faculty', label: 'Faculty', icon: Users },
  { to: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { to: '/admin/messages', label: 'Enquiries', icon: Inbox },
];

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const [check, setCheck] = useState<'loading' | 'ok' | 'denied'>('loading');
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  useEffect(() => setOpen(false), [loc.pathname]);

  useEffect(() => {
    if (!user) return;
    setCheck('loading');
    adminFetch<{ isAdmin: boolean }>('/api/me')
      .then((r) => setCheck(r.isAdmin ? 'ok' : 'denied'))
      .catch(() => setCheck('denied'));
  }, [user]);

  if (loading) return <Center><Loader2 className="h-6 w-6 animate-spin text-gold" /></Center>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (check === 'loading') return <Center><Loader2 className="h-6 w-6 animate-spin text-gold" /><span className="font-hand text-2xl">checking your pass…</span></Center>;
  if (check === 'denied')
    return (
      <Center>
        <div className="paper-card max-w-md rounded-md p-8 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-gold" />
          <h1 className="mt-3 font-display text-2xl font-[800]">Not on the admin list</h1>
          <p className="mt-2 text-sm text-ink-2">{user.email} is signed in but doesn’t have admin access. Ask an existing admin to add your email.</p>
          <div className="mt-5 flex justify-center gap-2">
            <button onClick={() => supabase.auth.signOut()} className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-paper">Sign out</button>
            <Link to="/" className="rounded-full border border-ink/20 px-5 py-2.5 text-sm font-bold">Website</Link>
          </div>
        </div>
      </Center>
    );

  const side = (
    <div className="flex h-full flex-col">
      <Link to="/admin" className="flex items-center gap-3 px-2">
        <img src="/uploads/logo.png" alt="" className="h-10 w-10" />
        <div className="leading-tight">
          <p className="font-display text-base font-[800] text-paper">Root Career</p>
          <p className="font-hand text-lg text-gold-2">admin notebook</p>
        </div>
      </Link>
      <nav className="mt-8 flex-1 space-y-1">
        {NAV.map(({ to, label, icon: I, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-gold-2 text-navy' : 'text-gold-soft/75 hover:bg-white/5 hover:text-paper'}`
            }
          >
            <I className="h-4 w-4" /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-1 border-t border-gold/15 pt-4">
        <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-gold-soft/75 hover:text-paper">
          <ExternalLink className="h-4 w-4" /> View website
        </a>
        <button onClick={() => supabase.auth.signOut()} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-gold-soft/75 hover:text-paper">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
        <p className="truncate px-3 pt-2 text-[11px] text-gold-soft/45">{user.email}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="leather fixed inset-y-0 left-0 z-30 hidden w-64 p-5 lg:block">{side}</aside>
      <header className="leather sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:hidden">
        <Link to="/admin" className="flex items-center gap-2">
          <img src="/uploads/logo.png" alt="" className="h-8 w-8" />
          <span className="font-display font-[800] text-paper">Admin</span>
        </Link>
        <button onClick={() => setOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-paper" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-navy/50" onClick={() => setOpen(false)} />
            <motion.aside className="leather absolute inset-y-0 left-0 w-72 p-5" initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: 'spring', stiffness: 300, damping: 32 }}>
              <button onClick={() => setOpen(false)} className="absolute right-4 top-4 text-paper" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
              {side}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <Outlet />
      </main>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-ink-2">{children}</div>;
}

export function AdminHeader({ kicker, title, desc, action }: { kicker: string; title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="font-hand text-2xl text-gold">{kicker}</p>
        <h1 className="font-display text-3xl font-[800] tracking-tight text-ink md:text-4xl">{title}</h1>
        {desc && <p className="mt-1 max-w-2xl text-sm text-ink-2">{desc}</p>}
      </div>
      {action}
    </div>
  );
}
