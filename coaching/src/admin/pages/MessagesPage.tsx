import { useCallback, useEffect, useMemo, useState } from 'react';
import { Phone, Mail, Trash2, Loader2, Search } from 'lucide-react';
import { telHref, waHref, type Message } from '../../lib/api';
import { adminFetch } from '../../lib/adminApi';
import { AdminHeader } from '../AdminLayout';
import { WhatsappIcon } from '../../components/ui/Brand';

const STATUSES = ['new', 'contacted', 'enrolled', 'closed'];
const COLORS: Record<string, string> = {
  new: 'bg-gold-soft text-ink',
  contacted: 'bg-blue-50 text-blue-800',
  enrolled: 'bg-emerald-50 text-emerald-800',
  closed: 'bg-ink/5 text-ink-3',
};

export default function MessagesPage() {
  const [rows, setRows] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setError('');
      setRows(await adminFetch<Message[]>('/api/messages'));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const list = useMemo(
    () =>
      rows.filter(
        (r) =>
          (filter === 'all' || r.status === filter) &&
          (!q || [r.name, r.phone, r.email, r.course, r.message].join(' ').toLowerCase().includes(q.toLowerCase()))
      ),
    [rows, filter, q]
  );

  const setStatus = async (id: number, status: string) => {
    setBusy(id);
    try {
      await adminFetch('/api/messages', 'PUT', { id, status });
      await load();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(null);
    }
  };
  const remove = async (id: number) => {
    if (!confirm('Delete this enquiry?')) return;
    setBusy(id);
    try {
      await adminFetch('/api/messages', 'DELETE', { id });
      await load();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <AdminHeader kicker="page 07" title="Enquiries" desc="Messages submitted through the contact form on the last page of the website." />
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {['all', ...STATUSES].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-4 py-1.5 text-xs font-bold capitalize ${filter === s ? 'bg-ink text-paper' : 'border border-ink/15 bg-white'}`}>
              {s} {s !== 'all' && <span className="opacity-60">({rows.filter((r) => r.status === s).length})</span>}
            </button>
          ))}
        </div>
        <div className="relative md:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <input className="admin-input pl-9" placeholder="Search enquiries…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      {error && <p className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
      {loading ? (
        <div className="h-40 animate-pulse rounded-lg bg-paper-2" />
      ) : list.length === 0 ? (
        <div className="paper-card rounded-lg p-10 text-center font-hand text-2xl text-ink-2">Nothing here yet.</div>
      ) : (
        <div className="space-y-3">
          {list.map((m) => (
            <div key={m.id} className="paper-card rounded-lg bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-[800]">{m.name}</p>
                  <p className="text-sm text-ink-2">{m.course || 'General enquiry'}</p>
                  <p className="text-xs text-ink-3">{new Date(m.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
                <div className="flex items-center gap-2">
                  {busy === m.id && <Loader2 className="h-4 w-4 animate-spin text-gold" />}
                  <select value={m.status} onChange={(e) => setStatus(m.id, e.target.value)} className={`rounded-full border-0 px-3 py-1.5 text-xs font-extrabold capitalize ${COLORS[m.status] || ''}`}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button onClick={() => remove(m.id)} className="flex h-8 w-8 items-center justify-center rounded-full text-red-600 hover:bg-red-50" aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {m.message && <p className="mt-3 rounded-md bg-paper px-3 py-2 font-hand text-xl leading-snug text-ink">{m.message}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={telHref(m.phone)} className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-bold text-paper"><Phone className="h-3.5 w-3.5" /> {m.phone}</a>
                <a href={waHref(m.phone.length === 10 ? '91' + m.phone : m.phone)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-bold"><WhatsappIcon size={14} /> WhatsApp</a>
                {m.email && <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-bold"><Mail className="h-3.5 w-3.5" /> {m.email}</a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
