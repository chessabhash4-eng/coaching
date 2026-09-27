import { useEffect, useState } from 'react';
import { Loader2, Save, Trash2, Plus } from 'lucide-react';
import { type Settings } from '../../lib/api';
import { adminFetch } from '../../lib/adminApi';
import { AdminHeader } from '../AdminLayout';
import { FieldInput, type FieldDef } from '../CrudPage';

const GROUPS: { title: string; note: string; fields: FieldDef[] }[] = [
  {
    title: 'Hero & brand',
    note: 'Text on the notebook hero and across the site.',
    fields: [
      { name: 'institute_name', label: 'Institute name', required: true },
      { name: 'tagline', label: 'Tagline', placeholder: 'Build Your Career. Shape Your Future.' },
      { name: 'admissions_text', label: 'Admissions badge', placeholder: 'Admissions Open Now' },
      { name: 'hero_subline', label: 'Hero line (before NEET • JEE • Foundation)', placeholder: 'Expert Coaching for' },
    ],
  },
  {
    title: 'Contact details',
    note: 'Used for the Call Now buttons, contact page and footer.',
    fields: [
      { name: 'phone', label: 'Primary phone', required: true, placeholder: '+91 98765 43210' },
      { name: 'alt_phone', label: 'Alternate phone' },
      { name: 'whatsapp', label: 'WhatsApp number (with country code)', placeholder: '919876543210' },
      { name: 'email', label: 'Email' },
      { name: 'address', label: 'Address', full: true },
      { name: 'hours', label: 'Office hours', full: true },
    ],
  },
  {
    title: 'Google Maps',
    note: 'In Google Maps: Share → Embed a map → copy only the src="…" URL.',
    fields: [
      { name: 'map_embed_url', label: 'Map embed URL', full: true },
      { name: 'map_link', label: 'Directions link', full: true },
    ],
  },
  {
    title: 'Social media',
    note: 'Leave blank to hide an icon.',
    fields: [
      { name: 'instagram', label: 'Instagram URL' },
      { name: 'facebook', label: 'Facebook URL' },
      { name: 'youtube', label: 'YouTube URL' },
      { name: 'telegram', label: 'Telegram URL' },
    ],
  },
];

export default function SettingsPage() {
  const [s, setS] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [admins, setAdmins] = useState<{ id: number; email: string }[]>([]);
  const [newAdmin, setNewAdmin] = useState('');
  const [adminBusy, setAdminBusy] = useState(false);

  const loadAdmins = () => adminFetch<{ id: number; email: string }[]>('/api/content?resource=admins').then(setAdmins).catch(() => {});

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then(setS)
      .catch(() => setMsg({ ok: false, t: 'Could not load settings' }))
      .finally(() => setLoading(false));
    loadAdmins();
  }, []);

  const save = async () => {
    if (!s.institute_name?.trim() || !s.phone?.trim()) return setMsg({ ok: false, t: 'Institute name and phone are required' });
    setSaving(true);
    setMsg(null);
    try {
      const d = await adminFetch<Settings>('/api/settings', 'PUT', s);
      setS(d);
      setMsg({ ok: true, t: 'Saved — the website is updated.' });
    } catch (e) {
      setMsg({ ok: false, t: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const addAdmin = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAdmin)) return alert('Enter a valid email');
    setAdminBusy(true);
    try {
      await adminFetch('/api/content?resource=admins', 'POST', { email: newAdmin });
      setNewAdmin('');
      await loadAdmins();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setAdminBusy(false);
    }
  };
  const removeAdmin = async (id: number) => {
    if (!confirm('Remove this admin?')) return;
    try {
      await adminFetch('/api/content?resource=admins', 'DELETE', { id });
      await loadAdmins();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  return (
    <div>
      <AdminHeader
        kicker="page 01"
        title="Hero & contact info"
        desc="Institute name, tagline, phone numbers, location and social links."
        action={
          <button onClick={save} disabled={saving || loading} className="inline-flex items-center gap-2 self-start rounded-full bg-ink px-6 py-2.5 text-sm font-bold text-paper hover:bg-gold hover:text-ink disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
          </button>
        }
      />
      {msg && <p className={`mb-6 rounded-md px-4 py-3 text-sm font-semibold ${msg.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>{msg.t}</p>}
      {loading ? (
        <div className="h-96 animate-pulse rounded-lg bg-paper-2" />
      ) : (
        <div className="space-y-6">
          {GROUPS.map((g) => (
            <section key={g.title} className="paper-card rounded-lg bg-card p-6">
              <h2 className="font-display text-xl font-[800]">{g.title}</h2>
              <p className="text-sm text-ink-3">{g.note}</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {g.fields.map((f) => (
                  <FieldInput key={f.name} f={f} value={(s as Record<string, unknown>)[f.name]} onChange={(v) => setS((p) => ({ ...p, [f.name]: v as string }))} />
                ))}
              </div>
              {g.title === 'Google Maps' && s.map_embed_url && (
                <iframe title="Map preview" src={s.map_embed_url} className="mt-4 aspect-[16/7] w-full rounded-md border-0" loading="lazy" />
              )}
            </section>
          ))}

          <section className="paper-card rounded-lg bg-card p-6">
            <h2 className="font-display text-xl font-[800]">Admin access</h2>
            <p className="text-sm text-ink-3">People who can sign in to this panel (email/password or Google with the same email).</p>
            <ul className="mt-4 divide-y divide-ink/5">
              {admins.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-2 text-sm font-semibold">
                  {a.email}
                  <button onClick={() => removeAdmin(a.id)} className="flex h-8 w-8 items-center justify-center rounded-full text-red-600 hover:bg-red-50" aria-label="Remove admin">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2">
              <input className="admin-input" placeholder="new.admin@email.com" value={newAdmin} onChange={(e) => setNewAdmin(e.target.value)} />
              <button onClick={addAdmin} disabled={adminBusy} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-bold text-paper disabled:opacity-60">
                {adminBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
