import { motion, useTransform, type MotionValue } from 'framer-motion';
import type { ReactNode } from 'react';
import { Atom, BookOpen, Calculator, GraduationCap, PencilLine, Ruler, Sigma, FlaskConical, Check } from 'lucide-react';

const FLIPS = [
  [0.1, 0.24],
  [0.26, 0.4],
  [0.42, 0.56],
  [0.58, 0.72],
];

function Leaf({ progress, range, z, front, back }: { progress: MotionValue<number>; range: number[]; z: number; front: ReactNode; back?: ReactNode }) {
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
      className={`absolute inset-0 px-[9%] pt-[12%] ${className}`}
      style={{
        backgroundColor: '#fbf9f3',
        backgroundImage:
          'linear-gradient(to right, transparent 13%, rgba(222,110,110,0.45) 13%, rgba(222,110,110,0.45) calc(13% + 1px), transparent calc(13% + 1px)), repeating-linear-gradient(to bottom, transparent 0, transparent 21px, rgba(108,140,196,0.25) 21px, rgba(108,140,196,0.25) 22px), linear-gradient(to right, rgba(20,26,60,0.1), transparent 12%)',
      }}
    >
      <div className="pl-[8%]">{children}</div>
    </div>
  );
}

const Tick = ({ children }: { children: ReactNode }) => (
  <li className="flex items-center gap-1.5">
    <Check className="h-4 w-4 shrink-0 text-gold" strokeWidth={3} />
    {children}
  </li>
);

