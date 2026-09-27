import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffect, useMemo, useRef, type MutableRefObject, type ReactNode } from 'react';
import { PageTexture, buildPages, labelTexture, rulerTexture, stripesTexture, type PageKey } from './textures';

type Ref<T> = MutableRefObject<T>;
type Props = {
  progress: Ref<number>;
  mouse: Ref<{ x: number; y: number }>;
  active: boolean;
  name: string;
  phone: string;
  onReady?: () => void;
};

const W = 3;
const H = 4;
const COVER = 0.05;
const STACK = 0.1;
const Y_TOP = COVER + STACK;
const SEG = 28;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = (a: number, b: number, v: number) => ease(clamp01((v - a) / (b - a)));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ------------------------------------------------------------------ */
/* Camera rig                                                          */
/* ------------------------------------------------------------------ */
function Rig({ progress, mouse, sp }: { progress: Ref<number>; mouse: Ref<{ x: number; y: number }>; sp: Ref<number> }) {
  const { camera, size } = useThree();
  const tmpPos = useMemo(() => new THREE.Vector3(), []);
  const tmpTgt = useMemo(() => new THREE.Vector3(), []);
  const sm = useRef({ x: 0, y: 0 });

  useEffect(() => {
    camera.up.set(0, 0, -1);
  }, [camera]);

  useFrame((state, dt) => {
    const k = 1 - Math.exp(-Math.min(dt, 0.05) * 16);
    sp.current += (progress.current - sp.current) * k;
    const p = sp.current;
    const aspect = size.width / size.height;
    const f = Math.min(1.85, Math.max(1, 1.35 / Math.max(0.72, aspect)));
    const fovT = Math.tan(THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov / 2)) * 2;
    const dFinal = Math.min(W / (fovT * Math.max(0.72, aspect)), H / fovT) * 0.9;

    const K = [
      { p: 0, pos: [0, 6.4 * f, 10.8 * f], tgt: [0, 0.9, -2.5] },
      { p: 0.15, pos: [0, 6.6 * f, 8.2 * f], tgt: [0, 0.45, -1.1] },
      { p: 0.32, pos: [0, 6.9 * f, 5.6 * f], tgt: [0, 0, 0.15] },
      { p: 0.78, pos: [0.2, 7.1 * f, 4.6 * f], tgt: [0.1, 0, 0.2] },
      { p: 0.94, pos: [W / 2, dFinal, 0.001], tgt: [W / 2, 0, 0] },
    ];
    let i = 0;
    while (i < K.length - 2 && p > K[i + 1].p) i++;
    const a = K[i];
    const b = K[i + 1];
    const t = ease(clamp01((p - a.p) / (b.p - a.p)));
    tmpPos.set(lerp(a.pos[0], b.pos[0], t), lerp(a.pos[1], b.pos[1], t), lerp(a.pos[2], b.pos[2], t));
    tmpTgt.set(lerp(a.tgt[0], b.tgt[0], t), lerp(a.tgt[1], b.tgt[1], t), lerp(a.tgt[2], b.tgt[2], t));

    const free = 1 - smooth(0.76, 0.92, p);
    const km = 1 - Math.exp(-Math.min(dt, 0.05) * 10);
    sm.current.x += (mouse.current.x - sm.current.x) * km;
    sm.current.y += (mouse.current.y - sm.current.y) * km;
    const time = state.clock.elapsedTime;
    tmpPos.x += (sm.current.x * 0.9 + Math.sin(time * 0.25) * 0.3) * free;
    tmpPos.y += (sm.current.y * 0.45 + Math.sin(time * 0.33) * 0.12) * free;
    tmpTgt.x += sm.current.x * 0.15 * free;
    camera.position.copy(tmpPos);
    camera.lookAt(tmpTgt);
  });
  return null;
}

