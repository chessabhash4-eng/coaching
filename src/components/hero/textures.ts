import * as THREE from 'three';

export const TW = 768;
export const TH = 1024;
const INK = '#141a3c';
const INK2 = '#3d4366';
const GOLD = '#b8870f';
const GOLD2 = '#d9a42c';
const PAPER = '#fbf9f3';

type Font = 'hand' | 'serif' | 'sans';
export type Item =
  | { k: 'text'; t: string; x: number; y: number; s: number; f?: Font; c?: string; w?: number; a?: 'left' | 'center' | 'right'; r?: number; i?: boolean }
  | { k: 'path'; d: string; c?: string; lw?: number }
  | { k: 'img'; src: string; x: number; y: number; w: number; h: number }
  | { k: 'stamp'; t: string; t2: string; x: number; y: number; rad: number; r?: number; c?: string };

const imgCache = new Map<string, HTMLImageElement>();
const lenCache = new Map<string, number>();
const path2dCache = new Map<string, Path2D>();

function getPath2D(d: string): Path2D {
  let p = path2dCache.get(d);
  if (!p) {
    p = new Path2D(d);
    path2dCache.set(d, p);
  }
  return p;
}

let leftBgCanvas: HTMLCanvasElement | null = null;
let rightBgCanvas: HTMLCanvasElement | null = null;

function getBgCanvas(side: 'left' | 'right'): HTMLCanvasElement {
  if (side === 'left' && leftBgCanvas) return leftBgCanvas;
  if (side === 'right' && rightBgCanvas) return rightBgCanvas;

  const c = document.createElement('canvas');
  c.width = TW;
  c.height = TH;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, TW, TH);

  // gentle page shading toward the spine
  const g = ctx.createLinearGradient(side === 'right' ? 0 : TW, 0, side === 'right' ? 90 : TW - 90, 0);
  g.addColorStop(0, 'rgba(20,26,60,0.10)');
  g.addColorStop(1, 'rgba(20,26,60,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, TW, TH);

  // ruled lines
  ctx.strokeStyle = 'rgba(108,140,196,0.30)';
  ctx.lineWidth = 1.5;
  for (let y = 150; y < TH - 20; y += 36) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(TW, y);
    ctx.stroke();
  }

  // margin line
  ctx.strokeStyle = 'rgba(222,110,110,0.55)';
  ctx.lineWidth = 2;
  const mx = side === 'right' ? 92 : TW - 92;
  ctx.beginPath();
  ctx.moveTo(mx, 0);
  ctx.lineTo(mx, TH);
  ctx.stroke();

  if (side === 'left') leftBgCanvas = c;
  else rightBgCanvas = c;
  return c;
}

function pathLen(d: string) {
  if (lenCache.has(d)) return lenCache.get(d)!;
  let L = 1200;
  try {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', d);
    L = p.getTotalLength() || L;
  } catch {
    /* fallback */
  }
  lenCache.set(d, L);
  return L;
}

