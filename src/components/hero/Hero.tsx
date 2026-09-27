import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { ArrowRight, ArrowDown, Phone, Check, SkipForward } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import { telHref } from '../../lib/api';
import { InkWrite, Scribble } from '../ui/Ink';
import HeroCSS from './HeroCSS';

const Scene3D = lazy(() => import('./Scene3D'));

function detect3D() {
  if (typeof window === 'undefined') return false;
  const wide = window.matchMedia('(min-width: 900px)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cores = navigator.hardwareConcurrency || 8;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  if (!wide || reduce || cores < 4 || nav.connection?.saveData) return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

const CH_3D = [
  { at: 0, label: 'title page', sub: 'Root Career Institute' },
  { at: 0.22, label: 'ch. 01', sub: 'Why this notebook?' },
  { at: 0.36, label: 'ch. 02 – 03', sub: 'NEET · JEE' },
  { at: 0.58, label: 'ch. 04 – 05', sub: 'Foundation · Admissions' },
  { at: 0.76, label: 'the last line', sub: 'Build your career' },
];
const CH_CSS = [
  { at: 0, label: 'the cover', sub: 'Root Career Institute' },
  { at: 0.18, label: 'ch. 01', sub: 'NEET' },
  { at: 0.46, label: 'ch. 02', sub: 'JEE Main + Advanced' },
  { at: 0.68, label: 'ch. 03', sub: 'Foundation 6th–10th' },
  { at: 0.84, label: 'ch. 04', sub: 'Admissions open' },
];

export default function Hero() {
  const { data } = useSite();
  const s = data.settings;
  const name = s.institute_name || 'Root Career Institute';
  const phone = s.phone || '';
  const heroRef = useRef<HTMLElement>(null);
  const [is3D, setIs3D] = useState(detect3D);

  useEffect(() => {
    const onResize = () => setIs3D(detect3D());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(false);
  const [finalShown, setFinalShown] = useState(false);
  const [introLive, setIntroLive] = useState(true);
  const [sceneOn, setSceneOn] = useState(true);
  const [chapter, setChapter] = useState(0);
  const progress = useRef(0);
  const mouse = useRef({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end end'] });
  const chapters = is3D ? CH_3D : CH_CSS;

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    progress.current = v;
    setFinalShown(v > 0.88);
    setIntroLive(v < 0.12);
    setSceneOn(v < 0.97);
    let c = 0;
    chapters.forEach((ch, i) => {
      if (v >= ch.at) c = i;
    });
    setChapter(c);
  });

  useEffect(() => {
    const v = scrollYProgress.get();
    progress.current = v;
    setFinalShown(v > 0.88);
    setIntroLive(v < 0.12);
  }, [scrollYProgress]);

  useEffect(() => {
    if (!heroRef.current) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: '100px' });
    io.observe(heroRef.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!is3D) return;
    const move = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [is3D]);

  const onReady = useCallback(() => setReady(true), []);

  const skip = () => {
    const el = heroRef.current;
    if (!el) return;
    window.scrollTo({ top: el.offsetTop + el.offsetHeight - window.innerHeight, behavior: 'smooth' });
  };

  const sceneOpacity = useTransform(scrollYProgress, [0.88, 0.96], [1, 0]);
  const sceneScale = useTransform(scrollYProgress, [0.88, 0.98], [1, 1.05]);
  const introOpacity = useTransform(scrollYProgress, [0, 0.07, 0.14], [1, 1, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.14], [0, -50]);
  const chapOpacity = useTransform(scrollYProgress, [0.18, 0.25, 0.84, 0.90], [0, 1, 1, 0]);
  const finalOpacity = useTransform(scrollYProgress, [0.89, 0.95], [0, 1]);
  const finalY = useTransform(scrollYProgress, [0.89, 0.96], [30, 0]);
  const barScale = useTransform(scrollYProgress, [0, 0.92], [0, 1]);

  return (
    <section id="home" ref={heroRef} className="relative" style={{ height: is3D ? '500vh' : '420vh' }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* soft vignette to lift the scene off the page */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgba(246,232,192,0.35),transparent_60%)]" />

        <motion.div className="absolute inset-0" style={{ opacity: sceneOpacity, scale: sceneScale, willChange: 'transform, opacity' }}>
          {is3D ? (
            <>
              <Suspense fallback={null}>
                <Scene3D progress={progress} mouse={mouse} active={active && sceneOn} name={name} phone={phone || 'Call us today'} onReady={onReady} />
              </Suspense>
              {!ready && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-ink/15 border-t-gold" />
                    <span className="font-hand text-2xl text-ink-2">sketching your notebook…</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <HeroCSS progress={scrollYProgress} name={name} phone={phone} />
          )}
        </motion.div>

        {/* INTRO overlay - positioned up to avoid overlapping the notebook */}
        <motion.div
          className="absolute inset-x-0 top-0 z-10 pt-10 sm:pt-14 md:pt-20 text-center"
          style={{ opacity: introOpacity, y: introY, pointerEvents: introLive ? 'auto' : 'none' }}
        >
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-gold/30 bg-card/80 px-2.5 sm:px-3.5 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-ink shadow-sm backdrop-blur">
            <span className="pulse-dot h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-gold-2" />
            {s.admissions_text || 'Admissions Open Now'}
          </div>
          <h1 className="mx-auto mt-1 sm:mt-2 max-w-5xl px-3 font-display text-[clamp(1.65rem,4.8vw,4.4rem)] font-[900] leading-[0.95] tracking-[-0.03em] text-ink">
            <InkWrite show delay={0.2} duration={1.3}>
              {name.toUpperCase()}
            </InkWrite>
          </h1>
          <p className="mt-1 sm:mt-1.5 font-hand text-[clamp(1.1rem,2.4vw,2rem)] text-ink-2">
            <InkWrite show delay={1.2} duration={1.4}>
              {s.tagline || 'Build Your Career. Shape Your Future.'}
            </InkWrite>
          </p>
        </motion.div>

        <motion.div
          className="absolute inset-x-0 bottom-0 z-10 pb-4 sm:pb-6 md:pb-8"
          style={{ opacity: introOpacity, pointerEvents: introLive ? 'auto' : 'none' }}
        >
          <div className="page-inner flex flex-col items-center gap-3 sm:gap-4 md:flex-row md:items-end md:justify-between">
            <p className="hidden max-w-xs text-sm font-semibold leading-snug text-ink-2 md:block">
              Expert Coaching for <span className="text-ink">NEET • JEE • Foundation</span>
              <br />
              (Class 6th–12th)
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              <a href="#courses" className="rounded-full bg-ink px-3 py-1.5 text-[11px] font-bold text-paper shadow-lg shadow-ink/20 transition hover:-translate-y-0.5 sm:px-5 sm:py-2.5 sm:text-sm">
                Explore Courses
              </a>
              <a href="#contact" className="rounded-full border border-ink/20 bg-card/80 px-3 py-1.5 text-[11px] font-bold text-ink backdrop-blur transition hover:border-ink sm:px-5 sm:py-2.5 sm:text-sm">
                Contact
              </a>
              {phone && (
                <a href={telHref(phone)} className="flex items-center gap-1 rounded-full bg-gold-soft px-2.5 py-1.5 text-[11px] font-bold text-ink sm:gap-1.5 sm:px-4 sm:py-2.5 sm:text-sm">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="truncate max-w-[100px] sm:max-w-none">{phone}</span>
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* chapter marginalia */}
        <motion.div className="pointer-events-none absolute bottom-8 z-10 hidden sm:block" style={{ opacity: chapOpacity, left: 'calc(var(--mx) + 18px)' }}>
          <motion.div key={chapter} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="font-hand text-2xl text-gold">{chapters[chapter].label}</div>
            <div className="font-display text-lg italic text-ink">{chapters[chapter].sub}</div>
          </motion.div>
        </motion.div>
        <motion.div className="pointer-events-none absolute right-5 top-1/2 z-10 hidden h-40 w-[3px] -translate-y-1/2 rounded bg-ink/10 md:block" style={{ opacity: chapOpacity }}>
          <motion.div className="h-full w-full origin-top rounded bg-gold" style={{ scaleY: barScale }} />
        </motion.div>
        <motion.button
          onClick={skip}
          style={{ opacity: chapOpacity }}
          className="absolute bottom-8 right-5 z-20 flex items-center gap-1.5 rounded-full border border-ink/15 bg-card/80 px-3 py-1.5 text-xs font-bold text-ink-2 backdrop-blur md:right-10"
        >
          <SkipForward className="h-3.5 w-3.5" /> Skip
        </motion.button>

        {/* FINAL flat page */}
        <FinalHero shown={finalShown} opacity={finalOpacity} y={finalY} />
      </div>
    </section>
  );
}

function FinalHero({ shown, opacity, y }: { shown: boolean; opacity: MotionValue<number>; y: MotionValue<number> }) {
  const { data } = useSite();
  const s = data.settings;
  const phone = s.phone || '';
  const name = s.institute_name || 'Root Career Institute';
  const words = name.split(' ');
  const last = words.length > 1 ? words.pop() : '';
  const tagline = s.tagline || 'Build Your Career. Shape Your Future.';
  const [t1, t2] = (() => {
    const i = tagline.indexOf('.');
    return i > 0 && i < tagline.length - 1 ? [tagline.slice(0, i + 1), tagline.slice(i + 1).trim()] : [tagline, ''];
  })();

  return (
    <motion.div className="absolute inset-0 z-20 flex items-center" style={{ opacity, y, pointerEvents: shown ? 'auto' : 'none' }}>
      <div className="page-inner grid w-full items-center gap-6 pt-16 sm:gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
        <div>
          <div className="flex items-center gap-3">
            <img src="/uploads/logo.png" alt="" className="h-12 w-12 drop-shadow-md lg:hidden" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink sm:gap-2 sm:px-3.5 sm:py-1.5 sm:text-[11px] sm:tracking-[0.2em]">
              <span className="pulse-dot h-2 w-2 rounded-full bg-gold" /> {s.admissions_text || 'Admissions Open Now'}
            </span>
          </div>
          <h1 className="mt-5 font-display text-[clamp(2.5rem,7.4vw,6.8rem)] font-[900] leading-[0.88] tracking-[-0.035em] text-ink">
            <InkWrite show={shown} duration={1}>
              {words.join(' ')}
            </InkWrite>
            <br />
            <span className="relative inline-block font-[500] italic text-gold">
              <InkWrite show={shown} delay={0.6} duration={0.9}>
                {last || ''}
              </InkWrite>
            </span>
          </h1>
          <p className="mt-5 font-hand text-[clamp(1.7rem,3.2vw,2.8rem)] leading-tight text-ink">
            <InkWrite show={shown} delay={1.1} duration={1.1}>
              {t1}
            </InkWrite>{' '}
            {t2 && (
              <span className="relative inline-block text-gold">
                <InkWrite show={shown} delay={1.9} duration={1.1}>
                  {t2}
                </InkWrite>
                <Scribble show={shown} delay={2.8} className="absolute -bottom-1 left-0 h-3 w-full" />
              </span>
            )}
          </p>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-2 md:text-lg">
            {s.hero_subline || 'Expert Coaching for'}{' '}
            <strong className="text-ink">NEET • JEE • Foundation</strong> <span className="whitespace-nowrap">(Class 6th–12th)</span>
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2 sm:mt-7 sm:gap-3">
            <a href="#courses" className="group inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-xs font-bold text-paper shadow-xl shadow-ink/25 transition hover:-translate-y-0.5 sm:px-6 sm:py-3.5 sm:text-sm">
              Explore Courses <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1 sm:h-4 sm:w-4" />
            </a>
            <a href="#contact" className="inline-flex items-center gap-2 rounded-full border-2 border-ink/80 px-4 py-2 text-xs font-bold text-ink transition hover:bg-ink hover:text-paper sm:px-6 sm:py-3 sm:text-sm">
              Contact Us
            </a>
            {phone && (
              <a href={telHref(phone)} className="inline-flex items-center gap-2 px-1 py-2 text-xs font-bold text-ink sm:px-2 sm:py-3 sm:text-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-soft sm:h-9 sm:w-9">
                  <Phone className="h-3.5 w-3.5 text-gold sm:h-4 sm:w-4" />
                </span>
                <span className="break-all">{phone}</span>
              </a>
            )}
          </div>
          <div className="mt-8 hidden items-center gap-2 font-hand text-xl text-ink-3 md:flex">
            <ArrowDown className="h-4 w-4" /> keep turning the pages
          </div>
        </div>

        <div className="relative hidden lg:block">
          <motion.div
            initial={false}
            animate={shown ? { rotate: -3, y: 0, opacity: 1 } : { rotate: -8, y: 30, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
            className="paper-card lined relative mx-auto w-[min(380px,100%)] rounded-sm px-10 pb-10 pt-14"
          >
            <div className="tape absolute -top-3 left-1/2 h-7 w-32 -translate-x-1/2 rotate-2" />
            <img src="/uploads/logo.png" alt="Root Career Institute logo" className="mx-auto h-36 w-36 drop-shadow-[0_12px_20px_rgba(15,22,64,0.35)]" />
            <ul className="mt-6 space-y-[6px] font-hand text-2xl leading-[28px] text-ink">
              {['Live online classes', 'Printed study material', '1-on-1 doubt support', 'Weekly tests & analysis'].map((t, i) => (
                <motion.li
                  key={t}
                  className="flex items-center gap-2"
                  initial={false}
                  animate={shown ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                  transition={{ delay: 0.9 + i * 0.15 }}
                >
                  <Check className="h-5 w-5 text-gold" strokeWidth={3} /> {t}
                </motion.li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={false}
            animate={shown ? { scale: 1, opacity: 1, rotate: -14 } : { scale: 1.6, opacity: 0, rotate: -30 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 1.3 }}
            className="absolute -right-2 -top-6 flex h-32 w-32 flex-col items-center justify-center rounded-full border-4 border-double border-gold text-center text-gold"
          >
            <span className="text-[10px] font-extrabold tracking-[0.2em]">★ 2026–27 ★</span>
            <span className="font-display text-xl font-[900] leading-none">OPEN</span>
            <span className="text-[10px] font-extrabold tracking-[0.18em]">ADMISSIONS</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