/* ------------------------------------------------------------------ */
/* Notebook                                                            */
/* ------------------------------------------------------------------ */
function makePageGeometry() {
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array((SEG + 1) * 2 * 3);
  const uv = new Float32Array((SEG + 1) * 2 * 2);
  const idx: number[] = [];
  for (let i = 0; i <= SEG; i++) {
    const x = (i / SEG) * W;
    pos.set([x, 0, -H / 2], i * 6);
    pos.set([x, 0, H / 2], i * 6 + 3);
    uv.set([i / SEG, 1], i * 4);
    uv.set([i / SEG, 0], i * 4 + 2);
    if (i < SEG) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function bendPage(g: THREE.BufferGeometry, theta: number, baseY: number) {
  const pos = g.attributes.position as THREE.BufferAttribute;
  const arr = pos.array as Float32Array;
  const seg = W / SEG;
  const curl = Math.sin(theta) * 0.7;
  let x = 0;
  let y = 0;
  for (let i = 0; i <= SEG; i++) {
    arr[i * 6] = x;
    arr[i * 6 + 1] = baseY + y;
    arr[i * 6 + 3] = x;
    arr[i * 6 + 4] = baseY + y;
    const a = theta - curl * (i / SEG);
    x += Math.cos(a) * seg;
    y += Math.sin(a) * seg;
  }
  pos.needsUpdate = true;
  g.computeVertexNormals();
}

function Notebook({ sp, name, phone }: { sp: Ref<number>; name: string; phone: string }) {
  const { gl } = useThree();
  const left = useRef<THREE.Group>(null);
  const clock = useRef(0);
  const aniso = gl.capabilities.getMaxAnisotropy();

  const tex = useMemo(() => {
    const pages = buildPages({ name, phone });
    const mk = (k: PageKey, mirror = false) => new PageTexture(pages[k].items, pages[k].side, mirror, aniso);
    return {
      leftBase: mk('leftBase'),
      p0f: mk('p0f'),
      p0b: mk('p0b', true),
      p1f: mk('p1f'),
      p1b: mk('p1b', true),
      p2f: mk('p2f'),
      p2b: mk('p2b', true),
      rightBase: mk('rightBase'),
    };
  }, [name, phone, aniso]);

  const geos = useMemo(() => [makePageGeometry(), makePageGeometry(), makePageGeometry()], []);
  const lastTheta = useRef([-1, -1, -1]);
  const stripes = useMemo(() => stripesTexture(), []);

  useEffect(() => {
    let alive = true;
    const redraw = () => {
      if (!alive) return;
      Object.values(tex).forEach((t) => t.draw(t.last < 0 ? 0 : t.last, true));
    };
    redraw();
    document.fonts?.ready.then(redraw);
    return () => {
      alive = false;
      Object.values(tex).forEach((t) => t.dispose());
    };
  }, [tex]);

  useEffect(() => () => geos.forEach((g) => g.dispose()), [geos]);

  const leather = useMemo(() => new THREE.MeshStandardMaterial({ color: '#141b48', roughness: 0.55, metalness: 0.05 }), []);
  const edge = useMemo(() => new THREE.MeshStandardMaterial({ map: stripes, roughness: 0.95 }), [stripes]);
  const paperTop = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f7f3e8', roughness: 1 }), []);
  const stackMats = useMemo(() => [edge, edge, paperTop, paperTop, edge, edge], [edge, paperTop]);

  const pageMats = useMemo(
    () =>
      [
        [tex.p0f, tex.p0b],
        [tex.p1f, tex.p1b],
        [tex.p2f, tex.p2b],
      ].map(([f, b]) => ({
        front: new THREE.MeshStandardMaterial({ map: f.tex, roughness: 1, side: THREE.FrontSide }),
        back: new THREE.MeshStandardMaterial({ map: b.tex, roughness: 1, side: THREE.BackSide }),
      })),
    [tex]
  );
  const baseMats = useMemo(
    () => ({
      left: new THREE.MeshStandardMaterial({ map: tex.leftBase.tex, roughness: 1 }),
      right: new THREE.MeshStandardMaterial({ map: tex.rightBase.tex, roughness: 1 }),
    }),
    [tex]
  );

  const ringGeo = useMemo(() => new THREE.TorusGeometry(0.17, 0.02, 10, 28), []);
  const ringMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d4a53a', metalness: 0.55, roughness: 0.3 }), []);
  const rings = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    if (!rings.current) return;
    const m = new THREE.Matrix4();
    for (let i = 0; i < 16; i++) {
      m.makeTranslation(0, Y_TOP * 0.75, -1.8 + (i * 3.6) / 15);
      rings.current.setMatrixAt(i, m);
    }
    rings.current.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame((_, dt) => {
    clock.current += dt;
    const p = sp.current;
    const intro = clamp01(clock.current / 2.4);

    // the notebook lies open
    const open = smooth(0.03, 0.24, p);
    if (left.current) left.current.rotation.z = -(1 - open) * 1.05;

    // page turns - tuned so NEET & JEE (page 0 back + page 1 front) stay open & visible for much longer
    const PAGE_RANGES: [number, number][] = [
      [0.26, 0.38], // Page 0 flips: opens NEET (left) and JEE (right)
      [0.58, 0.68], // Page 1 flips: NEET & JEE stay open and flat from 0.38 to 0.58!
      [0.76, 0.85], // Page 2 flips: Foundation & Admissions stay open from 0.68 to 0.76
    ];

    for (let i = 0; i < 3; i++) {
      const [start, end] = PAGE_RANGES[i];
      const t = smooth(start, end, p);
      const theta = t * Math.PI;
      if (Math.abs(theta - lastTheta.current[i]) > 0.001) {
        lastTheta.current[i] = theta;
        const rightY = Y_TOP + 0.012 - i * 0.004;
        const leftY = Y_TOP + 0.004 + i * 0.004;
        bendPage(geos[i], theta, lerp(rightY, leftY, t) + Math.sin(theta) * 0.02);
      }
    }

    // handwriting reveals
    tex.leftBase.draw(Math.max(intro, open));
    tex.p0f.draw(Math.max(clamp01((clock.current - 0.8) / 2.6), smooth(0.06, 0.22, p)));
    const r1 = smooth(0.28, 0.42, p);
    tex.p0b.draw(r1);
    tex.p1f.draw(r1);
    const r2 = smooth(0.58, 0.70, p);
    tex.p1b.draw(r2);
    tex.p2f.draw(r2);
    tex.p2b.draw(smooth(0.76, 0.86, p));
    tex.rightBase.draw(1);
  });

  return (
    <group>
      {/* right half: back cover, stack, base page */}
      <mesh material={leather} position={[W / 2 + 0.04, COVER / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W + 0.1, COVER, H + 0.18]} />
      </mesh>
      <mesh material={stackMats} position={[W / 2, COVER + STACK / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W - 0.02, STACK, H]} />
      </mesh>
      <mesh material={baseMats.right} position={[W / 2, Y_TOP + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W - 0.02, H]} />
      </mesh>

      {/* left half hinges at the spine */}
      <group ref={left}>
        <mesh material={leather} position={[-W / 2 - 0.04, COVER / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[W + 0.1, COVER, H + 0.18]} />
        </mesh>
        <mesh material={stackMats} position={[-W / 2, COVER + STACK / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[W - 0.02, STACK, H]} />
        </mesh>
        <mesh material={baseMats.left} position={[-W / 2, Y_TOP + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[W - 0.02, H]} />
        </mesh>
      </group>

      {/* turning pages */}
      {geos.map((g, i) => (
        <group key={i}>
          <mesh geometry={g} material={pageMats[i].front} frustumCulled={false} castShadow receiveShadow />
          <mesh geometry={g} material={pageMats[i].back} frustumCulled={false} receiveShadow />
        </group>
      ))}

      <instancedMesh ref={rings} args={[ringGeo, ringMat, 16]} castShadow />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Floating props                                                      */
/* ------------------------------------------------------------------ */
type V3 = [number, number, number];
function Floaty({
  sp,
  a,
  b,
  ra,
  rb,
  speed = 1,
  amp = 0.18,
  phase = 0,
  children,
}: {
  sp: Ref<number>;
  a: V3;
  b: V3;
  ra: V3;
  rb: V3;
  speed?: number;
  amp?: number;
  phase?: number;
  children: ReactNode;
}) {
  const g = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!g.current) return;
    const p = sp.current;
    const s = smooth(0.1 + phase * 0.02, 0.5 + phase * 0.02, p);
    const out = smooth(0.82, 0.95, p);
    const t = state.clock.elapsedTime * speed + phase * 1.7;
    const bob = Math.sin(t) * amp * (1 - s * 0.85);
    g.current.position.set(
      lerp(a[0], b[0], s) * (1 + out * 0.5),
      lerp(a[1], b[1], s) + bob,
      lerp(a[2], b[2], s) * (1 + out * 0.3)
    );
    const w = (1 - s * 0.9) * 0.12;
    g.current.rotation.set(
      lerp(ra[0], rb[0], s) + Math.sin(t * 0.7) * w,
      lerp(ra[1], rb[1], s) + Math.cos(t * 0.5) * w,
      lerp(ra[2], rb[2], s) + Math.sin(t * 0.6) * w
    );
  });
  return <group ref={g}>{children}</group>;
}

const M = {
  navy: new THREE.MeshStandardMaterial({ color: '#141b48', roughness: 0.45, metalness: 0.1 }),
  gold: new THREE.MeshStandardMaterial({ color: '#d6a73a', roughness: 0.3, metalness: 0.6 }),
  yellow: new THREE.MeshStandardMaterial({ color: '#e7b53c', roughness: 0.55 }),
  wood: new THREE.MeshStandardMaterial({ color: '#e9cfa6', roughness: 0.8 }),
  lead: new THREE.MeshStandardMaterial({ color: '#2a2d3a', roughness: 0.5 }),
  steel: new THREE.MeshStandardMaterial({ color: '#b9bcc4', roughness: 0.3, metalness: 0.7 }),
  eraser: new THREE.MeshStandardMaterial({ color: '#e59a9a', roughness: 0.8 }),
  cream: new THREE.MeshStandardMaterial({ color: '#f5efdf', roughness: 0.95 }),
  maroon: new THREE.MeshStandardMaterial({ color: '#7e2a35', roughness: 0.6 }),
  dark: new THREE.MeshStandardMaterial({ color: '#1d2240', roughness: 0.5 }),
  key: new THREE.MeshStandardMaterial({ color: '#343a60', roughness: 0.5 }),
};

function Pencil() {
  return (
    <group>
      <mesh material={M.yellow} castShadow>
        <cylinderGeometry args={[0.075, 0.075, 1.5, 6]} />
      </mesh>
      <mesh material={M.wood} position={[0, 0.86, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.075, 0.22, 6]} />
      </mesh>
      <mesh material={M.lead} position={[0, 0.99, 0]}>
        <coneGeometry args={[0.02, 0.06, 6]} />
      </mesh>
      <mesh material={M.steel} position={[0, -0.82, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.14, 12]} />
      </mesh>
      <mesh material={M.eraser} position={[0, -0.95, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.075, 0.13, 12]} />
      </mesh>
    </group>
  );
}

function Pen() {
  return (
    <group>
      <mesh material={M.navy} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 1.3, 20]} />
      </mesh>
      <mesh material={M.gold} position={[0, 0.72, 0]} castShadow>
        <coneGeometry args={[0.06, 0.16, 20]} />
      </mesh>
      <mesh material={M.gold} position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.064, 0.064, 0.05, 20]} />
      </mesh>
      <mesh material={M.gold} position={[0.07, -0.25, 0]} castShadow>
        <boxGeometry args={[0.02, 0.5, 0.04]} />
      </mesh>
    </group>
  );
}

