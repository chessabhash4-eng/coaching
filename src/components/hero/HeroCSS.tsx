import { motion, useTransform, type MotionValue } from 'framer-motion';
import type { ReactNode } from 'react';
import {
  Atom,
  BookOpen,
  Calculator,
  GraduationCap,
  PencilLine,
  Ruler,
  Sigma,
  FlaskConical,
  Check,
  Phone,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { telHref } from '../../lib/api';

const FLIPS = [
  [0.08, 0.20], // Cover flip -> reveals NEET
  [0.38, 0.48], // Leaf 1 (NEET) flip -> NEET stays visible from 0.20 to 0.38!
  [0.66, 0.76], // Leaf 2 (JEE) flip -> JEE stays visible from 0.48 to 0.66!
  [0.84, 0.90], // Leaf 3 (Foundation) flip -> Foundation stays visible from 0.76 to 0.84!
];

function Leaf({
  progress,
  range,
  z,
  front,
  back,
}: {
  progress: MotionValue<number>;
  range: number[];
  z: number;
  front: ReactNode;
  back?: ReactNode;
}) {
  const rotateY = useTransform(progress, range, [0, -180]);
  const opacity = useTransform(progress, [range[1], range[1] + 0.04], [1, 0]);
  const shade = useTransform(progress, [range[0], (range[0] + range[1]) / 2, range[1]], [0, 0.35, 0]);
  return (
    <motion.div
      className="absolute inset-0 origin-left"
      style={{ rotateY, opacity, zIndex: z, transformStyle: 'preserve-3d', willChange: 'transform' }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-r-md" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
        {front}
        <motion.div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-ink/40 to-transparent" style={{ opacity: shade }} />
      </div>
      <div
        className="absolute inset-0 overflow-hidden rounded-l-md"
        style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
      >
        {back ?? <PaperFace />}
      </div>
    </motion.div>
  );
}

function PaperFace({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <div
      className={`absolute inset-0 pl-[13%] pr-[5%] pt-3.5 pb-2.5 sm:pl-[14%] sm:pr-[6%] sm:pt-4 sm:pb-3 flex flex-col justify-between overflow-hidden ${className}`}
      style={{
        backgroundColor: '#fbf9f3',
        backgroundImage:
          'linear-gradient(to right, transparent 11%, rgba(222,110,110,0.38) 11%, rgba(222,110,110,0.38) calc(11% + 1px), transparent calc(11% + 1px)), repeating-linear-gradient(to bottom, transparent 0, transparent 20px, rgba(108,140,196,0.2) 20px, rgba(108,140,196,0.2) 21px), linear-gradient(to right, rgba(20,26,60,0.08), transparent 12%)',
      }}
    >
      {children}
    </div>
  );
}

const Feature = ({ children }: { children: ReactNode }) => (
  <div className="flex items-start gap-1.5 text-[10.5px] sm:text-[12px] leading-[14px] sm:leading-[16px] text-ink font-semibold">
    <Check className="h-3 w-3 shrink-0 text-gold mt-[0.5px]" strokeWidth={3} />
    <span className="truncate">{children}</span>
  </div>
);

export default function HeroCSS({ progress, name, phone }: { progress: MotionValue<number>; name: string; phone: string }) {
  const rotateX = useTransform(progress, [0, 0.12], [24, 6]);
  const rotateZ = useTransform(progress, [0, 0.12], [-5, 0]);
  const scale = useTransform(progress, [0, 0.12, 0.84, 0.94], [0.94, 1, 1, 1.2]);
  const nbOpacity = useTransform(progress, [0.88, 0.96], [1, 0]);
  const liftY = useTransform(progress, [0, 0.16], [50, 0]);

  const icons = [
    { I: PencilLine, x: '6%', y: '24%', f: -50, r: '-12deg', d: '6s' },
    { I: Calculator, x: '86%', y: '22%', f: -70, r: '10deg', d: '7s' },
    { I: GraduationCap, x: '82%', y: '78%', f: -40, r: '-8deg', d: '5.5s' },
    { I: BookOpen, x: '6%', y: '74%', f: -60, r: '8deg', d: '6.5s' },
    { I: Atom, x: '88%', y: '48%', f: -90, r: '0deg', d: '8s' },
    { I: Sigma, x: '4%', y: '50%', f: -80, r: '-6deg', d: '7.5s' },
  ];

  return (
    <div className="absolute inset-0">
      {icons.map(({ I, x, y, f, r, d }, i) => (
        <FloatIcon key={i} progress={progress} x={x} y={y} f={f}>
          <div className="floaty flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-2xl border border-ink/10 bg-card shadow-[0_10px_24px_-10px_rgba(20,26,60,0.35)]" style={{ ['--r' as string]: r, ['--d' as string]: d }}>
            <I className={`h-4 w-4 sm:h-5 sm:w-5 ${i % 2 ? 'text-gold' : 'text-ink'}`} strokeWidth={1.7} />
          </div>
        </FloatIcon>
      ))}

      <div className="absolute inset-0 flex items-center justify-center pt-[18svh] pb-[8svh] sm:pt-24 sm:pb-12" style={{ perspective: 1600 }}>
        <motion.div
          className="relative aspect-[1/1.42] w-[min(88vw,350px)] sm:w-[min(54vw,380px)]"
          style={{ rotateX, rotateZ, scale, y: liftY, opacity: nbOpacity, transformStyle: 'preserve-3d' }}
        >
          {/* back cover + page block */}
          <div className="absolute -inset-[3%] left-[-2%] rounded-lg bg-navy shadow-[0_30px_60px_-20px_rgba(15,22,64,0.55)]" style={{ transform: 'translateZ(-6px)' }} />
          <div className="absolute inset-0 translate-x-[3px] translate-y-[3px] rounded-r-md bg-[#efe8d6]" style={{ transform: 'translateZ(-3px)' }} />

          {/* BASE PAGE: Chapter 04 Admissions */}
          <div className="absolute inset-0 overflow-hidden rounded-r-md">
            <PaperFace>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-ink/10 pb-1">
                <span className="font-hand text-base text-gold font-bold">ch. 04</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-emerald-800 border border-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                  Seats Filling Fast
                </span>
              </div>

              {/* Title */}
              <div>
                <h3 className="font-display text-[22px] sm:text-[26px] font-[900] leading-none text-ink">Admissions Open</h3>
                <p className="mt-0.5 font-hand text-[12px] sm:text-[13px] text-ink-2 font-semibold">Session 2026–27 • Max 35 Students/Batch</p>
              </div>

              {/* 4 Pillars Grid */}
              <div className="grid grid-cols-2 gap-1.5 my-0.5">
                <div className="rounded bg-paper/90 border border-ink/10 p-1.5">
                  <p className="text-[8px] font-bold uppercase text-gold tracking-wider">Study Kit</p>
                  <p className="text-[10px] font-extrabold text-ink leading-tight">Printed Books + App</p>
                </div>
                <div className="rounded bg-paper/90 border border-ink/10 p-1.5">
                  <p className="text-[8px] font-bold uppercase text-gold tracking-wider">Scholarship</p>
                  <p className="text-[10px] font-extrabold text-ink leading-tight">Up to 90% Waiver</p>
                </div>
                <div className="rounded bg-paper/90 border border-ink/10 p-1.5">
                  <p className="text-[8px] font-bold uppercase text-gold tracking-wider">Doubt Cell</p>
                  <p className="text-[10px] font-extrabold text-ink leading-tight">Daily 1-on-1 Sessions</p>
                </div>
                <div className="rounded bg-paper/90 border border-ink/10 p-1.5">
                  <p className="text-[8px] font-bold uppercase text-gold tracking-wider">Batches</p>
                  <p className="text-[10px] font-extrabold text-ink leading-tight">Classroom & Live</p>
                </div>
              </div>

              {/* Action Box */}
              <div className="rounded-lg bg-ink p-2 text-paper shadow-sm">
                <p className="text-[8.5px] font-bold uppercase tracking-wider text-gold-2">Talk to an Academic Counselor</p>
                {phone ? (
                  <a href={telHref(phone)} className="mt-1 flex items-center justify-between text-xs font-bold text-paper hover:text-gold transition">
                    <span className="font-display text-sm tracking-wide flex items-center gap-1">
                      <Phone className="h-3 w-3 text-gold" /> {phone}
                    </span>
                    <span className="rounded-full bg-gold px-2 py-0.5 text-[9px] font-extrabold text-ink">Call Now ↗</span>
                  </a>
                ) : (
                  <a href="#contact" className="mt-1 inline-block text-xs font-bold text-gold">Enquire for Admission →</a>
                )}
              </div>

              <p className="text-center font-hand text-[11px] text-ink-2">
                keep scrolling to explore full courses ↓
              </p>
            </PaperFace>
          </div>

          {/* LEAF 3: Chapter 03 Foundation */}
          <Leaf
            progress={progress}
            range={FLIPS[3]}
            z={2}
            front={
              <PaperFace>
                <div className="flex items-center justify-between border-b border-ink/10 pb-1">
                  <span className="font-hand text-base text-gold font-bold">ch. 03</span>
                  <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-ink border border-gold/40">
                    Class 6th – 10th
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-[24px] sm:text-[28px] font-[900] leading-none text-ink">Foundation</h3>
                  <p className="mt-0.5 font-hand text-[12px] sm:text-[13px] text-ink-2 font-semibold">Pre-Engineering & Pre-Medical Base</p>
                </div>

                <div className="space-y-1 my-0.5">
                  <Feature>Strong Maths & Science Core Fundamentals</Feature>
                  <Feature>NTSE & Olympiads (IMO, NSO) Training</Feature>
                  <Feature>School Board (CBSE/ICSE) 95%+ Target</Feature>
                  <Feature>Mental Ability & Logical IQ Exercises</Feature>
                  <Feature>Weekly Tests + Parent Progress Reports</Feature>
                  <Feature>Early Study Habits for Competitive Exams</Feature>
                </div>

                <div className="rounded bg-paper border border-ink/10 p-1.5 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-wider text-ink-3">Target Boards</p>
                    <p className="text-[10px] font-extrabold text-ink">CBSE • ICSE • State</p>
                  </div>
                  <span className="font-hand text-[12px] text-gold font-bold">one step at a time ★</span>
                </div>
              </PaperFace>
            }
          />

          {/* LEAF 2: Chapter 02 JEE Main + Advanced */}
          <Leaf
            progress={progress}
            range={FLIPS[2]}
            z={3}
            front={
              <PaperFace>
                <div className="flex items-center justify-between border-b border-ink/10 pb-1">
                  <span className="font-hand text-base text-gold font-bold">ch. 02</span>
                  <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-ink border border-gold/40">
                    Target: Top 1000 AIR
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-[24px] sm:text-[28px] font-[900] leading-none text-ink">JEE Main & Adv.</h3>
                  <p className="mt-0.5 font-hand text-[12px] sm:text-[13px] text-ink-2 font-semibold">Physics · Chemistry · Mathematics</p>
                </div>

                {/* Formula Bar */}
                <div className="rounded bg-gold-soft/50 border border-gold/30 px-2 py-0.5 text-[9.5px] sm:text-[10.5px] font-mono text-ink tracking-tight flex items-center justify-between">
                  <span>F = m·a</span>
                  <span className="text-gold">•</span>
                  <span>PV = nRT</span>
                  <span className="text-gold">•</span>
                  <span>e^(iπ)+1 = 0</span>
                  <span className="text-gold">•</span>
                  <span>∫ sin x</span>
                </div>

                <div className="space-y-1 my-0.5">
                  <Feature>Concepts &gt; Rote Learning Approach</Feature>
                  <Feature>15 Years PYQ Chapterwise Breakdown</Feature>
                  <Feature>Online CBT Mock Test Interface</Feature>
                  <Feature>Advanced Multi-Concept Problem Drills</Feature>
                  <Feature>Speed & Accuracy Negative-Mark Control</Feature>
                  <Feature>Direct Mentorship by IITian Faculty</Feature>
                </div>

                <div className="rounded bg-paper border border-ink/10 p-1.5 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-wider text-ink-3">Dream Target</p>
                    <p className="text-[10px] font-extrabold text-ink">Gateway to IITs & NITs 🚀</p>
                  </div>
                  <span className="font-hand text-[12px] text-gold font-bold">99+ %ile batch</span>
                </div>
              </PaperFace>
            }
          />

          {/* LEAF 1: Chapter 01 NEET (UG) */}
          <Leaf
            progress={progress}
            range={FLIPS[1]}
            z={4}
            front={
              <PaperFace>
                <div className="flex items-center justify-between border-b border-ink/10 pb-1">
                  <span className="font-hand text-base text-gold font-bold">ch. 01</span>
                  <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-ink border border-gold/40">
                    Target: 680+ / 720
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-[24px] sm:text-[28px] font-[900] leading-none text-ink">NEET (UG)</h3>
                  <p className="mt-0.5 font-hand text-[12px] sm:text-[13px] text-ink-2 font-semibold">Physics · Chemistry · Biology</p>
                </div>

                <div className="space-y-1 my-0.5">
                  <Feature>100% NCERT Line-by-Line Mastery</Feature>
                  <Feature>15,000+ Topicwise Practice Questions</Feature>
                  <Feature>Daily DPPs with Video Explanations</Feature>
                  <Feature>All India Mock Test Series (AITS)</Feature>
                  <Feature>High-Yield Bio Diagrams & Flowcharts</Feature>
                  <Feature>1-on-1 Doctor & Faculty Doubt Support</Feature>
                </div>

                <div className="rounded bg-paper border border-ink/10 p-1.5 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-wider text-ink-3">Batches</p>
                    <p className="text-[10px] font-extrabold text-ink">11th, 12th & Repeaters</p>
                  </div>
                  <span className="font-hand text-[12px] text-gold font-bold">future doctors ♥</span>
                </div>
              </PaperFace>
            }
          />

          {/* LEAF 0: Leather Cover */}
          <Leaf
            progress={progress}
            range={FLIPS[0]}
            z={5}
            front={
              <div className="leather absolute inset-0 flex flex-col items-center justify-between rounded-r-md p-4 sm:p-5 text-center shadow-inner">
                <div className="absolute inset-2 rounded border border-gold/40 pointer-events-none" />

                {/* Top Badge */}
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-navy-light/60 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-gold-soft border border-gold/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                    Admissions Open
                  </span>
                </div>

                {/* Center Content */}
                <div className="flex flex-col items-center my-auto">
                  <img src="/uploads/logo.png" alt="Root Career Institute" className="h-14 w-14 sm:h-18 sm:w-18 drop-shadow-[0_6px_12px_rgba(0,0,0,0.5)]" />
                  <p className="gold-foil mt-2.5 font-display text-[19px] sm:text-[22px] font-[900] uppercase leading-tight tracking-wide">{name}</p>
                  <p className="mt-1 font-hand text-[13px] sm:text-[15px] text-gold-soft/90">Build Your Career. Shape Your Future.</p>

                  <div className="mt-2.5 grid grid-cols-2 gap-1.5 w-full text-left">
                    <div className="rounded bg-navy-light/40 border border-gold/25 px-2 py-1">
                      <p className="text-[7.5px] font-bold uppercase text-gold-2 tracking-wider">Courses</p>
                      <p className="text-[9.5px] font-bold text-paper">NEET • JEE • Found.</p>
                    </div>
                    <div className="rounded bg-navy-light/40 border border-gold/25 px-2 py-1">
                      <p className="text-[7.5px] font-bold uppercase text-gold-2 tracking-wider">Batches</p>
                      <p className="text-[9.5px] font-bold text-paper">6th–12th + Dropper</p>
                    </div>
                  </div>
                </div>

                {/* Bottom */}
                <div className="pb-1">
                  <p className="font-hand text-[11px] sm:text-[12px] text-gold-soft/80">this notebook belongs to: future topper ✓</p>
                  <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.2em] text-gold-2/70">scroll down to open notebook ↓</p>
                </div>
              </div>
            }
            back={<div className="leather absolute inset-0" />}
          />

          {/* Gold Spiral Binding */}
          <div className="absolute -left-2 top-[3%] bottom-[3%] z-10 flex flex-col justify-between" style={{ transform: 'translateZ(2px)' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="block h-2.5 w-4 rounded-full border-2 border-gold-2 bg-transparent shadow-sm" />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function FloatIcon({ progress, x, y, f, children }: { progress: MotionValue<number>; x: string; y: string; f: number; children: ReactNode }) {
  const ty = useTransform(progress, [0, 0.88], [0, f * 3]);
  const op = useTransform(progress, [0, 0.78, 0.92], [1, 0.9, 0]);
  return (
    <motion.div className="hidden sm:block absolute" style={{ left: x, top: y, y: ty, opacity: op }}>
      {children}
    </motion.div>
  );
}
