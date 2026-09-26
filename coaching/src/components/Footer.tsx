import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ArrowUp } from 'lucide-react';
import { useSite } from '../contexts/SiteContext';
import { telHref } from '../lib/api';
import Socials from './Socials';

const QUICK = [
  ['Home', '#home'],
  ['Courses', '#courses'],
  ['Why Root', '#why'],
  ['Results', '#results'],
  ['Faculty', '#faculty'],
  ['Testimonials', '#testimonials'],
  ['Contact', '#contact'],
];

export default function Footer() {
  const { data } = useSite();
  const s = data.settings;
  const year = new Date().getFullYear();
  return (
    <footer className="leather relative overflow-hidden pb-28 pt-16 text-gold-soft md:pb-10">
      {/* stitched edge + elastic band */}
      <div className="pointer-events-none absolute inset-x-4 top-4 h-px border-t-2 border-dashed border-gold/25" />
      <div className="pointer-events-none absolute bottom-0 right-[9%] top-0 hidden w-4 bg-gradient-to-r from-[#070b24] via-[#1d2553] to-[#070b24] shadow-[0_0_12px_rgba(0,0,0,0.5)] md:block" />

      <div className="page-inner relative">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-4">
              <img src="/uploads/logo.png" alt="Root Career Institute" className="h-16 w-16" loading="lazy" />
              <div>
                <p className="gold-foil font-display text-2xl font-[900] uppercase leading-tight">{s.institute_name || 'Root Career Institute'}</p>
                <p className="font-hand text-xl text-gold-soft/80">{s.tagline || 'Build Your Career. Shape Your Future.'}</p>
              </div>
            </div>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-gold-soft/70">
              Expert Coaching for NEET • JEE • Foundation (Class 6th–12th). Live online classes, study material and personal doubt support.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold/40 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-gold-2">
              <span className="pulse-dot h-2 w-2 rounded-full bg-gold-2" /> {s.admissions_text || 'Admissions Open Now'}
            </span>
          </div>

          <div>
            <h4 className="font-hand text-2xl text-gold-2">quick links</h4>
            <ul className="mt-3 space-y-2 text-sm">
              {QUICK.map(([l, h]) => (
                <li key={h}>
                  <a href={h} className="text-gold-soft/75 transition hover:pl-1 hover:text-paper">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-hand text-2xl text-gold-2">courses</h4>
            <ul className="mt-3 space-y-2 text-sm">
              {data.courses.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <a href="#courses" className="text-gold-soft/75 transition hover:pl-1 hover:text-paper">
                    {c.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-hand text-2xl text-gold-2">reach us</h4>
            <ul className="mt-3 space-y-3 text-sm text-gold-soft/80">
              {s.phone && (
                <li className="flex gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-2" />
                  <a href={telHref(s.phone)} className="hover:text-paper">{s.phone}</a>
                </li>
              )}
              {s.email && (
                <li className="flex gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-2" />
                  <a href={`mailto:${s.email}`} className="break-all hover:text-paper">{s.email}</a>
                </li>
              )}
              {s.address && (
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-2" />
                  <a href={s.map_link || '#contact'} target="_blank" rel="noreferrer" className="hover:text-paper">{s.address}</a>
                </li>
              )}
            </ul>
            <div className="mt-5">
              <Socials dark />
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-gold/15 pt-6 text-xs text-gold-soft/55 md:flex-row md:items-center">
          <p>© {year} {s.institute_name || 'Root Career Institute'}. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link to="/admin" className="hover:text-gold-2">Admin</Link>
            <a href="#home" className="inline-flex items-center gap-1 hover:text-gold-2">
              Back to the first page <ArrowUp className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