export default function HeroCSS({ progress, name, phone }: { progress: MotionValue<number>; name: string; phone: string }) {
  const rotateX = useTransform(progress, [0, 0.12], [26, 6]);
  const rotateZ = useTransform(progress, [0, 0.12], [-6, 0]);
  const scale = useTransform(progress, [0, 0.12, 0.74, 0.86], [0.9, 1, 1, 1.25]);
  const nbOpacity = useTransform(progress, [0.78, 0.87], [1, 0]);
  const liftY = useTransform(progress, [0, 0.12], [40, 0]);

  const icons = [
    { I: PencilLine, x: '8%', y: '22%', f: -60, r: '-12deg', d: '6s' },
    { I: Calculator, x: '82%', y: '20%', f: -90, r: '10deg', d: '7s' },
    { I: GraduationCap, x: '76%', y: '74%', f: -40, r: '-8deg', d: '5.5s' },
    { I: BookOpen, x: '6%', y: '72%', f: -80, r: '8deg', d: '6.5s' },
    { I: Atom, x: '88%', y: '46%', f: -120, r: '0deg', d: '8s' },
    { I: Sigma, x: '4%', y: '46%', f: -100, r: '-6deg', d: '7.5s' },
    { I: Ruler, x: '46%', y: '88%', f: -50, r: '14deg', d: '6s' },
    { I: FlaskConical, x: '52%', y: '14%', f: -70, r: '-10deg', d: '6.8s' },
  ];

  return (
    <div className="absolute inset-0">
      {icons.map(({ I, x, y, f, r, d }, i) => (
        <FloatIcon key={i} progress={progress} x={x} y={y} f={f}>
          <div className="floaty flex h-11 w-11 items-center justify-center rounded-2xl border border-ink/10 bg-card shadow-[0_10px_24px_-10px_rgba(20,26,60,0.35)]" style={{ ['--r' as string]: r, ['--d' as string]: d }}>
            <I className={`h-5 w-5 ${i % 2 ? 'text-gold' : 'text-ink'}`} strokeWidth={1.7} />
          </div>
        </FloatIcon>
      ))}

      <div className="absolute inset-0 flex items-center justify-center pt-[26svh] pb-[18svh] md:pt-24 md:pb-24" style={{ perspective: 1600 }}>
        <motion.div
          className="relative aspect-[3/4] w-[min(66vw,330px,36svh)] sm:w-[min(52vw,360px,46svh)]"
          style={{ rotateX, rotateZ, scale, y: liftY, opacity: nbOpacity, transformStyle: 'preserve-3d' }}
        >
          {/* back cover + page block */}
          <div className="absolute -inset-[3%] left-[-2%] rounded-lg bg-navy shadow-[0_30px_60px_-20px_rgba(15,22,64,0.55)]" style={{ transform: 'translateZ(-6px)' }} />
          <div className="absolute inset-0 translate-x-[3px] translate-y-[3px] rounded-r-md bg-[#efe8d6]" style={{ transform: 'translateZ(-3px)' }} />

          {/* base page */}
          <div className="absolute inset-0 overflow-hidden rounded-r-md">
            <PaperFace>
              <p className="font-hand text-lg text-gold">chapter 04</p>
              <h3 className="font-display text-[26px] font-[900] leading-none text-ink">Admissions</h3>
              <h3 className="font-display text-[22px] italic text-gold">Open Now</h3>
              <p className="mt-3 font-hand text-[19px] leading-[22px] text-ink">New batches for 2026–27.<br />Limited seats in every batch.</p>
              {phone && <p className="mt-4 font-display text-lg font-[800] text-ink">{phone}</p>}
              <p className="mt-3 font-hand text-lg text-ink-2">keep scrolling ↓</p>
            </PaperFace>
          </div>

          <Leaf
            progress={progress}
            range={FLIPS[3]}
            z={2}
            front={
              <PaperFace>
                <p className="font-hand text-lg text-gold">chapter 03</p>
                <h3 className="font-display text-[30px] font-[900] leading-none text-ink">Foundation</h3>
                <p className="font-hand text-xl text-gold">Class 6th – 10th</p>
                <ul className="mt-2 space-y-0 font-hand text-[19px] leading-[22px] text-ink">
                  <Tick>Strong Maths & Science</Tick>
                  <Tick>Olympiad & NTSE prep</Tick>
                  <Tick>Board exam excellence</Tick>
                </ul>
              </PaperFace>
            }
          />
          <Leaf
            progress={progress}
            range={FLIPS[2]}
            z={3}
            front={
              <PaperFace>
                <p className="font-hand text-lg text-gold">chapter 02</p>
                <h3 className="font-display text-[42px] font-[900] leading-none text-ink">JEE</h3>
                <p className="font-display text-sm italic text-ink-2">Main + Advanced</p>
                <div className="mt-2 font-hand text-[20px] leading-[22px] text-ink">
                  <p>F = m · a</p>
                  <p>PV = nRT</p>
                  <p className="text-gold">e^(iπ) + 1 = 0</p>
                  <p className="mt-1">concepts &gt; rote learning</p>
                </div>
              </PaperFace>
            }
          />
          <Leaf
            progress={progress}
            range={FLIPS[1]}
            z={4}
            front={
              <PaperFace>
                <p className="font-hand text-lg text-gold">chapter 01</p>
                <h3 className="font-display text-[42px] font-[900] leading-none text-ink">NEET</h3>
                <p className="font-hand text-lg text-ink-2">Physics · Chemistry · Biology</p>
                <ul className="mt-1 font-hand text-[19px] leading-[22px] text-ink">
                  <Tick>NCERT line-by-line</Tick>
                  <Tick>Daily practice papers</Tick>
                  <Tick>Full-length mock tests</Tick>
                </ul>
                <p className="mt-2 inline-block rounded-full border-2 border-ink/50 px-3 font-hand text-xl text-gold">target: 650+</p>
              </PaperFace>
            }
          />
          <Leaf
            progress={progress}
            range={FLIPS[0]}
            z={5}
            front={
              <div className="leather absolute inset-0 flex flex-col items-center justify-center rounded-r-md p-6 text-center">
                <div className="absolute inset-3 rounded border border-gold/40" />
                <img src="/uploads/logo.png" alt="Root Career Institute" className="h-24 w-24 drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]" />
                <p className="gold-foil mt-4 font-display text-[22px] font-[900] uppercase leading-tight tracking-wide">{name}</p>
                <p className="mt-2 font-hand text-lg text-gold-soft/90">Build Your Career. Shape Your Future.</p>
                <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.25em] text-gold-soft/70">NEET • JEE • Foundation</p>
              </div>
            }
            back={<div className="leather absolute inset-0" />}
          />

          {/* spiral */}
          <div className="absolute -left-2 top-[4%] bottom-[4%] z-10 flex flex-col justify-between" style={{ transform: 'translateZ(2px)' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="block h-2.5 w-5 rounded-full border-2 border-gold-2 bg-transparent shadow-sm" />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function FloatIcon({ progress, x, y, f, children }: { progress: MotionValue<number>; x: string; y: string; f: number; children: ReactNode }) {
  const ty = useTransform(progress, [0, 0.8], [0, f * 3]);
  const op = useTransform(progress, [0, 0.7, 0.82], [1, 0.9, 0]);
  return (
    <motion.div className="absolute" style={{ left: x, top: y, y: ty, opacity: op }}>
      {children}
    </motion.div>
  );
}
