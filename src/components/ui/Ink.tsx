import { motion, useInView } from 'framer-motion';
import { useRef, type ReactNode, type ElementType } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const motionCache = new Map<ElementType, any>();
function getMotion(tag: ElementType) {
  if (!motionCache.has(tag)) motionCache.set(tag, motion.create(tag as string));
  return motionCache.get(tag);
}

/** Text that "writes itself" — a left-to-right ink reveal. */
export function InkWrite({
  children,
  className = '',
  delay = 0,
  duration,
  show,
  as = 'span',
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  show?: boolean;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const visible = show ?? inView;
  const len = typeof children === 'string' ? children.length : 20;
  const d = duration ?? Math.min(2, 0.4 + len * 0.04);
  const MotionTag = getMotion(as);
  return (
    <MotionTag
      ref={ref}
      className={`inline-block ${className}`}
      initial={{ clipPath: 'inset(-25% 100% -25% -2%)' }}
      animate={{ clipPath: visible ? 'inset(-25% -2% -25% -2%)' : 'inset(-25% 100% -25% -2%)' }}
      transition={{ duration: visible ? d : 0.3, delay: visible ? delay : 0, ease: [0.5, 0.05, 0.35, 1] }}
    >
      {children}
    </MotionTag>
  );
}

/** Hand-drawn underline that strokes itself in. */
export function Scribble({
  className = '',
  delay = 0.2,
  show,
  variant = 'wave',
  color = 'var(--color-gold-2)',
}: {
  className?: string;
  delay?: number;
  show?: boolean;
  variant?: 'wave' | 'double' | 'circle' | 'arrow';
  color?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const visible = show ?? inView;
  const paths: Record<string, { vb: string; d: string[] }> = {
    wave: { vb: '0 0 300 20', d: ['M3 13 C 40 4, 70 18, 110 10 S 190 4, 230 11 S 280 12, 297 7'] },
    double: { vb: '0 0 300 24', d: ['M4 9 C 80 3, 200 4, 296 8', 'M20 18 C 100 13, 190 14, 280 17'] },
    circle: { vb: '0 0 220 90', d: ['M150 8 C 70 0, 8 20, 10 46 C 12 76, 90 88, 160 78 C 214 70, 222 36, 190 20 C 170 10, 120 6, 84 12'] },
    arrow: { vb: '0 0 120 60', d: ['M6 10 C 30 50, 70 54, 108 36', 'M92 28 L 110 35 L 98 50'] },
  };
  const p = paths[variant];
  return (
    <svg ref={ref} viewBox={p.vb} preserveAspectRatio="none" className={className} fill="none" aria-hidden>
      {p.d.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke={color}
          strokeWidth={variant === 'circle' ? 3 : 4}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={visible ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 0.9, delay: delay + i * 0.35, ease: [0.6, 0.05, 0.3, 1] }}
        />
      ))}
    </svg>
  );
}

/** Section header styled like a notebook page heading. */
export function PageHeader({
  page,
  kicker,
  title,
  accent,
  subtitle,
  align = 'left',
}: {
  page: string;
  kicker: string;
  title: string;
  accent?: string;
  subtitle?: string;
  align?: 'left' | 'center';
}) {
  return (
    <div className={`relative ${align === 'center' ? 'text-center mx-auto' : ''} max-w-3xl`}>
      <div className={`flex items-center gap-3 ${align === 'center' ? 'justify-center' : ''}`}>
        <span className="font-hand text-2xl text-gold">{kicker}</span>
        <span className="h-px w-10 bg-ink/20" />
        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-ink-3">p. {page}</span>
      </div>
      <h2 className="mt-3 font-display text-[clamp(2.2rem,5vw,4rem)] font-[800] leading-[0.98] tracking-[-0.02em] text-ink">
        {title}{' '}
        {accent && (
          <span className="relative inline-block italic font-[500] text-gold">
            {accent}
            <Scribble className="absolute -bottom-2 left-0 h-3 w-full" />
          </span>
        )}
      </h2>
      {subtitle && <p className="mt-5 text-base md:text-lg leading-relaxed text-ink-2 max-w-2xl mx-auto md:mx-0" style={align === 'center' ? { marginInline: 'auto' } : undefined}>{subtitle}</p>}
    </div>
  );
}

/** A section that enters like a page turning into view. */
export function NotebookPage({ id, children, className = '', tab }: { id: string; children: ReactNode; className?: string; tab?: string }) {
  return (
    <section id={id} className={`relative scroll-mt-20 ${className}`} style={{ overflowX: 'clip' }}>
      {tab && (
        <div className="pointer-events-none absolute right-0 top-16 hidden md:block">
          <div className="rounded-l-lg bg-gold-soft px-3 py-2 font-hand text-lg text-ink shadow-[0_4px_10px_-4px_rgba(20,26,60,0.3)] [writing-mode:vertical-rl]">
            {tab}
          </div>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 60, rotateX: 6 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true, margin: '-12% 0px' }}
        transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
        style={{ transformPerspective: 1400, transformOrigin: '50% 0%' }}
      >
        {children}
      </motion.div>
    </section>
  );
}

export function Perforation() {
  return (
    <div className="page-inner py-6" aria-hidden>
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 border-t-2 border-dashed border-ink/10" />
        <span className="font-hand text-lg text-ink-3">✂ turn the page</span>
        <div className="h-px flex-1 border-t-2 border-dashed border-ink/10" />
      </div>
    </div>
  );
}
