import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Clock, FileText, GraduationCap, MessageCircleQuestion, Video, X, Minus } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import type { Course } from '../../lib/api';
import { NotebookPage, PageHeader } from '../ui/Ink';
import TiltCard from '../ui/TiltCard';

export function enquire(course: string) {
  window.dispatchEvent(new CustomEvent('rci:enquire', { detail: course }));
  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
}

export default function Courses() {
  const { data, loading } = useSite();
  const [cat, setCat] = useState('All');
  const [open, setOpen] = useState<Course | null>(null);
  const cats = useMemo(() => ['All', ...Array.from(new Set(data.courses.map((c) => c.category).filter(Boolean)))], [data.courses]);
  const list = cat === 'All' ? data.courses : data.courses.filter((c) => c.category === cat);

  return (
    <NotebookPage id="courses" tab="Courses" className="py-20 md:py-28">
      <div className="page-inner">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <PageHeader
            page="02"
            kicker="the syllabus"
            title="Courses written for"
            accent="toppers."
            subtitle="Structured programs for NEET, JEE and Foundation (Class 6th–12th) — live online classes, printed study material and doubt support in every single course."
          />
          <div className="flex flex-wrap gap-2" role="tablist">
            {cats.map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={cat === c}
                onClick={() => setCat(c)}
                className={`relative rounded-t-lg border-b-2 px-4 py-2 text-sm font-bold transition ${cat === c ? 'border-gold text-ink' : 'border-ink/10 text-ink-3 hover:text-ink'}`}
              >
                {cat === c && <motion.span layoutId="course-tab" className="absolute inset-0 -z-10 rounded-t-lg bg-gold-soft/70" />}
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => <div key={i} className="paper-card h-[440px] animate-pulse rounded-md bg-paper-2" />)}
          <AnimatePresence mode="popLayout">
            {list.map((c, i) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 40, rotate: i % 2 ? 2 : -2 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                viewport={{ once: true, margin: '-8% 0px' }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: [0.2, 0.7, 0.2, 1] }}
              >
                <CourseCard c={c} onView={() => setOpen(c)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {!loading && list.length === 0 && <p className="mt-10 font-hand text-2xl text-ink-3">No courses in this chapter yet.</p>}
      </div>

      <CourseModal course={open} onClose={() => setOpen(null)} />
    </NotebookPage>
  );
}

function Feature({ on, icon: I, label }: { on: boolean; icon: typeof Video; label: string }) {
  return (
    <li className={`flex items-center gap-2 text-[13px] font-semibold ${on ? 'text-ink' : 'text-ink-3 line-through decoration-ink/30'}`}>
      <span className={`flex h-5 w-5 items-center justify-center rounded border ${on ? 'border-gold bg-gold-soft' : 'border-ink/20'}`}>
        {on ? <Check className="h-3.5 w-3.5 text-gold" strokeWidth={3} /> : <Minus className="h-3 w-3" />}
      </span>
      <I className="h-4 w-4 text-ink-3" strokeWidth={1.7} />
      {label}
    </li>
  );
}

function CourseCard({ c, onView }: { c: Course; onView: () => void }) {
  const subjects = (c.subjects || '').split(',').map((s) => s.trim()).filter(Boolean);
  return (
    <TiltCard className="group h-full rounded-md">
      <article className="paper-card lined relative flex h-full flex-col rounded-md pb-6 pl-8 pr-4 pt-10 transition-shadow duration-500 group-hover:shadow-[0_30px_60px_-25px_rgba(20,26,60,0.45)] sm:pl-12 sm:pr-6 overflow-hidden">
        {/* spiral holes */}
        <div className="absolute inset-x-4 top-3 flex justify-between sm:inset-x-6" aria-hidden>
          {Array.from({ length: 11 }).map((_, i) => (
            <span key={i} className="h-2 w-2 rounded-full bg-paper-2 shadow-[inset_0_1px_2px_rgba(20,26,60,0.35)] sm:h-2.5 sm:w-2.5" />
          ))}
        </div>
        {c.badge && (
          <div className="tape absolute -right-1 top-6 rotate-6 px-3 py-1 font-hand text-base font-bold text-ink sm:-right-3 sm:px-4 sm:text-lg">{c.badge}</div>
        )}
        <div className="flex items-center gap-2">
          <span className="rounded-sm bg-ink px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-paper">{c.category}</span>
          <span className="font-hand text-lg text-gold">{c.class_level}</span>
        </div>
        <h3 className="mt-3 font-display text-[26px] font-[800] leading-[1.05] tracking-tight text-ink">{c.title}</h3>
        <p className="mt-3 line-clamp-3 text-[14.5px] leading-[28px] text-ink-2">{c.description}</p>

        <div className="mt-4 flex items-center gap-2 text-[13px] font-bold text-ink">
          <Clock className="h-4 w-4 text-gold" /> {c.duration}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {subjects.map((s) => (
            <span key={s} className="rounded-full border border-ink/15 bg-card px-2.5 py-0.5 font-hand text-[17px] leading-6 text-ink">
              {s}
            </span>
          ))}
        </div>

        <ul className="mt-5 space-y-2">
          <Feature on={c.online_classes} icon={Video} label="Live online classes" />
          <Feature on={c.study_material} icon={FileText} label="Study material" />
          <Feature on={c.doubt_support} icon={MessageCircleQuestion} label="Doubt support" />
        </ul>

        <div className="mt-auto flex items-end justify-between gap-3 pt-6">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-3">Fee</div>
            <div className="font-display text-lg font-[700] text-ink">{c.fee || 'Call us'}</div>
          </div>
          <button onClick={onView} className="group/btn inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-paper transition hover:bg-gold hover:text-ink">
            View Course <ArrowRight className="h-4 w-4 transition group-hover/btn:translate-x-1" />
          </button>
        </div>
      </article>
    </TiltCard>
  );
}

function CourseModal({ course, onClose }: { course: Course | null; onClose: () => void }) {
  const highlights = (course?.highlights || '').split('\n').map((s) => s.trim()).filter(Boolean);
  const subjects = (course?.subjects || '').split(',').map((s) => s.trim()).filter(Boolean);
  return (
    <AnimatePresence>
      {course && (
        <motion.div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-navy/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={course.title}
            className="paper-card lined relative max-h-[92svh] w-full max-w-2xl overflow-y-auto rounded-t-2xl pb-8 pl-8 pr-4 pt-10 sm:rounded-md sm:pl-14 sm:pr-10"
            initial={{ y: 80, rotateX: 18, opacity: 0 }}
            animate={{ y: 0, rotateX: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
            style={{ transformPerspective: 1200 }}
          >
            <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-ink/5 hover:bg-ink/10">
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="rounded-sm bg-ink px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-paper">{course.category}</span>
              <span className="font-hand text-xl text-gold">{course.class_level}</span>
            </div>
            <h3 className="mt-3 font-display text-3xl font-[800] leading-tight text-ink sm:text-4xl">{course.title}</h3>
            <p className="mt-3 text-[15px] leading-[28px] text-ink-2">{course.description}</p>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Info label="Duration" value={course.duration} icon={Clock} />
              <Info label="Class" value={course.class_level} icon={GraduationCap} />
              <Info label="Fee" value={course.fee || 'Call us'} icon={FileText} />
            </div>

            <h4 className="mt-7 font-hand text-2xl text-gold">subjects</h4>
            <div className="mt-1 flex flex-wrap gap-2">
              {subjects.map((s) => (
                <span key={s} className="rounded-full bg-gold-soft px-3 py-1 text-sm font-bold text-ink">
                  {s}
                </span>
              ))}
            </div>

            {highlights.length > 0 && (
              <>
                <h4 className="mt-7 font-hand text-2xl text-gold">what you get</h4>
                <ul className="mt-1 space-y-0">
                  {highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-[15px] leading-[28px] text-ink">
                      <Check className="mt-1.5 h-4 w-4 shrink-0 text-gold" strokeWidth={3} /> {h}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold text-ink-2">
              {course.online_classes && <span className="flex items-center gap-1.5"><Video className="h-4 w-4 text-gold" /> Live online classes</span>}
              {course.study_material && <span className="flex items-center gap-1.5"><FileText className="h-4 w-4 text-gold" /> Study material</span>}
              {course.doubt_support && <span className="flex items-center gap-1.5"><MessageCircleQuestion className="h-4 w-4 text-gold" /> Doubt support</span>}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  onClose();
                  setTimeout(() => enquire(course.title), 250);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-bold text-paper hover:bg-gold hover:text-ink"
              >
                Enquire about this course <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={onClose} className="rounded-full border border-ink/20 px-6 py-3 text-sm font-bold text-ink hover:border-ink">
                Back to courses
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Info({ label, value, icon: I }: { label: string; value: string; icon: typeof Clock }) {
  return (
    <div className="rounded-md border border-ink/10 bg-card/80 p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-3">
        <I className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-1 font-display text-base font-[700] text-ink">{value}</div>
    </div>
  );
}
