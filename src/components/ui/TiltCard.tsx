import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, type ReactNode, type CSSProperties } from 'react';

export default function TiltCard({
  children,
  className = '',
  max = 9,
  style,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const hover = useMotionValue(0);
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 180, damping: 18 });
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 180, damping: 18 });
  const lift = useSpring(hover, { stiffness: 200, damping: 20 });
  const z = useTransform(lift, [0, 1], [0, 30]);
  const glare = useTransform([px, py], ([x, y]) => `radial-gradient(circle at ${(x as number) * 100}% ${(y as number) * 100}%, rgba(255,255,255,0.55), transparent 55%)`);
  const glareOpacity = useTransform(lift, [0, 1], [0, 0.7]);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerEnter={(e) => e.pointerType === 'mouse' && hover.set(1)}
      onPointerLeave={() => {
        hover.set(0);
        px.set(0.5);
        py.set(0.5);
      }}
      style={{ rotateX: rx, rotateY: ry, z, transformPerspective: 1000, transformStyle: 'preserve-3d', ...style }}
      className={`relative will-change-transform ${className}`}
    >
      {children}
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-soft-light" style={{ background: glare, opacity: glareOpacity }} />
    </motion.div>
  );
}
