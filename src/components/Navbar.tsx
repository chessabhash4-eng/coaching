import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Phone, ArrowUpRight } from 'lucide-react';
import { useSite } from '../contexts/SiteContext';
import { telHref } from '../lib/api';
import Socials from './Socials';

const LINKS = [
  { label: 'Courses', href: '#courses' },
  { label: 'Why Us', href: '#why' },
  { label: 'Results', href: '#results' },
  { label: 'Faculty', href: '#faculty' },
  { label: 'Reviews', href: '#testimonials' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const { data } = useSite();
  const s = data.settings;
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');
  const lastY = useRef(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 40);
        if (y > lastY.current + 8 && y > 400) setHidden(true);
        else if (y < lastY.current - 8) setHidden(false);
        lastY.current = y;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const ids = LINKS.map((l) => l.href.slice(1));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    const t = setTimeout(() => {
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) io.observe(el);
      });
    }, 400);
    return () => {
      clearTimeout(t);
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: hidden && !open ? -110 : 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
        className="fixed inset-x-0 top-3 z-50 flex justify-center px-3 md:top-4"
      >
        <nav
          className={`flex w-full max-w-6xl items-center justify-between gap-3 rounded-full border py-1.5 pl-1.5 pr-1.5 transition-all duration-500 md:pr-2 ${
            scrolled || open ? 'border-ink/10 bg-card/85 shadow-[0_10px_30px_-12px_rgba(20,26,60,0.28)] backdrop-blur-md' : 'border-transparent bg-card/40 backdrop-blur-sm'
          }`}
        >
          <a href="#home" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-full pr-2">
            <img src="/uploads/logo.png" alt="Root Career Institute logo" className="h-10 w-10 drop-shadow" width={40} height={40} />
            <span className="leading-none">
              <span className="block font-display text-[15px] font-[800] tracking-tight text-ink">Root Career</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.28em] text-gold">Institute</span>
            </span>
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => {
              const isActive = active === l.href.slice(1);
              return (
                <li key={l.href}>
                  <a href={l.href} className={`relative rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors ${isActive ? 'text-ink' : 'text-ink-2 hover:text-ink'}`}>
                    {isActive && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-gold-soft" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
                    {l.label}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-1.5">
            {s.phone && (
              <a href={telHref(s.phone)} className="hidden items-center gap-2 rounded-full px-3 py-2 text-[13px] font-bold text-ink hover:bg-ink/5 md:flex">
                <Phone className="h-4 w-4 text-gold" /> {s.phone}
              </a>
            )}
            <a href="#contact" className="hidden items-center gap-1 rounded-full bg-ink px-4 py-2.5 text-[13px] font-bold text-paper transition hover:-translate-y-0.5 sm:flex">
              Enroll <ArrowUpRight className="h-4 w-4" />
            </a>
            <button
              onClick={() => setOpen((o) => !o)}
              className="relative flex h-11 w-11 items-center justify-center rounded-full bg-ink text-paper lg:hidden"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              <span className="relative block h-3.5 w-5">
                <motion.span className="absolute left-0 top-0 h-[2px] w-5 rounded bg-paper" animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} />
                <motion.span className="absolute left-0 top-[6px] h-[2px] w-3.5 rounded bg-gold-2" animate={open ? { opacity: 0, x: 8 } : { opacity: 1, x: 0 }} />
                <motion.span className="absolute left-0 top-3 h-[2px] w-5 rounded bg-paper" animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} />
              </span>
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 overflow-y-auto bg-paper lg:hidden"
            initial={{ clipPath: 'circle(0% at calc(100% - 44px) 40px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 44px) 40px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 44px) 40px)' }}
            transition={{ duration: 0.6, ease: [0.7, 0, 0.2, 1] }}
            style={{
              backgroundImage:
                'linear-gradient(to right, transparent calc(var(--mx) - 1px), rgba(222,110,110,0.45) calc(var(--mx) - 1px), rgba(222,110,110,0.45) var(--mx), transparent var(--mx)), repeating-linear-gradient(to bottom, transparent 0, transparent 55px, rgba(108,140,196,0.2) 55px, rgba(108,140,196,0.2) 56px)',
            }}
          >
            <div className="flex min-h-full flex-col pb-10 pt-28" style={{ paddingLeft: 'calc(var(--mx) + 22px)', paddingRight: 24 }}>
              <p className="font-hand text-2xl text-gold">contents</p>
              <ul className="mt-2">
                {LINKS.map((l, i) => (
                  <motion.li key={l.href} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 + i * 0.06, duration: 0.45 }}>
                    <a href={l.href} onClick={() => setOpen(false)} className="group flex h-14 items-end justify-between border-b border-transparent pb-1.5">
                      <span className="flex items-baseline gap-4">
                        <span className="w-7 font-hand text-xl text-ink-3">{String(i + 1).padStart(2, '0')}</span>
                        <span className="font-display text-[32px] font-[800] leading-none tracking-tight text-ink group-active:text-gold">{l.label}</span>
                      </span>
                      <span className="font-hand text-lg text-ink-3">p. {String(i + 2).padStart(2, '0')}</span>
                    </a>
                  </motion.li>
                ))}
              </ul>
              <motion.div className="mt-auto pt-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                {s.phone && (
                  <a href={telHref(s.phone)} className="flex items-center justify-center gap-2 rounded-2xl bg-ink py-4 text-base font-bold text-paper">
                    <Phone className="h-5 w-5 text-gold-2" /> Call {s.phone}
                  </a>
                )}
                <p className="mt-4 text-center text-sm font-semibold text-ink-2">Expert Coaching for NEET • JEE • Foundation (6th–12th)</p>
                <div className="mt-4 flex justify-center">
                  <Socials />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