function Book({ cover, w = 1.5, d = 1.05, h = 0.2 }: { cover: THREE.Material; w?: number; d?: number; h?: number }) {
  return (
    <group>
      <mesh material={cover} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
      </mesh>
      <mesh material={M.cream} position={[0.03, 0, 0]}>
        <boxGeometry args={[w - 0.02, h * 0.8, d - 0.06]} />
      </mesh>
      <mesh material={M.gold} position={[-w / 2 + 0.12, 0, 0]}>
        <boxGeometry args={[0.03, h + 0.004, d + 0.004]} />
      </mesh>
    </group>
  );
}

function Calculator() {
  const screen = useMemo(() => labelTexture('3.14159', { w: 256, h: 96, bg: '#c9d3bf', color: '#1d2240', font: '700 58px Manrope, sans-serif' }), []);
  const keys = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    if (!keys.current) return;
    const m = new THREE.Matrix4();
    let n = 0;
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 4; c++) {
        m.makeTranslation(-0.3 + c * 0.2, 0.065, -0.12 + r * 0.17);
        keys.current.setMatrixAt(n++, m);
      }
    keys.current.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <group>
      <mesh material={M.dark} castShadow receiveShadow>
        <boxGeometry args={[0.95, 0.1, 1.35]} />
      </mesh>
      <mesh position={[0, 0.052, -0.43]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.75, 0.28]} />
        <meshStandardMaterial map={screen} roughness={0.6} />
      </mesh>
      <instancedMesh ref={keys} args={[undefined, M.key, 20]}>
        <boxGeometry args={[0.15, 0.04, 0.12]} />
      </instancedMesh>
      <mesh material={M.gold} position={[0.3, 0.07, 0.56]}>
        <boxGeometry args={[0.15, 0.04, 0.12]} />
      </mesh>
    </group>
  );
}

