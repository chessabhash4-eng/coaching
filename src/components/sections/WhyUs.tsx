import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useSite } from '../../contexts/SiteContext';
import type { Feature } from '../../lib/api';
import { NotebookPage, PageHeader, Scribble } from '../ui/Ink';
import Icon from '../ui/Icon';

export default function WhyUs() {
  const { data, loading } = useSite();
  return (
    <NotebookPage id="why" tab="Why Root" className="py-20 md:py-28">
      <div className="page-inner grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <PageHeader
            page="03"
            kicker="notes to self"
            title="Why students choose"
            accent="Root."
            subtitle="A coaching institute that feels like the best notebook you ever kept — organised, personal and always there when you need to revise."
          />
          <div className="relative mt-10 hidden max-w-sm lg:block">
            <p className="relative z-10 px-6 py-5 font-hand text-[30px] leading-[1.15] text-ink">
              “Strong roots grow the tallest careers.”
            </p>
            <Scribble variant="circle" className="absolute inset-0 h-full w-full" color="var(--color-gold)" />
            <Scribble variant="arrow" className="absolute -bottom-12 right-6 h-12 w-24" color="var(--color-ink-3)" delay={1} />
          </div>
        </div>

        <ol className="relative">
          {loading && Array.from({ length: 5 }).map((_, i) => <li key={i} className="mb-6 h-28 animate-pulse rounded bg-paper-2" />)}
          {data.features.map((f, i) => (
            <FeatureRow key={f.id} f={f} i={i} />
          ))}
        </ol>
      </div>
    </NotebookPage>
  );
}

function FeatureRow({ f, i }: { f: Feature; i: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  return (
    <motion.li
      ref={ref}
      initial={{ opacity: 0, x: 30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
      className="group relative grid grid-cols-[auto_1fr] gap-x-5 border-b border-dashed border-ink/15 py-7 first:pt-0 md:grid-cols-[auto_1fr_auto]"
    >
      <div className="flex flex-col items-center gap-2">
        <span className="font-hand text-3xl leading-none text-ink-3">{String(i + 1).padStart(2, '0')}.</span>
        <span className="relative flex h-8 w-8 items-center justify-center rounded-md border-2 border-ink/70 bg-card">
          <svg viewBox="0 0 24 24" className="absolute -inset-1 h-10 w-10" fill="none">
            <motion.path
              d="M4 13 L10 19 L22 4"
              stroke="var(--color-gold)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
            />
          </svg>
        </span>
      </div>
      <div>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-soft text-ink transition group-hover:rotate-[-8deg] group-hover:scale-110">
            <Icon name={f.icon} className="h-5 w-5" />
          </span>
          <h3 className="font-display text-[22px] font-[800] leading-tight text-ink md:text-2xl">
            <span className={`highlight ${inView ? 'on' : ''}`} style={{ transitionDelay: '0.6s' }}>
              {f.title}
            </span>
          </h3>
        </div>
        <p className="mt-3 max-w-xl text-[15px] leading-[28px] text-ink-2">{f.description}</p>
      </div>
      {f.note && (
        <motion.p
          initial={{ opacity: 0, rotate: 0 }}
          animate={inView ? { opacity: 1, rotate: -4 } : {}}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="col-start-2 mt-2 max-w-[180px] font-hand text-xl leading-tight text-gold md:col-start-3 md:mt-0 md:text-right"
        >
          {f.note}
        </motion.p>
      )}
    </motion.li>
  );
}
