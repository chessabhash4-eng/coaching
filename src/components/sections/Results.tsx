import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import type { Result, Stat } from '../../lib/api';
import { NotebookPage, PageHeader, Scribble } from '../ui/Ink';

function Counter({ value, suffix, decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, Number(value) || 0, { duration: 2.2, ease: [0.16, 1, 0.3, 1], onUpdate: setV });
    return () => c.stop();
  }, [inView, value]);
  return (
    <span ref={ref} className="tabular-nums">
      {v.toLocaleString('en-IN', { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

export default function Results() {
  const { data, loading } = useSite();
  return (
    <NotebookPage id="results" tab="Results" className="py-20 md:py-28">
      <div className="page-inner">
        <PageHeader
          page="04"
          kicker="report card"
          title="Results that speak in"
          accent="red ink."
          subtitle="Every number here is a student who trusted the process. Here’s what our last batches wrote in their answer sheets."
        />

        <div className="mt-14 grid grid-cols-2 gap-5 md:gap-8 lg:grid-cols-4">
          {loading && Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-44 animate-pulse rounded bg-paper-2" />)}
          {data.stats.map((s, i) => (
            <StatCard key={s.id} s={s} i={i} />
          ))}
        </div>

        <div className="mt-20 flex items-center gap-3">
          <Trophy className="h-6 w-6 text-gold" />
          <h3 className="font-display text-2xl font-[800] text-ink md:text-3xl">Hall of achievers</h3>
          <span className="font-hand text-xl text-ink-3">— pinned to our wall</span>
        </div>
        <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {data.results.map((r, i) => (
            <AchieverNote key={r.id} r={r} i={i} />
          ))}
        </div>
      </div>
    </NotebookPage>
  );
}

function StatCard({ s, i }: { s: Stat; i: number }) {
  const decimals = Number(s.value) % 1 !== 0 ? 1 : 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.6, delay: i * 0.1 }}
      className="paper-card grid-paper relative rounded-md px-4 pb-5 pt-7 text-center md:px-6"
    >
      <div className="relative mx-auto inline-block px-4">
        <div className="font-display text-[clamp(2.2rem,5vw,3.6rem)] font-[900] leading-none tracking-tight text-ink">
          <Counter value={s.value} suffix={s.suffix} decimals={decimals} />
        </div>
        <Scribble variant="circle" className="absolute -inset-x-2 -inset-y-4 h-[calc(100%+2rem)] w-[calc(100%+1rem)]" delay={0.8 + i * 0.15} />
      </div>
      <div className="mt-4 text-[12px] font-extrabold uppercase tracking-[0.18em] text-ink">{s.label}</div>
      {s.description && <p className="mt-1 font-hand text-lg leading-tight text-ink-2">{s.description}</p>}
    </motion.div>
  );
}

function AchieverNote({ r, i }: { r: Result; i: number }) {
  const rot = [-2.2, 1.6, -1.2, 2.4][i % 4];
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const initials = r.student_name.split(' ').map((w) => w[0]).slice(0, 2).join('');
  const pct = Math.max(0, Math.min(100, Number(r.percentage) || 0));
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, rotate: rot * 3 }}
      animate={inView ? { opacity: 1, y: 0, rotate: rot } : {}}
      whileHover={{ rotate: 0, y: -6, transition: { duration: 0.25 } }}
      transition={{ duration: 0.7, delay: (i % 4) * 0.1, ease: [0.2, 0.7, 0.2, 1] }}
      className={`relative rounded-sm px-6 pb-6 pt-9 shadow-[0_18px_30px_-18px_rgba(20,26,60,0.45)] ${i % 3 === 1 ? 'bg-gold-soft' : 'lined'}`}
    >
      <span className="absolute left-1/2 top-2 h-4 w-4 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_35%_35%,#f0c85a,#9b7010)] shadow-[0_3px_4px_rgba(0,0,0,0.3)]" />
      <div className="flex items-center gap-3">
        {r.photo_url ? (
          <img src={r.photo_url} alt={r.student_name} className="h-12 w-12 rounded-full object-cover ring-2 ring-card" loading="lazy" />
        ) : (
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink font-display text-lg font-[800] text-gold-soft">{initials}</span>
        )}
        <div>
          <div className="font-display text-lg font-[800] leading-tight text-ink">{r.student_name}</div>
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-3">
            {r.exam} · {r.year}
          </div>
        </div>
      </div>
      <div className="mt-4 font-display text-3xl font-[900] tracking-tight text-ink">{r.score}</div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/10">
        <motion.div className="h-full rounded-full bg-gradient-to-r from-gold to-gold-2" initial={{ width: 0 }} animate={inView ? { width: `${pct}%` } : {}} transition={{ duration: 1.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }} />
      </div>
      <div className="mt-1 flex justify-between text-[11px] font-bold text-ink-3">
        <span>score</span>
        <span>{pct}%</span>
      </div>
      {r.highlight && <p className="mt-3 font-hand text-xl leading-tight text-gold">{r.highlight}</p>}
    </motion.div>
  );
}