function GradCap() {
  return (
    <group>
      <mesh material={M.navy} rotation={[0, Math.PI / 4, 0]} castShadow>
        <boxGeometry args={[1.1, 0.05, 1.1]} />
      </mesh>
      <mesh material={M.navy} position={[0, -0.18, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.42, 0.32, 24, 1, true]} />
      </mesh>
      <mesh material={M.gold} position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.04, 12]} />
      </mesh>
      <mesh material={M.gold} position={[0.38, -0.12, 0.38]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.36, 6]} />
      </mesh>
      <mesh material={M.gold} position={[0.38, -0.33, 0.38]}>
        <coneGeometry args={[0.05, 0.14, 10]} />
      </mesh>
      <mesh material={M.gold} position={[0.19, 0.035, 0.19]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.54, 0.012, 0.02]} />
      </mesh>
    </group>
  );
}

function Sticky({ text, color = '#f4dd8a' }: { text: string; color?: string }) {
  const map = useMemo(() => labelTexture(text, { bg: color, lines: true, font: '700 60px Caveat, cursive' }), [text, color]);
  return (
    <mesh castShadow rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.85, 0.85]} />
      <meshStandardMaterial map={map} roughness={0.9} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Atom() {
  return (
    <group>
      <mesh material={M.gold} castShadow>
        <sphereGeometry args={[0.13, 20, 20]} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} material={M.navy} rotation={[Math.PI / 2, (i * Math.PI) / 3, 0]}>
          <torusGeometry args={[0.45, 0.014, 8, 48]} />
        </mesh>
      ))}
    </group>
  );
}

