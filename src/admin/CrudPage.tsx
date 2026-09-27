import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Loader2, Upload, Save } from 'lucide-react';
import { adminFetch } from '../lib/adminApi';
import { AdminHeader } from './AdminLayout';
import { ICONS } from '../components/ui/Icon';

export type FieldDef = {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'image' | 'icon';
  options?: string[];
  required?: boolean;
  placeholder?: string;
  help?: string;
  full?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any> & { id: number };

export default function CrudPage({
  resource,
  kicker,
  title,
  desc,
  fields,
  defaults,
  preview,
  singular,
  compact = false,
}: {
  resource: string;
  kicker: string;
  title: string;
  desc?: string;
  fields: FieldDef[];
  defaults: Record<string, unknown>;
  preview: (r: Row) => ReactNode;
  singular: string;
  compact?: boolean;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await adminFetch<Row[]>(`/api/content?resource=${resource}`);
      setRows(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const openNew = () => {
    const nextOrder = rows.reduce((m, r) => Math.max(m, Number(r.sort_order) || 0), 0) + 1;
    setEditing({ ...defaults, ...(fields.some((f) => f.name === 'sort_order') ? { sort_order: nextOrder } : {}) });
    setFormErr('');
  };

  const save = async () => {
    if (!editing) return;
    for (const f of fields) {
      const v = editing[f.name];
      if (f.required && (v === undefined || v === null || String(v).trim() === '')) {
        setFormErr(`${f.label} is required`);
        return;
      }
    }
    setSaving(true);
    setFormErr('');
    try {
      const body: Record<string, unknown> = {};
      fields.forEach((f) => {
        let v = editing[f.name];
        if (f.type === 'number') v = v === '' || v === undefined || v === null ? 0 : Number(v);
        if (f.type === 'boolean') v = !!v;
        body[f.name] = v;
      });
      if (editing.id) await adminFetch(`/api/content?resource=${resource}`, 'PUT', { id: editing.id, ...body });
      else await adminFetch(`/api/content?resource=${resource}`, 'POST', body);
      setEditing(null);
      setToast(editing.id ? 'Changes saved' : `${singular} added`);
      await load();
    } catch (e) {
      setFormErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (r: Row) => {
    if (!confirm(`Delete this ${singular.toLowerCase()}? This cannot be undone.`)) return;
    setBusyId(r.id);
    try {
      await adminFetch(`/api/content?resource=${resource}`, 'DELETE', { id: r.id });
      setToast(`${singular} deleted`);
      await load();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <AdminHeader
        kicker={kicker}
        title={title}
        desc={desc}
        action={
          <button onClick={openNew} className="inline-flex items-center gap-2 self-start rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-paper hover:bg-gold hover:text-ink">
            <Plus className="h-4 w-4" /> Add {singular.toLowerCase()}
          </button>
        }
      />

      {error && (
        <div className="mb-6 flex items-center justify-between rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
          <button onClick={load} className="underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className={`grid gap-4 ${compact ? '' : 'sm:grid-cols-2 xl:grid-cols-3'}`}>
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-lg bg-paper-2" />)}
        </div>
      ) : rows.length === 0 ? (
        <div className="paper-card rounded-lg p-10 text-center">
          <p className="font-hand text-2xl text-ink-2">This page is still blank.</p>
          <button onClick={openNew} className="mt-4 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-paper">Add the first {singular.toLowerCase()}</button>
        </div>
      ) : (
        <div className={`grid gap-4 ${compact ? '' : 'sm:grid-cols-2 xl:grid-cols-3'}`}>
          {rows.map((r) => (
            <div key={r.id} className="paper-card group relative flex flex-col rounded-lg bg-card p-5">
              {'sort_order' in r && <span className="absolute right-4 top-4 rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-bold text-ink-3">#{r.sort_order}</span>}
              <div className="flex-1">{preview(r)}</div>
              <div className="mt-4 flex gap-2 border-t border-ink/5 pt-3">
                <button onClick={() => { setEditing({ ...r }); setFormErr(''); }} className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-bold hover:border-ink">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button onClick={() => remove(r)} disabled={busyId === r.id} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50">
                  {busyId === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />} Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-navy/50 backdrop-blur-sm" onClick={() => !saving && setEditing(null)} />
            <motion.div
              className="relative max-h-[92svh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-paper p-6 shadow-2xl sm:rounded-2xl sm:p-8"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
            >
              <button onClick={() => setEditing(null)} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full hover:bg-ink/5" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
              <p className="font-hand text-xl text-gold">{editing.id ? 'editing' : 'new entry'}</p>
              <h2 className="font-display text-2xl font-[800]">{editing.id ? `Edit ${singular.toLowerCase()}` : `Add ${singular.toLowerCase()}`}</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {fields.map((f) => (
                  <FieldInput key={f.name} f={f} value={editing[f.name]} onChange={(v) => setEditing((e) => ({ ...(e || {}), [f.name]: v }))} />
                ))}
              </div>
              {formErr && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{formErr}</p>}
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => setEditing(null)} className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-bold">Cancel</button>
                <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-bold text-paper hover:bg-gold hover:text-ink disabled:opacity-60">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-paper shadow-xl">
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

async function resizeToBase64(file: File): Promise<{ base64: string; type: string }> {
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = URL.createObjectURL(file);
  });
  const max = 900;
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement('canvas');
  c.width = Math.round(img.width * scale);
  c.height = Math.round(img.height * scale);
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
  const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const url = c.toDataURL(type, 0.85);
  URL.revokeObjectURL(img.src);
  return { base64: url.split(',')[1], type };
}

export function FieldInput({ f, value, onChange }: { f: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  const [uploading, setUploading] = useState(false);
  const [upErr, setUpErr] = useState('');
  const full = f.full || f.type === 'textarea' || f.type === 'image' || f.type === 'icon';
  const label = (
    <span className="text-xs font-bold uppercase tracking-[0.15em] text-ink-3">
      {f.label} {f.required && <span className="text-red-500">*</span>}
    </span>
  );

  const upload = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return setUpErr('Please choose an image');
    if (file.size > 8 * 1024 * 1024) return setUpErr('Image must be under 8 MB');
    setUploading(true);
    setUpErr('');
    try {
      const { base64, type } = await resizeToBase64(file);
      const r = await adminFetch<{ url: string }>('/api/upload', 'POST', { fileName: file.name, fileBase64: base64, contentType: type });
      onChange(r.url);
    } catch (e) {
      setUpErr((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <label className={`block ${full ? 'sm:col-span-2' : ''}`}>
      {label}
      {f.type === 'textarea' ? (
        <textarea className="admin-input mt-1 min-h-[110px]" value={String(value ?? '')} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : f.type === 'boolean' ? (
        <button type="button" onClick={() => onChange(!value)} className={`mt-1 flex h-[42px] w-full items-center gap-3 rounded-[10px] border px-3 text-sm font-semibold ${value ? 'border-gold bg-gold-soft' : 'border-ink/15 bg-white'}`}>
          <span className={`relative h-5 w-9 rounded-full transition ${value ? 'bg-gold' : 'bg-ink/20'}`}>
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${value ? 'left-[18px]' : 'left-0.5'}`} />
          </span>
          {value ? 'Yes' : 'No'}
        </button>
      ) : f.type === 'select' ? (
        <select className="admin-input mt-1" value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select…</option>
          {f.options?.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : f.type === 'icon' ? (
        <div className="mt-1 flex flex-wrap gap-2">
          {Object.entries(ICONS).map(([k, I]) => (
            <button type="button" key={k} onClick={() => onChange(k)} title={k} className={`flex h-10 w-10 items-center justify-center rounded-lg border ${value === k ? 'border-gold bg-gold-soft' : 'border-ink/10 bg-white hover:border-ink/40'}`}>
              <I className="h-5 w-5" strokeWidth={1.7} />
            </button>
          ))}
        </div>
      ) : f.type === 'image' ? (
        <div className="mt-1 flex items-center gap-3">
          <div className="h-20 w-16 shrink-0 overflow-hidden rounded-md border border-ink/10 bg-paper-2">
            {value ? <img src={String(value)} alt="" className="h-full w-full object-cover" /> : null}
          </div>
          <div className="flex-1 space-y-2">
            <input className="admin-input" value={String(value ?? '')} placeholder="Paste an image URL or upload" onChange={(e) => onChange(e.target.value)} />
            <span className="relative inline-flex cursor-pointer items-center gap-2 rounded-full border border-ink/15 bg-white px-3 py-1.5 text-xs font-bold hover:border-ink">
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} {uploading ? 'Uploading…' : 'Upload image'}
              <input type="file" accept="image/*" className="absolute inset-0 cursor-pointer opacity-0" onChange={(e) => upload(e.target.files?.[0])} disabled={uploading} />
            </span>
            {upErr && <p className="text-xs font-semibold text-red-600">{upErr}</p>}
          </div>
        </div>
      ) : (
        <input
          className="admin-input mt-1"
          type={f.type === 'number' ? 'number' : 'text'}
          step="any"
          value={value === null || value === undefined ? '' : String(value)}
          placeholder={f.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {f.help && <span className="mt-1 block text-[11px] text-ink-3">{f.help}</span>}
    </label>
  );
}
