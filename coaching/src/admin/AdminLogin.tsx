import { useState, type FormEvent } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Loader2, Lock, ArrowLeft } from 'lucide-react';
import supabase from '../lib/supabase';
import { signInWithGoogle } from '../lib/googleAuth';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLogin() {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/admin" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr('Enter a valid email address');
    if (password.length < 6) return setErr('Password must be at least 6 characters');
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setErr(error.message);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-2 hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Back to website
        </Link>
        <div className="paper-card lined relative rounded-md pb-8 pl-14 pr-8 pt-10">
          <div className="tape absolute -top-3 left-1/2 h-7 w-28 -translate-x-1/2 -rotate-2" />
          <img src="/uploads/logo.png" alt="Root Career Institute" className="h-16 w-16" />
          <p className="mt-4 font-hand text-2xl text-gold">staff room</p>
          <h1 className="font-display text-3xl font-[800] text-ink">Admin sign in</h1>
          <p className="mt-1 text-sm text-ink-2">Manage courses, results, faculty, reviews and enquiries.</p>

          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-ink-3">Email</span>
              <input className="admin-input mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="admin@example.com" />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-ink-3">Password</span>
              <input className="admin-input mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="••••••••" />
            </label>
            {err && <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{err}</p>}
            <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-bold text-paper hover:bg-gold hover:text-ink disabled:opacity-60">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />} Sign in
            </button>
          </form>
          <div className="my-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-ink-3">
            <span className="h-px flex-1 bg-ink/10" /> or <span className="h-px flex-1 bg-ink/10" />
          </div>
          <button
            type="button"
            onClick={() => signInWithGoogle('Root Career Institute Admin')}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-ink/15 bg-white py-3 text-sm font-bold text-ink hover:border-ink"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
              <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
            </svg>
            Continue with Google
          </button>
          <p className="mt-5 text-xs leading-relaxed text-ink-3">Only email addresses on the admin list can make changes.</p>
        </div>
      </div>
    </div>
  );
}