function Ruler() {
  const map = useMemo(() => rulerTexture(), []);
  return (
    <mesh castShadow receiveShadow>
      <boxGeometry args={[2.4, 0.03, 0.38]} />
      <meshStandardMaterial attach="material-0" color="#e8d59c" />
      <meshStandardMaterial attach="material-1" color="#e8d59c" />
      <meshStandardMaterial attach="material-2" map={map} roughness={0.7} />
      <meshStandardMaterial attach="material-3" color="#e8d59c" />
      <meshStandardMaterial attach="material-4" color="#e8d59c" />
      <meshStandardMaterial attach="material-5" color="#e8d59c" />
    </mesh>
  );
}

function MathSymbol({ sp, ch, pos, gold = false, size = 0.7, phase = 0 }: { sp: Ref<number>; ch: string; pos: V3; gold?: boolean; size?: number; phase?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useMemo(() => {
    const map = labelTexture(ch, { w: 256, h: 256, color: gold ? '#c6961f' : '#1b2150', font: '600 170px Fraunces, Georgia, serif' });
    return new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false });
  }, [ch, gold]);
  const { camera } = useThree();
  useFrame((state) => {
    if (!ref.current) return;
    const p = sp.current;
    const t = state.clock.elapsedTime * 0.6 + phase;
    const drift = smooth(0.1, 0.6, p);
    ref.current.position.set(pos[0] * (1 + drift * 0.35), pos[1] + Math.sin(t) * 0.2 + drift * 1.5, pos[2] + Math.cos(t * 0.8) * 0.12);
    ref.current.quaternion.copy(camera.quaternion);
    mat.opacity = (0.85 - drift * 0.55) * (1 - smooth(0.76, 0.88, p));
  });
  return (
    <mesh ref={ref} material={mat}>
      <planeGeometry args={[size, size]} />
    </mesh>
  );
}

