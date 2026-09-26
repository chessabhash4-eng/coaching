import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, Trophy, Users, MessageSquareQuote, Inbox, ArrowRight, Phone } from 'lucide-react';
import { fetchSite, telHref, type Message, type SiteData } from '../../lib/api';
import { adminFetch } from '../../lib/adminApi';
import { AdminHeader } from '../AdminLayout';

export default function Dashboard() {
  const [site, setSite] = useState<SiteData | null>(null);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchSite(), adminFetch<Message[]>('/api/messages')])
      .then(([s, m]) => {
        setSite(s);
        setMsgs(m);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { to: '/admin/courses', label: 'Courses', n: site?.courses.length, icon: BookOpen },
    { to: '/admin/why', label: 'Why Root', n: site?.features.length, icon: Sparkles },
    { to: '/admin/results', label: 'Achievers', n: site?.results.length, icon: Trophy },
    { to: '/admin/faculty', label: 'Faculty', n: site?.faculty.length, icon: Users },
    { to: '/admin/testimonials', label: 'Testimonials', n: site?.testimonials.length, icon: MessageSquareQuote },
    { to: '/admin/messages', label: 'New enquiries', n: msgs.filter((m) => m.status === 'new').length, icon: Inbox },
  ];

  return (
    <div>
      <AdminHeader kicker="good to see you" title="Dashboard" desc="Every section of the website is a page in this notebook. Pick one to edit." />
      {error && <p className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map(({ to, label, n, icon: I }) => (
          <Link key={to} to={to} className="paper-card group rounded-lg bg-card p-5 transition hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-soft"><I className="h-5 w-5" /></span>
              <ArrowRight className="h-4 w-4 text-ink-3 transition group-hover:translate-x-1" />
            </div>
            <div className="mt-4 font-display text-4xl font-[900]">{loading ? '–' : n ?? 0}</div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-ink-3">{label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-2xl font-[800]">Latest enquiries</h2>
        <Link to="/admin/messages" className="text-sm font-bold text-gold">View all →</Link>
      </div>
      <div className="paper-card mt-4 divide-y divide-ink/5 rounded-lg bg-card">
        {loading && <div className="h-32 animate-pulse" />}
        {!loading && msgs.length === 0 && <p className="p-6 font-hand text-xl text-ink-2">No enquiries yet — they’ll appear here.</p>}
        {msgs.slice(0, 5).map((m) => (
          <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-bold">{m.name} <span className="ml-2 rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-extrabold uppercase">{m.status}</span></p>
              <p className="text-sm text-ink-2">{m.course || 'General enquiry'} · {new Date(m.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </div>
            <a href={telHref(m.phone)} className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-bold text-paper"><Phone className="h-3.5 w-3.5" /> {m.phone}</a>
          </div>
        ))}
      </div>
    </div>
  );
}
