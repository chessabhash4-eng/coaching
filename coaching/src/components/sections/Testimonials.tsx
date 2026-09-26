import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import { NotebookPage, PageHeader } from '../ui/Ink';

const TINTS = ['lined', 'bg-gold-soft', 'grid-paper', 'lined'];

export default function Testimonials() {
  const { data, loading } = useSite();
  const list = data.testimonials;
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(420);
  const [visible, setVisible] = useState(1);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const measure = useCallback(() => {
    const first = track.current?.children[0] as HTMLElement | undefined;
    if (!first || !viewport.current) return;
    const gap = 24;
    const st = first.offsetWidth + gap;
    setStep(st);
    setVisible(Math.max(1, Math.floor((viewport.current.offsetWidth + gap) / st)));
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure, list.length]);
  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  const maxIndex = Math.max(0, list.length - visible);
  const go = useCallback((d: number) => setIndex((i) => (i + d > maxIndex ? 0 : i + d < 0 ? maxIndex : i + d)), [maxIndex]);

  useEffect(() => {
    if (paused || list.length <= visible) return;
    const t = setInterval(() => go(1), 4800);
    return () => clearInterval(t);
  }, [paused, go, list.length, visible]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -400) go(1);
    else if (info.offset.x > 60 || info.velocity.x > 400) go(-1);
  };

  return (
    <NotebookPage id="testimonials" tab="Reviews" className="overflow-hidden py-20 md:py-28">
      <div className="page-inner">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <PageHeader page="06" kicker="letters we kept" title="Notes from our" accent="students." subtitle="Handwritten feedback that students and parents left in our notebook." />
          <div className="flex gap-2">
            <button onClick={() => go(-1)} aria-label="Previous" className="flex h-12 w-12 items-center justify-center rounded-full border border-ink/20 bg-card transition hover:bg-ink hover:text-paper">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => go(1)} aria-label="Next" className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-paper transition hover:bg-gold hover:text-ink">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div ref={viewport} className="mt-12" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onTouchStart={() => setPaused(true)}>
          {loading && <div className="h-72 animate-pulse rounded bg-paper-2" />}
          <motion.div
            ref={track}
            className="flex cursor-grab gap-6 py-6 active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: -maxIndex * step, right: 0 }}
            dragElastic={0.12}
            onDragEnd={onDragEnd}
            animate={{ x: -index * step }}
            transition={{ type: 'spring', stiffness: 120, damping: 22, mass: 0.9 }}
          >
            {list.map((t, i) => (
              <motion.figure
                key={t.id}
                className={`relative w-[82vw] max-w-[400px] shrink-0 select-none rounded-sm px-7 pb-6 pl-12 pt-8 shadow-[0_20px_36px_-22px_rgba(20,26,60,0.5)] sm:w-[400px] ${TINTS[i % TINTS.length]}`}
                style={{ rotate: i % 2 ? 1.2 : -1.2 }}
                whileHover={{ rotate: 0, y: -6 }}
              >
                <span className="absolute -top-3 left-8 h-6 w-20 rotate-[-4deg] tape" />
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} className={`h-4 w-4 ${k < (t.rating || 5) ? 'fill-gold-2 text-gold-2' : 'text-ink/20'}`} />
                  ))}
                </div>
                <blockquote className="mt-3 font-hand text-[23px] leading-[28px] text-ink">“{t.message}”</blockquote>
                <figcaption className="mt-5 flex items-end justify-between gap-3 border-t border-dashed border-ink/20 pt-3">
                  <div>
                    <div className="font-hand text-[26px] leading-none text-gold">— {t.student_name}</div>
                    <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-3">{t.course}</div>
                  </div>
                  <span className="font-hand text-lg text-ink-3">{t.year}</span>
                </figcaption>
              </motion.figure>
            ))}
          </motion.div>
          {list.length > visible && (
            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button key={i} onClick={() => setIndex(i)} aria-label={`Go to slide ${i + 1}`} className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-gold' : 'w-2 bg-ink/20'}`} />
              ))}
            </div>
          )}
        </div>
      </div>
    </NotebookPage>
  );
}