function Props({ sp }: { sp: Ref<number> }) {
  const books = useMemo(() => [M.navy, M.maroon, M.cream], []);
  return (
    <>
      <Floaty sp={sp} a={[-4.4, 1.9, 0.6]} b={[-3.75, 0.08, 1.1]} ra={[0.4, 0.3, 0.9]} rb={[0, 0.35, Math.PI / 2]} speed={0.9} phase={0}>
        <Pencil />
      </Floaty>
      <Floaty sp={sp} a={[4.1, 2.4, -1.0]} b={[3.55, 0.08, 0.9]} ra={[-0.3, 0.2, -0.8]} rb={[0, -0.12, Math.PI / 2]} speed={1.1} phase={1}>
        <Pencil />
      </Floaty>
      <Floaty sp={sp} a={[-2.4, 2.9, 2.5]} b={[3.6, 0.07, -0.4]} ra={[0.9, 0.2, 0.4]} rb={[0, 0.1, Math.PI / 2]} speed={0.8} phase={2}>
        <Pen />
      </Floaty>
      <Floaty sp={sp} a={[4.9, 0.7, -2.6]} b={[4.5, 0.1, -2.2]} ra={[0, -0.4, 0.05]} rb={[0, -0.2, 0]} speed={0.6} amp={0.1} phase={3}>
        <group>
          <group position={[0, 0, 0]} rotation={[0, 0.1, 0]}>
            <Book cover={books[0]} />
          </group>
          <group position={[0.05, 0.21, 0]} rotation={[0, -0.18, 0]}>
            <Book cover={books[1]} w={1.35} d={0.95} />
          </group>
          <group position={[-0.04, 0.4, 0.02]} rotation={[0, 0.25, 0]}>
            <Book cover={books[2]} w={1.2} d={0.85} h={0.16} />
          </group>
        </group>
      </Floaty>
      <Floaty sp={sp} a={[-4.8, 1.0, -1.9]} b={[-4.3, 0.06, -1.5]} ra={[0.5, 0.6, -0.3]} rb={[0, 0.3, 0]} speed={0.7} phase={4}>
        <Calculator />
      </Floaty>
      <Floaty sp={sp} a={[-2.8, 1.4, 2.0]} b={[-3.8, 0.18, 1.6]} ra={[0.35, 0.3, -0.15]} rb={[0.08, 0.35, 0.02]} speed={0.7} amp={0.2} phase={5}>
        <GradCap />
      </Floaty>
      <Floaty sp={sp} a={[2.7, 1.9, 2.6]} b={[-3.9, 0.02, 2.5]} ra={[0.7, 0.3, 0.4]} rb={[0, 0.25, 0]} speed={1.2} phase={6}>
        <Sticky text={'E = mc²'} />
      </Floaty>
      <Floaty sp={sp} a={[-3.5, 2.5, -0.9]} b={[4.1, 0.02, 2.2]} ra={[0.6, -0.4, -0.3]} rb={[0, -0.3, 0]} speed={1.0} phase={7}>
        <Sticky text={'NEET\n2026'} color="#f6e8c0" />
      </Floaty>
      <Floaty sp={sp} a={[4.5, 3.0, 1.6]} b={[4.6, 0.02, 1.0]} ra={[0.4, 0.5, 0.3]} rb={[0, 0.5, 0]} speed={0.9} phase={8}>
        <Sticky text={'JEE\nAIR ★'} color="#f1d58a" />
      </Floaty>
      <Floaty sp={sp} a={[-1.6, 3.2, 1.8]} b={[-2.2, 2.4, -3.2]} ra={[0.3, 0.4, 0.2]} rb={[0.6, 1.2, 0.3]} speed={1.3} amp={0.22} phase={9}>
        <Atom />
      </Floaty>
      <Floaty sp={sp} a={[1.6, 2.7, 2.9]} b={[1.2, 0.03, 2.75]} ra={[0.6, -0.3, 0.3]} rb={[0, 0.04, 0]} speed={0.8} phase={10}>
        <Ruler />
      </Floaty>

      <MathSymbol sp={sp} ch={'π'} pos={[-3.2, 3.4, 1.2]} gold phase={0} />
      <MathSymbol sp={sp} ch={'Σ'} pos={[3.3, 3.6, 0.4]} phase={1} />
      <MathSymbol sp={sp} ch={'√'} pos={[-3.8, 3.2, -1.8]} phase={2} size={0.6} />
      <MathSymbol sp={sp} ch={'∞'} pos={[3.8, 2.8, -1.6]} gold phase={3} size={0.6} />
      <MathSymbol sp={sp} ch={'Δ'} pos={[-4.6, 3.1, -2.8]} phase={4} size={0.55} />
      <MathSymbol sp={sp} ch={'+'} pos={[5.2, 2.2, -0.2]} gold phase={5} size={0.5} />
      <MathSymbol sp={sp} ch={'÷'} pos={[-5.3, 2.4, 1.9]} phase={6} size={0.5} />
    </>
  );
}

/* ------------------------------------------------------------------ */
function SceneContent({ progress, mouse, name, phone, onReady }: Omit<Props, 'active'>) {
  const sp = useRef(progress.current);
  const { gl } = useThree();
  useEffect(() => {
    gl.setClearColor(0x000000, 0);
    const id = requestAnimationFrame(() => onReady?.());
    return () => cancelAnimationFrame(id);
  }, [gl, onReady]);

  return (
    <>
      <hemisphereLight args={['#ffffff', '#e9e1cf', 1.5]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[4, 11, 5]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-bias={-0.0006}
        shadow-normalBias={0.02}
      />
      <Rig progress={progress} mouse={mouse} sp={sp} />
      <Notebook sp={sp} name={name} phone={phone} />
      <Props sp={sp} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <shadowMaterial opacity={0.14} />
      </mesh>
    </>
  );
}

export default function Scene3D({ active, ...rest }: Props) {
  return (
    <Canvas
      flat
      shadows
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 38, near: 0.1, far: 80, position: [0, 6.2, 10.4] }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <SceneContent {...rest} />
    </Canvas>
  );
}
