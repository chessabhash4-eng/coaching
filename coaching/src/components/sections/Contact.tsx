import { useEffect, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Mail, MapPin, Navigation, Phone, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import { telHref, waHref } from '../../lib/api';
import { NotebookPage, PageHeader, Scribble } from '../ui/Ink';
import { WhatsappIcon } from '../ui/Brand';
import Socials from '../Socials';

type Form = { name: string; phone: string; email: string; course: string; message: string };
const empty: Form = { name: '', phone: '', email: '', course: '', message: '' };

export default function Contact() {
  const { data } = useSite();
  const s = data.settings;
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    const h = (e: Event) => setForm((f) => ({ ...f, course: (e as CustomEvent<string>).detail }));
    window.addEventListener('rci:enquire', h);
    return () => window.removeEventListener('rci:enquire', h);
  }, []);

  const validate = () => {
    const e: typeof errors = {};
    if (form.name.trim().length < 2) e.name = 'Please write your full name';
    const digits = form.phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    if (!/^[6-9]\d{9}$/.test(digits)) e.phone = 'Enter a valid 10-digit mobile number';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'That email doesn’t look right';
    if (!form.course) e.course = 'Choose a course you’re interested in';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setStatus('sending');
    setServerError('');
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Something went wrong');
      setStatus('done');
      setForm(empty);
    } catch (e) {
      setServerError((e as Error).message);
      setStatus('error');
    }
  };

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const mapSrc = s.map_embed_url || `https://www.google.com/maps?q=${encodeURIComponent(s.address || 'Root Career Institute')}&output=embed`;
  const mapLink = s.map_link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address || 'Root Career Institute')}`;

  return (
    <NotebookPage id="contact" tab="Contact" className="pb-24 pt-20 md:pb-32 md:pt-28">
      <div className="page-inner">
        <PageHeader
          page="07"
          kicker="the last page"
          title="The next chapter is"
          accent="yours to write."
          subtitle="Leave your details and our counsellor will call you back to help pick the right batch. Admissions are open now for 2026–27."
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          {/* form sheet */}
          <div className="paper-card lined relative rounded-md pb-8 pl-14 pr-6 pt-10 sm:pr-10">
            <div className="tape absolute -top-3 right-10 h-7 w-28 rotate-3" />
            <AnimatePresence mode="wait">
              {status === 'done' ? (
                <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex min-h-[420px] flex-col items-start justify-center">
                  <CheckCircle2 className="h-14 w-14 text-gold" strokeWidth={1.5} />
                  <h3 className="mt-4 font-display text-3xl font-[800] text-ink">Noted. We’ll call you soon!</h3>
                  <p className="mt-2 font-hand text-2xl text-ink-2">Your enquiry has been written into our notebook.</p>
                  <Scribble className="mt-2 h-3 w-56" show />
                  <button onClick={() => setStatus('idle')} className="mt-8 rounded-full border border-ink/20 px-5 py-2.5 text-sm font-bold text-ink hover:border-ink">
                    Send another enquiry
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  <Field label="Student name" error={errors.name}>
                    <input className="input-line" value={form.name} onChange={set('name')} placeholder="e.g. Aarav Sharma" autoComplete="name" />
                  </Field>
                  <Field label="Mobile number" error={errors.phone}>
                    <input className="input-line" value={form.phone} onChange={set('phone')} placeholder="10-digit mobile" inputMode="tel" autoComplete="tel" />
                  </Field>
                  <Field label="Email (optional)" error={errors.email}>
                    <input className="input-line" value={form.email} onChange={set('email')} placeholder="you@example.com" type="email" autoComplete="email" />
                  </Field>
                  <Field label="Interested in" error={errors.course}>
                    <select className="input-line cursor-pointer" value={form.course} onChange={set('course')}>
                      <option value="">Select a course…</option>
                      {data.courses.map((c) => (
                        <option key={c.id} value={c.title}>
                          {c.title} ({c.class_level})
                        </option>
                      ))}
                      <option value="Not sure yet — need counselling">Not sure yet — need counselling</option>
                    </select>
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Message (optional)">
                      <textarea className="input-line min-h-[96px] resize-y" value={form.message} onChange={set('message')} placeholder="Class, preferred batch timing, questions…" />
                    </Field>
                  </div>
                  {status === 'error' && <p className="sm:col-span-2 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{serverError}</p>}
                  <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-bold text-paper shadow-lg shadow-ink/20 transition hover:-translate-y-0.5 hover:bg-gold hover:text-ink disabled:opacity-60"
                    >
                      {status === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      {status === 'sending' ? 'Sending…' : 'Request a call back'}
                    </button>
                    <span className="font-hand text-xl text-ink-3">we reply within a working day</span>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* info + map */}
          <div className="flex flex-col gap-6">
            <div className="leather relative overflow-hidden rounded-md p-7 text-paper shadow-[0_24px_50px_-24px_rgba(15,22,64,0.7)]">
              <div className="pointer-events-none absolute inset-2.5 rounded border border-gold/25" />
              <p className="font-hand text-2xl text-gold-2">call us, we’re listening</p>
              {s.phone && (
                <a href={telHref(s.phone)} className="mt-1 block font-display text-3xl font-[800] tracking-tight text-paper hover:text-gold-2 sm:text-4xl">
                  {s.phone}
                </a>
              )}
              {s.alt_phone && (
                <a href={telHref(s.alt_phone)} className="mt-1 block text-sm font-semibold text-gold-soft/80">
                  Alt: {s.alt_phone}
                </a>
              )}
              <div className="mt-5 flex flex-wrap gap-2">
                {s.phone && (
                  <a href={telHref(s.phone)} className="inline-flex items-center gap-2 rounded-full bg-gold-2 px-5 py-2.5 text-sm font-extrabold text-navy">
                    <Phone className="h-4 w-4" /> Call Now
                  </a>
                )}
                {s.whatsapp && (
                  <a href={waHref(s.whatsapp)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-5 py-2.5 text-sm font-bold text-gold-soft">
                    <WhatsappIcon size={16} /> WhatsApp
                  </a>
                )}
              </div>
              <ul className="mt-6 space-y-3 text-sm text-gold-soft/85">
                {s.email && (
                  <li className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-2" />
                    <a href={`mailto:${s.email}`} className="hover:text-paper">{s.email}</a>
                  </li>
                )}
                {s.address && (
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-2" /> {s.address}
                  </li>
                )}
                {s.hours && (
                  <li className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-2" /> {s.hours}
                  </li>
                )}
              </ul>
              <div className="mt-6">
                <Socials dark />
              </div>
            </div>

            <div className="paper-card relative rotate-[0.8deg] rounded-sm bg-card p-3 pb-4">
              <div className="tape absolute -top-3 left-8 z-10 h-6 w-20 -rotate-6" />
              <div className="aspect-[16/10] overflow-hidden rounded-[2px] bg-paper-2">
                <iframe title="Root Career Institute on Google Maps" src={mapSrc} className="h-full w-full border-0 grayscale-[0.3]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
              </div>
              <div className="flex items-center justify-between px-1 pt-3">
                <span className="font-hand text-xl text-ink">find us here →</span>
                <a href={mapLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-bold text-paper hover:bg-gold hover:text-ink">
                  <Navigation className="h-3.5 w-3.5" /> Get directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </NotebookPage>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-hand text-xl text-gold">{label}</span>
      {children}
      <AnimatePresence>
        {error && (
          <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1 block text-xs font-bold text-red-600">
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  );
}