function fontOf(f: Font = 'hand', s: number, w?: number, italic?: boolean) {
  if (f === 'serif') return `${italic ? 'italic ' : ''}${w ?? 800} ${s}px Fraunces, Georgia, serif`;
  if (f === 'sans') return `${w ?? 600} ${s}px Manrope, system-ui, sans-serif`;
  return `${w ?? 600} ${s}px Caveat, cursive`;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

function drawItem(ctx: CanvasRenderingContext2D, it: Item, t: number, onImg: () => void) {
  ctx.save();
  if (it.k === 'text') {
    ctx.translate(it.x, it.y);
    if (it.r) ctx.rotate(it.r);
    ctx.font = fontOf(it.f, it.s, it.w, it.i);
    ctx.fillStyle = it.c ?? INK;
    ctx.textBaseline = 'alphabetic';
    const w = ctx.measureText(it.t).width;
    const x0 = it.a === 'center' ? -w / 2 : it.a === 'right' ? -w : 0;
    if (t < 1) {
      ctx.beginPath();
      ctx.rect(x0 - 6, -it.s * 1.3, (w + 12) * t, it.s * 1.8);
      ctx.clip();
    }
    ctx.fillText(it.t, x0, 0);
  } else if (it.k === 'path') {
    const L = pathLen(it.d);
    ctx.strokeStyle = it.c ?? GOLD2;
    ctx.lineWidth = it.lw ?? 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.setLineDash([L * t, L + 20]);
    ctx.stroke(getPath2D(it.d));
  } else if (it.k === 'img') {
    let img = imgCache.get(it.src);
    if (!img) {
      img = new Image();
      img.src = it.src;
      img.onload = onImg;
      imgCache.set(it.src, img);
    }
    if (img.complete && img.naturalWidth) {
      ctx.globalAlpha = t;
      const s = 0.9 + 0.1 * t;
      ctx.translate(it.x + it.w / 2, it.y + it.h / 2);
      ctx.scale(s, s);
      ctx.drawImage(img, -it.w / 2, -it.h / 2, it.w, it.h);
    }
  } else if (it.k === 'stamp') {
    ctx.globalAlpha = 0.85 * t;
    ctx.translate(it.x, it.y);
    ctx.rotate(it.r ?? -0.2);
    const sc = 1.4 - 0.4 * t;
    ctx.scale(sc, sc);
    const c = it.c ?? GOLD;
    ctx.strokeStyle = c;
    ctx.fillStyle = c;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, it.rad, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, it.rad - 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.font = fontOf('sans', 30, 800);
    ctx.fillText(it.t, 0, -2);
    ctx.font = fontOf('sans', 17, 700);
    ctx.fillText(it.t2, 0, 28);
    ctx.font = fontOf('sans', 16, 700);
    ctx.fillText('\u2605  \u2605  \u2605', 0, -36);
  }
  ctx.restore();
}

export function paintPage(ctx: CanvasRenderingContext2D, items: Item[], reveal: number, side: 'left' | 'right', onImg: () => void) {
  ctx.setLineDash([]);
  // Blit pre-rendered background canvas for massive performance gain
  ctx.drawImage(getBgCanvas(side), 0, 0);

  const n = items.length;
  for (let i = 0; i < n; i++) {
    const t = clamp01(reveal * n - i);
    if (t <= 0) break;
    drawItem(ctx, items[i], t, onImg);
  }
}

/* ---------- doodle path generators ---------- */
const squiggle = (x: number, y: number, w: number) =>
  `M${x} ${y} C ${x + w * 0.15} ${y - 10}, ${x + w * 0.3} ${y + 10}, ${x + w * 0.5} ${y} S ${x + w * 0.8} ${y - 8}, ${x + w} ${y + 2}`;
const check = (x: number, y: number, s = 1) => `M${x} ${y} l${10 * s} ${12 * s} l${22 * s} ${-26 * s}`;
const circle = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx + rx * 0.6} ${cy - ry} C ${cx - rx * 0.4} ${cy - ry * 1.15}, ${cx - rx * 1.05} ${cy - ry * 0.4}, ${cx - rx} ${cy + ry * 0.1} C ${cx - rx * 0.9} ${cy + ry}, ${cx + rx * 0.5} ${cy + ry * 1.1}, ${cx + rx} ${cy + ry * 0.2} C ${cx + rx * 1.1} ${cy - ry * 0.6}, ${cx + rx * 0.2} ${cy - ry * 1.1}, ${cx - rx * 0.3} ${cy - ry * 0.8}`;
const arrow = (x: number, y: number, x2: number, y2: number) =>
  `M${x} ${y} Q ${(x + x2) / 2 - 30} ${Math.max(y, y2) + 40}, ${x2} ${y2} M${x2 - 18} ${y2 - 4} L ${x2} ${y2} L ${x2 - 6} ${y2 + 18}`;
function helix(x0: number, y0: number, h: number, a: number) {
  let d1 = '';
  let d2 = '';
  let rungs = '';
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 4;
    const y = y0 + (i / steps) * h;
    const x1 = x0 + Math.sin(t) * a;
    const x2 = x0 - Math.sin(t) * a;
    d1 += `${i === 0 ? 'M' : 'L'}${x1.toFixed(1)} ${y.toFixed(1)} `;
    d2 += `${i === 0 ? 'M' : 'L'}${x2.toFixed(1)} ${y.toFixed(1)} `;
    if (i % 5 === 2) rungs += `M${x1.toFixed(1)} ${y.toFixed(1)} L${x2.toFixed(1)} ${y.toFixed(1)} `;
  }
  return [d1, d2, rungs];
}
function parabola(ox: number, oy: number, w: number, h: number) {
  const axes = `M${ox - 20} ${oy} L${ox + w} ${oy} M${ox + w / 2} ${oy + 30} L${ox + w / 2} ${oy - h}`;
  let c = '';
  for (let i = 0; i <= 40; i++) {
    const u = i / 40 - 0.5;
    const x = ox + w / 2 + u * w * 0.9;
    const y = oy - h * 0.9 + u * u * 4 * h * 0.8;
    c += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return [axes, c];
}
const stairs = (x: number, y: number) =>
  `M${x} ${y} l60 0 l0 -50 l60 0 l0 -50 l60 0 l0 -50 l60 0 l0 -50 l60 0`;
const star = (cx: number, cy: number, r: number) => {
  let d = '';
  for (let i = 0; i <= 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    d += `${i === 0 ? 'M' : 'L'}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)} `;
  }
  return d;
};

export type PageKey = 'leftBase' | 'p0f' | 'p0b' | 'p1f' | 'p1b' | 'p2f' | 'p2b' | 'rightBase';

export function buildPages(o: { name: string; phone: string }): Record<PageKey, { side: 'left' | 'right'; items: Item[] }> {
  const [n1, ...rest] = o.name.toUpperCase().split(' ');
  const line2 = rest.join(' ');
  const L = 150 + 36; // helper baseline
  const bl = (k: number) => 150 + 36 * k - 8;
  return {
    leftBase: {
      side: 'left',
      items: [
        { k: 'img', src: '/uploads/logo.png', x: 274, y: 118, w: 220, h: 220 },
        { k: 'text', t: n1 + ' ' + (rest[0] || ''), x: 384, y: 452, s: 70, f: 'serif', w: 900, a: 'center' },
        { k: 'text', t: rest.slice(1).join(' ') || line2, x: 384, y: 515, s: 44, f: 'serif', w: 500, a: 'center', c: INK2, i: true },
        { k: 'path', d: squiggle(214, 548, 340), lw: 5 },
        { k: 'text', t: 'Build Your Career.', x: 384, y: bl(13), s: 56, a: 'center' },
        { k: 'text', t: 'Shape Your Future.', x: 384, y: bl(15), s: 56, a: 'center', c: GOLD },
        { k: 'text', t: 'NEET \u2022 JEE \u2022 FOUNDATION (6th\u201312th)', x: 384, y: bl(18), s: 22, f: 'sans', w: 800, a: 'center', c: INK2 },
        { k: 'text', t: 'this notebook belongs to: a future topper \u2713', x: 384, y: bl(22), s: 32, a: 'center', c: INK2, r: -0.02 },
      ],
    },
    p0f: {
      side: 'right',
      items: [
        { k: 'text', t: 'chapter 01', x: 120, y: 118, s: 34, c: GOLD },
        { k: 'text', t: 'Why this notebook?', x: 120, y: bl(2), s: 54, f: 'serif', w: 800 },
        { k: 'path', d: check(124, bl(4) - 14) },
        { k: 'text', t: 'Live online classes', x: 176, y: bl(4), s: 40 },
        { k: 'path', d: check(124, bl(6) - 14) },
        { k: 'text', t: 'Printed study material', x: 176, y: bl(6), s: 40 },
        { k: 'path', d: check(124, bl(8) - 14) },
        { k: 'text', t: '1-on-1 doubt support', x: 176, y: bl(8), s: 40 },
        { k: 'path', d: check(124, bl(10) - 14) },
        { k: 'text', t: 'Weekly tests + analysis', x: 176, y: bl(10), s: 40 },
        { k: 'text', t: 'NEET  \u2022  JEE  \u2022  Foundation', x: 120, y: bl(13), s: 44, c: INK2 },
        { k: 'path', d: squiggle(120, bl(13) + 14, 440), lw: 4 },
        { k: 'text', t: 'Admissions open!', x: 150, y: bl(17), s: 50, c: GOLD, r: -0.06 },
        { k: 'path', d: arrow(470, bl(16), 560, bl(19) - 30), c: INK2, lw: 3 },
        { k: 'stamp', t: 'OPEN', t2: 'ADMISSIONS', x: 590, y: 850, rad: 92, r: -0.25 },
        { k: 'text', t: 'Class 6th \u2013 12th', x: 120, y: bl(22), s: 24, f: 'sans', w: 700, c: INK2 },
      ],
    },
    p0b: {
      side: 'left',
      items: [
        { k: 'text', t: 'chapter 02', x: 96, y: 118, s: 34, c: GOLD },
        { k: 'text', t: 'NEET', x: 96, y: bl(3), s: 120, f: 'serif', w: 900 },
        { k: 'text', t: 'Physics \u00b7 Chemistry \u00b7 Biology', x: 96, y: bl(5), s: 40, c: INK2 },
        ...helix(560, 330, 330, 46).map((d, i): Item => ({ k: 'path', d, c: i === 2 ? INK2 : GOLD2, lw: i === 2 ? 2.5 : 4 })),
        { k: 'text', t: '\u2022 NCERT line-by-line', x: 96, y: bl(8), s: 38 },
        { k: 'text', t: '\u2022 Daily practice papers', x: 96, y: bl(10), s: 38 },
        { k: 'text', t: '\u2022 Full-length mock tests', x: 96, y: bl(12), s: 38 },
        { k: 'text', t: '\u2022 Biology diagrams made easy', x: 96, y: bl(14), s: 38 },
        { k: 'text', t: 'target: 650+', x: 150, y: bl(18), s: 60, c: GOLD },
        { k: 'path', d: circle(250, bl(18) - 20, 150, 50), c: INK2, lw: 3 },
        { k: 'text', t: 'future doctors start here \u2665', x: 96, y: bl(22), s: 32, c: INK2, r: -0.02 },
      ],
    },
    p1f: {
      side: 'right',
      items: [
        { k: 'text', t: 'chapter 03', x: 120, y: 118, s: 34, c: GOLD },
        { k: 'text', t: 'JEE', x: 120, y: bl(3), s: 120, f: 'serif', w: 900 },
        { k: 'text', t: 'Main + Advanced', x: 360, y: bl(3), s: 40, f: 'serif', w: 500, i: true, c: INK2 },
        { k: 'text', t: 'F = m \u00b7 a', x: 120, y: bl(6), s: 46 },
        { k: 'text', t: 'PV = nRT', x: 120, y: bl(8), s: 46 },
        { k: 'text', t: '\u222b sin x dx = \u2212cos x + C', x: 120, y: bl(10), s: 46 },
        { k: 'text', t: 'e^(i\u03c0) + 1 = 0', x: 120, y: bl(12), s: 46, c: GOLD },
        ...parabola(470, bl(9), 220, 160).map((d, i): Item => ({ k: 'path', d, c: i === 0 ? INK2 : GOLD2, lw: i === 0 ? 2.5 : 4 })),
        { k: 'text', t: 'concepts > rote learning', x: 120, y: bl(16), s: 46, r: -0.03 },
        { k: 'path', d: squiggle(120, bl(16) + 14, 420) },
        { k: 'text', t: 'future engineers \u2192 IITs & NITs', x: 120, y: bl(20), s: 36, c: INK2 },
      ],
    },
    p1b: {
      side: 'left',
      items: [
        { k: 'text', t: 'chapter 04', x: 96, y: 118, s: 34, c: GOLD },
        { k: 'text', t: 'Foundation', x: 96, y: bl(3), s: 96, f: 'serif', w: 900 },
        { k: 'text', t: 'Class 6th \u2013 10th', x: 96, y: bl(5), s: 44, c: GOLD },
        { k: 'text', t: '\u2022 Strong basics in Maths & Science', x: 96, y: bl(8), s: 36 },
        { k: 'text', t: '\u2022 Olympiad & NTSE preparation', x: 96, y: bl(10), s: 36 },
        { k: 'text', t: '\u2022 Board exam excellence', x: 96, y: bl(12), s: 36 },
        { k: 'text', t: '\u2022 Habits that last a lifetime', x: 96, y: bl(14), s: 36 },
        { k: 'path', d: stairs(150, bl(22)), c: INK2, lw: 4 },
        { k: 'path', d: star(470, bl(15) + 10, 30), c: GOLD2, lw: 4 },
        { k: 'text', t: 'one step at a time', x: 400, y: bl(21), s: 34, c: INK2, r: -0.05 },
      ],
    },
    p2f: {
      side: 'right',
      items: [
        { k: 'text', t: 'chapter 05', x: 120, y: 118, s: 34, c: GOLD },
        { k: 'text', t: 'Admissions', x: 120, y: bl(3), s: 88, f: 'serif', w: 900 },
        { k: 'text', t: 'Open Now', x: 120, y: bl(5), s: 72, f: 'serif', w: 500, i: true, c: GOLD },
        { k: 'text', t: 'New batches for 2026\u201327', x: 120, y: bl(8), s: 42 },
        { k: 'text', t: 'Limited seats in every batch', x: 120, y: bl(10), s: 42, c: INK2 },
        { k: 'text', t: 'call us:', x: 120, y: bl(14), s: 42, c: INK2 },
        { k: 'text', t: o.phone, x: 120, y: bl(16), s: 58, f: 'serif', w: 800 },
        { k: 'path', d: squiggle(120, bl(16) + 16, 480), lw: 5 },
        { k: 'stamp', t: '2026', t2: 'NEW BATCH', x: 560, y: 360, rad: 88, r: 0.2 },
        { k: 'text', t: 'keep scrolling \u2193', x: 120, y: bl(21), s: 38, c: GOLD, r: -0.03 },
      ],
    },
    p2b: {
      side: 'left',
      items: [
        { k: 'img', src: '/uploads/logo.png', x: 318, y: 160, w: 132, h: 132 },
        { k: 'text', t: 'Build Your', x: 384, y: bl(8), s: 92, f: 'serif', w: 900, a: 'center' },
        { k: 'text', t: 'Career.', x: 384, y: bl(11), s: 92, f: 'serif', w: 900, a: 'center' },
        { k: 'text', t: 'Shape Your Future.', x: 384, y: bl(14), s: 70, a: 'center', c: GOLD },
        { k: 'path', d: squiggle(180, bl(14) + 18, 400), lw: 5 },
        { k: 'text', t: `\u2014 ${o.name}`, x: 384, y: bl(19), s: 36, a: 'center', c: INK2 },
      ],
    },
    rightBase: {
      side: 'right',
      items: [{ k: 'text', t: '', x: 0, y: L, s: 10 }],
    },
  };
}

export class PageTexture {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  tex: THREE.CanvasTexture;
  items: Item[];
  side: 'left' | 'right';
  last = -1;
  constructor(items: Item[], side: 'left' | 'right', mirror: boolean, maxAniso: number) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = TW;
    this.canvas.height = TH;
    this.ctx = this.canvas.getContext('2d')!;
    this.items = items;
    this.side = side;
    this.tex = new THREE.CanvasTexture(this.canvas);
    this.tex.colorSpace = THREE.SRGBColorSpace;
    this.tex.anisotropy = Math.min(8, maxAniso);
    if (mirror) {
      this.tex.wrapS = THREE.RepeatWrapping;
      this.tex.repeat.x = -1;
      this.tex.offset.x = 1;
    }
  }
  draw(reveal: number, force = false) {
    const q = Math.round(clamp01(reveal) * 24) / 24;
    if (!force && (q === this.last || (this.last === 1 && reveal >= 0.999))) return;
    this.last = q;
    paintPage(this.ctx, this.items, q, this.side, () => this.draw(this.last, true));
    this.tex.needsUpdate = true;
  }
  dispose() {
    this.tex.dispose();
  }
}

/* small textures for props */
export function labelTexture(text: string, opts: { w?: number; h?: number; bg?: string; color?: string; font?: string; lines?: boolean } = {}) {
  const w = opts.w ?? 256;
  const h = opts.h ?? 256;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d')!;
  if (opts.bg) {
    x.fillStyle = opts.bg;
    x.fillRect(0, 0, w, h);
  }
  if (opts.lines) {
    x.strokeStyle = 'rgba(20,26,60,0.12)';
    x.lineWidth = 2;
    for (let y = 60; y < h; y += 34) {
      x.beginPath();
      x.moveTo(12, y);
      x.lineTo(w - 12, y);
      x.stroke();
    }
  }
  x.fillStyle = opts.color ?? INK;
  x.font = opts.font ?? '700 72px Caveat, cursive';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  const parts = text.split('\n');
  parts.forEach((p, i) => x.fillText(p, w / 2, h / 2 + (i - (parts.length - 1) / 2) * 64));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function stripesTexture() {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const x = c.getContext('2d')!;
  x.fillStyle = '#efe8d6';
  x.fillRect(0, 0, 64, 64);
  for (let y = 0; y < 64; y += 4) {
    x.fillStyle = y % 8 === 0 ? 'rgba(120,100,60,0.12)' : 'rgba(255,255,255,0.5)';
    x.fillRect(0, y, 64, 1.5);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export function rulerTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 160;
  const x = c.getContext('2d')!;
  x.fillStyle = '#f3e3b0';
  x.fillRect(0, 0, 1024, 160);
  x.strokeStyle = INK;
  x.fillStyle = INK;
  x.font = '600 26px Manrope, sans-serif';
  for (let i = 0; i <= 100; i++) {
    const X = 20 + i * 9.8;
    const len = i % 10 === 0 ? 60 : i % 5 === 0 ? 42 : 26;
    x.lineWidth = i % 10 === 0 ? 3 : 2;
    x.beginPath();
    x.moveTo(X, 0);
    x.lineTo(X, len);
    x.stroke();
    if (i % 10 === 0) x.fillText(String(i / 10), X - 7, 96);
  }
  x.font = '700 24px Manrope, sans-serif';
  x.fillText('ROOT CAREER INSTITUTE', 640, 140);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
