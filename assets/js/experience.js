// Desk scene: a closed record book on a desk under a lamp. Scrolling opens
// the book and turns one page per section. The HTML on top stays the real,
// accessible content; this canvas is decoration and fails quietly.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Scanned assets (CC0, Poly Haven). Each one is optional: if a file is
// missing or slow, the coded version is used instead.
const SCALE = 9.1;   // scene units per metre (the book is about 24 cm tall)
const assetURL = p => (window.__DESK_ASSETS && window.__DESK_ASSETS[p]) || new URL('../' + p, import.meta.url).href;
const withTimeout = (promise, ms) => Promise.race([promise, new Promise(r => setTimeout(() => r(null), ms))]);
function loadTexture(p, srgb) {
  return withTimeout(new Promise(res => new THREE.TextureLoader().load(assetURL(p), t => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping; if (srgb) t.colorSpace = THREE.SRGBColorSpace; res(t);
  }, undefined, () => res(null))), 30000);
}
function loadModel(p) {
  return withTimeout(new Promise(res => new GLTFLoader().load(assetURL(p), g => res(g.scene), undefined, e => { console.warn('Could not load', p, e); res(null); })), 30000);
}

const canvas = document.querySelector('#desk-canvas');
const stage = document.querySelector('.webgl-stage');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Book dimensions (scene units)
const PW = 1.5, PH = 2.1;          // page
const CW = 1.56, CH = 2.18;        // cover
const COVER_T = 0.035;             // cover board thickness
const BLOCK_H = 0.16;              // page block thickness
const GAP = 0.004;                 // spacing between loose leaves
const SEG = 40;                    // bend segments across a leaf
const SEGZ = 10;                   // segments down a leaf, so a turn can curl at the corner

const INK = '#2a2620', INK_SOFT = '#6b6358', INK_BLUE = '#28466a', PAPER = '#efe8d8';
const BRASS = '#d4b06a', CLOTH = '#1f3542';

const clamp01 = v => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

// ---------- Page artwork, drawn on canvases ----------
const TW = 1024, TH = Math.round(1024 * PH / PW);

function paperCanvas(base = PAPER, gutter = 'left') {
  const c = document.createElement('canvas'); c.width = TW; c.height = TH;
  const g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, TW, TH);
  // fibre speckle and a faint edge darkening, like real paper under a lamp
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = `rgba(90,70,40,${Math.random() * 0.05})`;
    g.fillRect(Math.random() * TW, Math.random() * TH, 1 + Math.random() * 2, 1);
  }
  const edge = g.createRadialGradient(TW / 2, TH / 2, TH * 0.35, TW / 2, TH / 2, TH * 0.75);
  edge.addColorStop(0, 'rgba(0,0,0,0)'); edge.addColorStop(1, 'rgba(80,55,25,0.16)');
  g.fillStyle = edge; g.fillRect(0, 0, TW, TH);
  const gx = gutter === 'left' ? 0 : TW;
  const gut = g.createLinearGradient(gx, 0, gutter === 'left' ? 150 : TW - 150, 0);
  gut.addColorStop(0, 'rgba(60,38,15,0.32)'); gut.addColorStop(1, 'rgba(60,38,15,0)');
  g.fillStyle = gut; g.fillRect(0, 0, TW, TH);
  ageing(g, TW, TH);
  return [c, g];
}

// Age the paper: uneven yellowing, foxing spots that gather near the edges,
// and a thumbed lower corner where pages get turned.
function ageing(g, w, h) {
  for (let i = 0; i < 7; i++) {
    const x = Math.random() * w, y = Math.random() * h, r = 150 + Math.random() * 320;
    const b = g.createRadialGradient(x, y, 0, x, y, r);
    b.addColorStop(0, `rgba(150,110,50,${0.018 + Math.random() * 0.025})`); b.addColorStop(1, 'rgba(150,110,50,0)');
    g.fillStyle = b; g.fillRect(0, 0, w, h);
  }
  for (let i = 0; i < 46; i++) {
    const edge = Math.random() < 0.7, x = edge ? (Math.random() < 0.5 ? Math.random() * 140 : w - Math.random() * 140) : Math.random() * w;
    const y = Math.random() * h, r = 2 + Math.random() * (Math.random() < 0.15 ? 14 : 5);
    const b = g.createRadialGradient(x, y, 0, x, y, r);
    b.addColorStop(0, `rgba(120,72,30,${0.1 + Math.random() * 0.16})`); b.addColorStop(1, 'rgba(120,72,30,0)');
    g.fillStyle = b; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  const th = g.createRadialGradient(w, h, 0, w, h, 260);
  th.addColorStop(0, 'rgba(90,60,30,0.14)'); th.addColorStop(1, 'rgba(90,60,30,0)');
  g.fillStyle = th; g.fillRect(w - 260, h - 260, 260, 260);
}

// A faint ring left by the mug, never quite closed.
function coffeeRing(g, x, y, r) {
  for (let k = 0; k < 3; k++) {
    g.strokeStyle = `rgba(110,62,24,${0.09 - k * 0.025})`; g.lineWidth = 5 - k * 1.4;
    g.beginPath(); g.arc(x + k * 2, y - k, r - k * 3, 0.4 + k * 0.2, Math.PI * 1.85 + k * 0.1); g.stroke();
  }
  const fill = g.createRadialGradient(x, y, r * 0.6, x, y, r);
  fill.addColorStop(0, 'rgba(110,62,24,0)'); fill.addColorStop(1, 'rgba(110,62,24,0.04)');
  g.fillStyle = fill; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
}



// Worn book cloth: weave, faded patches, rubbed edges and corners.
let LEATHER = null;   // scanned leather image, when it loads
function clothCanvas(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  if (LEATHER) {
    // tile the scanned leather at a believable grain size
    const tile = Math.max(w, h) / 1.6;
    for (let y = 0; y < h; y += tile) for (let x = 0; x < w; x += tile) g.drawImage(LEATHER, x, y, tile, tile);
  } else {
    g.fillStyle = CLOTH; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 3) { g.fillStyle = `rgba(255,255,255,${0.012 + Math.random() * 0.022})`; g.fillRect(0, y, w, 1); }
    for (let x = 0; x < w; x += 3) { g.fillStyle = `rgba(0,0,0,${0.03 + Math.random() * 0.035})`; g.fillRect(x, 0, 1, h); }
  }
  for (let i = 0; i < 10; i++) {
    const x = Math.random() * w, y = Math.random() * h, r = w * (0.12 + Math.random() * 0.3);
    const b = g.createRadialGradient(x, y, 0, x, y, r), light = Math.random() < 0.6;
    b.addColorStop(0, light ? 'rgba(220,170,140,0.06)' : 'rgba(20,0,0,0.14)'); b.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = b; g.fillRect(0, 0, w, h);
  }
  // small scuffs where it has slid across desks
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * w, y = Math.random() * h, len = 8 + Math.random() * 40, a = (Math.random() - 0.5) * 0.6;
    g.strokeStyle = `rgba(225,185,160,${0.03 + Math.random() * 0.06})`; g.lineWidth = 1 + Math.random() * 1.5;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); g.stroke();
  }
  // rubbed edges, strongest at the corners
  const band = Math.max(18, w * 0.03);
  for (const [x0, y0, x1, y1] of [[0, 0, w, band], [0, h - band, w, h], [0, 0, band, h], [w - band, 0, w, h]]) {
    for (let i = 0; i < 260; i++) {
      const x = x0 + Math.random() * (x1 - x0), y = y0 + Math.random() * (y1 - y0);
      g.fillStyle = `rgba(205,160,130,${Math.random() * 0.12})`; g.fillRect(x, y, 2 + Math.random() * 5, 1 + Math.random() * 3);
    }
  }
  for (const [x, y] of [[0, 0], [w, 0], [0, h], [w, h]]) {
    const b = g.createRadialGradient(x, y, 0, x, y, w * 0.12);
    b.addColorStop(0, 'rgba(196,150,118,0.42)'); b.addColorStop(1, 'rgba(196,150,118,0)');
    g.fillStyle = b; g.fillRect(0, 0, w, h);
  }
  return c;
}

function coverCanvas() {
  const H = Math.round(TW * CH / CW);
  const c = clothCanvas(TW, H), g = c.getContext('2d');
  // blind-stamped border, softened by wear
  g.strokeStyle = 'rgba(25,3,3,0.42)'; g.lineWidth = 6; g.strokeRect(70, 70, TW - 140, H - 140);
  g.strokeStyle = 'rgba(255,215,190,0.07)'; g.lineWidth = 2; g.strokeRect(76, 76, TW - 152, H - 152);
  // foil drawn on its own layer so it can be rubbed away in places
  const f = document.createElement('canvas'); f.width = TW; f.height = H;
  const fg = f.getContext('2d');
  // Pale antique gold reads warmer and calmer on oxblood leather than bright brass.
  const lines = fgc => {
    fgc.textAlign = 'center';
    fgc.font = '500 128px Newsreader, Georgia, serif';
    fgc.fillText('A record', TW / 2, 520); fgc.fillText('of learning.', TW / 2, 650);
    fgc.fillRect(TW / 2 - 60, 730, 120, 3);
    fgc.font = '400 52px Newsreader, Georgia, serif'; fgc.fillText('Mark Martin', TW / 2, 830);
    fgc.font = 'italic 400 36px Newsreader, Georgia, serif';
    fgc.fillText('MSc Computer Science (Artificial Intelligence)', TW / 2, H - 220);
    fgc.fillText('University of Essex Online', TW / 2, H - 170);
  };
  // the stamp presses the letters slightly into the leather
  g.save(); g.fillStyle = 'rgba(30,4,4,0.55)'; g.translate(2, 3); lines(g); g.restore();
  const foil = fg.createLinearGradient(0, 400, 0, H - 150);
  foil.addColorStop(0, '#f2e4bc'); foil.addColorStop(0.35, '#d8bd80'); foil.addColorStop(0.7, '#b8955a'); foil.addColorStop(1, '#d4b77c');
  fg.fillStyle = foil; lines(fg);
  fg.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 1700; i++) {
    fg.fillStyle = `rgba(0,0,0,${0.2 + Math.random() * 0.6})`;
    fg.beginPath(); fg.arc(Math.random() * TW, Math.random() * H, 0.6 + Math.random() * 2.4, 0, Math.PI * 2); fg.fill();
  }
  const rub = fg.createLinearGradient(0, 560, 0, 620);
  rub.addColorStop(0, 'rgba(0,0,0,0)'); rub.addColorStop(0.5, 'rgba(0,0,0,0.35)'); rub.addColorStop(1, 'rgba(0,0,0,0)');
  fg.fillStyle = rub; fg.fillRect(TW * 0.35, 540, TW * 0.4, 100);
  g.drawImage(f, 0, 0);
  // the foil sits a touch proud of the cloth, so give it a faint shadow line
  g.globalCompositeOperation = 'source-over';
  return c;
}

// ---------- Animated pages ----------
// Each page keeps a cached paper background and redraws its ink for a
// reveal amount r (0 = blank paper, 1 = finished page).
const seg = (r, a, b) => clamp01((r - a) / (b - a));
const easeOut = t => 1 - Math.pow(1 - t, 3);

function wrapLines(g, text, maxW) {
  const out = []; let line = '';
  for (const w of text.split(' ')) {
    const test = line ? line + ' ' + w : w;
    if (g.measureText(test).width > maxW && line) { out.push(line); line = w; } else line = test;
  }
  if (line) out.push(line);
  return out;
}

// Ink appears left to right, as if written.
function inkText(g, text, x, y, r, size) {
  if (r <= 0) return;
  const w = g.measureText(text).width;
  g.save(); g.beginPath(); g.rect(x - 8, y - size * 1.1, (w + 16) * easeOut(r), size * 1.6); g.clip();
  g.fillText(text, x, y); g.restore();
}

function fadeText(g, text, x, y, r) {
  if (r <= 0) return;
  g.save(); g.globalAlpha *= easeOut(r); g.fillText(text, x, y + (1 - easeOut(r)) * 10); g.restore();
}

function animPage(gutter, base, drawInk) {
  const paper = typeof base === 'function' ? base() : paperCanvas(base, gutter)[0];
  const c = document.createElement('canvas'); c.width = TW; c.height = TH;
  const g = c.getContext('2d');
  const page = { c, r: -1, textures: [],
    draw(r) {
      if (Math.abs(r - page.r) < 0.002) return;
      page.r = r; g.drawImage(paper, 0, 0); drawInk(g, r);
      page.textures.forEach(t => { t.needsUpdate = true; });
    } };
  page.draw(0);
  return page;
}

function folio(g, n, r) {
  g.font = '400 30px Newsreader, Georgia, serif'; g.fillStyle = INK_SOFT;
  g.save(); g.globalAlpha *= r;
  g.textAlign = n % 2 ? 'right' : 'left'; g.fillText(String(n), n % 2 ? TW - 110 : 110, TH - 90);
  g.restore();
}

function chapterPage({ chapter, title, body, n }) {
  return animPage(n % 2 ? 'left' : 'right', PAPER, (g, r) => {
    g.fillStyle = INK_SOFT; g.font = 'italic 400 40px Newsreader, Georgia, serif';
    fadeText(g, chapter, 110, 300, seg(r, 0, 0.15));
    g.fillStyle = INK; g.font = '500 112px Newsreader, Georgia, serif';
    let y = 450;
    title.forEach((line, i) => { inkText(g, line, 104, y, seg(r, 0.08 + i * 0.17, 0.32 + i * 0.17), 112); y += 118; });
    const rule = easeOut(seg(r, 0.45, 0.58));
    if (rule > 0) { g.strokeStyle = INK_BLUE; g.lineWidth = 3; g.beginPath(); g.moveTo(110, y - 40); g.lineTo(110 + 140 * rule, y - 40); g.stroke(); }
    g.fillStyle = INK; g.font = '400 40px Newsreader, Georgia, serif';
    wrapLines(g, body, TW - 240).forEach((line, j) => fadeText(g, line, 110, y + 50 + j * 62, seg(r, 0.52 + j * 0.07, 0.66 + j * 0.07)));
    folio(g, n, seg(r, 0.85, 1));
  });
}

function endpaperPage() {
  const page = animPage('right', patternedBase, (g, r) => {
    g.fillStyle = PAPER; g.fillRect(262, 470, 500, 380);
    // the bookplate border is drawn round, like a pen going round the frame
    const per = 2 * (460 + 340);
    g.strokeStyle = INK_BLUE; g.lineWidth = 3; g.setLineDash([per * easeOut(seg(r, 0, 0.45)), per]);
    g.beginPath(); g.moveTo(282, 490); g.lineTo(742, 490); g.lineTo(742, 830); g.lineTo(282, 830); g.closePath(); g.stroke();
    g.setLineDash([]);
    g.textAlign = 'center';
    g.fillStyle = INK_SOFT; g.font = 'italic 400 38px Newsreader, Georgia, serif'; fadeText(g, 'This record belongs to', TW / 2, 610, seg(r, 0.35, 0.55));
    g.fillStyle = INK; g.font = '500 70px Newsreader, Georgia, serif';
    const name = 'Mark Martin', w = g.measureText(name).width;
    g.textAlign = 'left'; inkText(g, name, TW / 2 - w / 2, 710, seg(r, 0.5, 0.85), 70);
  });
  return page;
}

// endpaper pattern lives in the cached paper, so draw it into a custom base
function patternedBase() {
  const [c, g] = paperCanvas('#e7dfcc', 'right');
  g.strokeStyle = 'rgba(40,70,106,0.16)'; g.lineWidth = 2;
  for (let y = -TW; y < TH + TW; y += 34) { g.beginPath(); g.moveTo(0, y); g.lineTo(TW, y + TW * 0.35); g.stroke(); }
  coffeeRing(g, 250, TH - 300, 118);
  return c;
}

function contentsPage() {
  return animPage('left', PAPER, (g, r) => {
    g.fillStyle = INK_SOFT; g.font = 'italic 400 40px Newsreader, Georgia, serif'; fadeText(g, 'Contents', 110, 300, seg(r, 0, 0.15));
    const rows = [['1', 'Numerical Analysis', 'open'], ['2', 'Next module', 'to come']];
    let y = 440;
    rows.forEach(([n, name, state], i) => {
      const a = 0.12 + i * 0.3;
      g.fillStyle = INK; g.font = '500 64px Newsreader, Georgia, serif';
      fadeText(g, n, 110, y, seg(r, a, a + 0.08));
      inkText(g, name, 180, y, seg(r, a + 0.03, a + 0.18), 64);
      const nameEnd = 180 + g.measureText(name).width;
      g.font = 'italic 400 38px Newsreader, Georgia, serif';
      const sw = g.measureText(state).width, x0 = nameEnd + 24, x1 = TW - 140 - sw;
      // leader dots run across to the page state
      const dots = easeOut(seg(r, a + 0.15, a + 0.28));
      g.fillStyle = INK_SOFT;
      for (let x = x0; x < lerp(x0, x1, dots); x += 18) g.fillRect(x, y - 6, 4, 4);
      g.fillStyle = state === 'open' ? INK_BLUE : INK_SOFT;
      fadeText(g, state, TW - 110 - sw, y, seg(r, a + 0.26, a + 0.34));
      y += 130;
    });
    g.fillStyle = INK_SOFT; g.font = '400 36px Newsreader, Georgia, serif';
    wrapLines(g, 'Each module keeps its artefacts, reflection, feedback and next actions together.', TW - 240)
      .forEach((line, j) => fadeText(g, line, 110, y + 40 + j * 56, seg(r, 0.75 + j * 0.06, 0.88 + j * 0.06)));
    folio(g, 3, seg(r, 0.85, 1));
  });
}

function loopPlanPage() {
  return animPage('left', PAPER, (g, r) => {
    g.fillStyle = INK_SOFT; g.font = 'italic 400 40px Newsreader, Georgia, serif'; fadeText(g, 'Planned structure', 110, 300, seg(r, 0, 0.12));
    g.strokeStyle = 'rgba(40,70,106,0.18)'; g.lineWidth = 2;
    let k = 0;
    for (let y = 380; y < TH - 160; y += 76, k++) {
      const t = easeOut(seg(r, 0.02 + k * 0.025, 0.2 + k * 0.025));
      if (t > 0) { g.beginPath(); g.moveTo(110, y + 18); g.lineTo(lerp(110, TW - 110, t), y + 18); g.stroke(); }
    }
    const items = ['Patterns across module reflections', 'Application to professional work', 'Review of skills matrices and action plans',
      'Changes in strengths and priorities', 'Programme level action plan'];
    g.fillStyle = INK; g.font = '400 40px Newsreader, Georgia, serif';
    items.forEach((t, i) => inkText(g, `${i + 1}.  ${t}`, 110, 386 + i * 76, seg(r, 0.25 + i * 0.1, 0.42 + i * 0.1), 40));
    // a hand-drawn loop: the programme comes back round to the start
    const loop = easeOut(seg(r, 0.72, 0.95));
    if (loop > 0) {
      const cx = TW - 250, cy = TH - 380, rad = 95, a0 = -Math.PI / 2, a1 = a0 + Math.PI * 1.75 * loop;
      g.strokeStyle = INK_BLUE; g.lineWidth = 4; g.lineCap = 'round';
      g.beginPath(); g.arc(cx, cy, rad, a0, a1); g.stroke();
      if (loop > 0.98) {
        const ex = cx + Math.cos(a1) * rad, ey = cy + Math.sin(a1) * rad, ang = a1 + Math.PI / 2;
        g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex - Math.cos(ang - 0.5) * 26, ey - Math.sin(ang - 0.5) * 26);
        g.moveTo(ex, ey); g.lineTo(ex - Math.cos(ang + 0.5) * 26, ey - Math.sin(ang + 0.5) * 26); g.stroke();
      }
    }
    g.fillStyle = INK_SOFT; g.font = 'italic 400 36px Newsreader, Georgia, serif';
    fadeText(g, 'Completed at programme end.', 110, 386 + 6 * 76, seg(r, 0.8, 0.95));
    folio(g, 5, seg(r, 0.85, 1));
  });
}

function makeTexture(c, renderer, mirror = false) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  if (mirror) { t.wrapS = THREE.RepeatWrapping; t.repeat.x = -1; t.offset.x = 1; }
  return t;
}

function woodCanvas() {
  const c = document.createElement('canvas'); c.width = 2048; c.height = 1024;
  const g = c.getContext('2d');
  g.fillStyle = '#3b2518'; g.fillRect(0, 0, 2048, 1024);
  for (let i = 0; i < 520; i++) {
    const y0 = Math.random() * 1024, amp = 4 + Math.random() * 14, f = 0.002 + Math.random() * 0.004, ph = Math.random() * 6;
    g.strokeStyle = Math.random() < 0.5 ? `rgba(20,10,5,${0.08 + Math.random() * 0.18})` : `rgba(140,90,55,${0.05 + Math.random() * 0.12})`;
    g.lineWidth = 0.6 + Math.random() * 2.4; g.beginPath();
    for (let x = 0; x <= 2048; x += 16) { const y = y0 + Math.sin(x * f + ph) * amp + Math.sin(x * f * 3.1 + ph) * amp * 0.3; x ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
  }
  return c;
}

// ---------- Page block shape ----------
// An open book is not flat: pages dip into the gutter, rise, then ease down
// to a rounded fore-edge. u runs 0 (spine) to 1 (fore-edge).
function gullWing(u) {
  const rise = 0.52 + 0.48 * (1 - Math.exp(-u / 0.075));
  return rise * (1 - 0.05 * u) * (1 - 0.08 * smooth(0.9, 1, u));
}

// ---------- A bendable leaf ----------
function leafGeometry(w, h) {
  const geo = new THREE.BufferGeometry(), cols = SEG + 1, rows = SEGZ + 1;
  const pos = new Float32Array(cols * rows * 3), uv = new Float32Array(cols * rows * 2), idx = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const k = j * cols + i;
    uv[k * 2] = i / SEG; uv[k * 2 + 1] = 1 - j / SEGZ;          // row 0 is the far edge (top of page)
    pos[k * 3 + 2] = -h / 2 + h * j / SEGZ;
  }
  for (let j = 0; j < SEGZ; j++) for (let i = 0; i < SEG; i++) {
    const a = j * cols + i, b = a + 1, c = a + cols, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  geo.setIndex(idx);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.userData.w = w;
  return geo;
}

// t: 0 lying on the right, 1 lying on the left. While turning, the page
// bends and the near corner lags, as if a hand lifted it from the bottom.
// At rest it settles onto the curved page block via surface(x).
function bendLeaf(geo, t, hingeY, bend, lift, surface) {
  const p = geo.attributes.position.array, w = geo.userData.w, ds = w / SEG, cols = SEG + 1;
  const turning = Math.sin(t * Math.PI), theta = t * Math.PI, rest = 1 - Math.pow(turning, 0.6);
  for (let j = 0; j <= SEGZ; j++) {
    const zn = (j / SEGZ) * 2 - 1, curl = bend * turning * (1 + 0.5 * zn);
    let x = 0, y = 0;
    for (let i = 0; i <= SEG; i++) {
      if (i > 0) {
        const sMid = (i - 0.5) / SEG;
        let a = theta - curl * Math.pow(sMid, 1.5) + lift * turning * (1 - sMid);
        a = Math.min(Math.PI, Math.max(0, a));
        x += Math.cos(a) * ds; y += Math.sin(a) * ds;
      }
      const k = (j * cols + i) * 3;
      p[k] = x; p[k + 1] = lerp(hingeY + y, surface(x), rest);
    }
  }
  geo.attributes.position.needsUpdate = true;
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
}

// Faint page lines on the block's edges, drawn in the shader from height.
function pageEdgeMaterial() {
  const m = new THREE.MeshStandardMaterial({ color: 0xe6dcc6, roughness: 0.95 });
  m.onBeforeCompile = sh => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vP;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvP = position;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vP;')
      .replace('#include <map_fragment>', '#include <map_fragment>\nfloat lines = 0.5 + 0.5 * sin(vP.y * 1500.0 + sin(vP.z * 9.0) * 2.0);\nfloat tone = 0.93 + 0.07 * sin(vP.x * 31.0 + vP.z * 17.0) * sin(vP.z * 23.0);\ndiffuseColor.rgb *= mix(0.86, 1.0, smoothstep(0.15, 0.85, lines)) * tone;\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.78, 0.66, 0.46), 0.12);');
  };
  return m;
}

// A page block with a curved top and softly rounded edges. open: 0 flat, 1 gull-wing.
function blockGeometry(height, open) {
  const shape = new THREE.Shape(), n = 48;
  shape.moveTo(0, 0); shape.lineTo(PW, 0);
  for (let i = n; i >= 0; i--) {
    const u = i / n, f = lerp(1, gullWing(u), open);
    shape.lineTo(u * PW, Math.max(0.002, height * f));
  }
  shape.lineTo(0, 0);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: PH, steps: 1, bevelEnabled: true,
    bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 3, curveSegments: 4 });
  geo.translate(0, 0, -PH / 2);
  return geo;
}

if (canvas && stage && !reducedMotion) {
  start().catch(err => { console.warn('Desk scene unavailable; poster stays visible.', err); });
}

async function start() {
  // Page artwork needs the web fonts before drawing.
  try { await Promise.all(['500 100px Newsreader', 'italic 400 40px Newsreader', '400 40px Newsreader'].map(f => document.fonts.load(f))); } catch {}

  const [woodD, woodN, woodR, leatherD, leatherN, leatherR, lampModel, penModel, journalScene, coverD, coverN, coverA] = await Promise.all([
    loadTexture('textures/wood_diff.jpg', true), loadTexture('textures/wood_nor.jpg'), loadTexture('textures/wood_rough.jpg'),
    null, null, null,
    loadModel('models/lamp.glb'), loadModel('models/pen.glb'), loadModel('models/journal.glb'),
    loadTexture('textures/cover_diff.jpg', true), loadTexture('textures/cover_nor.jpg'), loadTexture('textures/cover_arm.jpg')]);
  if (leatherD) LEATHER = leatherD.image;

  const mobile = matchMedia('(max-width: 700px)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));   // full sharpness on high-density screens
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0e0a07);
  scene.fog = new THREE.Fog(0x0e0a07, 6, 13);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.12;
  pmrem.dispose();
  const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 0.05, 40);

  // ---------- Light: one warm lamp does almost all the work ----------
  const hemi = new THREE.HemisphereLight(0x9fb4c8, 0x24160d, 0.34); scene.add(hemi);
  const lampHead = new THREE.Vector3(-2.15, 2.55, -1.15);
  const spot = new THREE.SpotLight(0xffc684, 70, 10, 0.72, 0.7, 1.6);
  spot.position.copy(lampHead);
  spot.target.position.set(0.6, 0, 0.1);
  spot.castShadow = true;
  spot.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  spot.shadow.bias = -0.00015; spot.shadow.normalBias = 0.025; spot.shadow.radius = 4;
  scene.add(spot, spot.target);
  const glow = new THREE.PointLight(0xffb266, 1.4, 3.5, 2);
  glow.position.copy(lampHead).add(new THREE.Vector3(0, 0.05, 0));
  scene.add(glow);

  // ---------- Room ----------
  const woodTex = makeTexture(woodCanvas(), renderer);
  woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping; woodTex.repeat.set(2, 2);
  const deskMat = woodD
    ? new THREE.MeshStandardMaterial({ map: woodD, normalMap: woodN, roughnessMap: woodR, roughness: 1, normalScale: new THREE.Vector2(0.8, 0.8) })
    : new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.62, metalness: 0 });
  if (woodD) [woodD, woodN, woodR].forEach(t => { if (t) { t.repeat.set(2.4, 1.55); t.anisotropy = renderer.capabilities.getMaxAnisotropy(); } });
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(14, 9), deskMat);
  desk.rotation.x = -Math.PI / 2; desk.receiveShadow = true; scene.add(desk);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), new THREE.MeshStandardMaterial({ color: 0x2a2420, roughness: 1 }));
  wall.position.set(0, 4, -3.4); wall.receiveShadow = true; scene.add(wall);

  // Lamp: weighted base, two arm segments, open shade with a glowing bulb.
  const brass = new THREE.MeshStandardMaterial({ color: 0x9a7a48, metalness: 0.85, roughness: 0.35 });
  const lamp = new THREE.Group(); scene.add(lamp);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.38, 0.07, 48), brass); base.position.set(-2.6, 0.035, -1.5); lamp.add(base);
  const armA = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.9, 12), brass);
  armA.position.set(-2.75, 1.0, -1.55); armA.rotation.z = 0.18; lamp.add(armA);
  const armB = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.95, 12), brass);
  armB.position.set(-2.45, 2.15, -1.35); armB.rotation.z = -1.0; lamp.add(armB);
  const shadeMat = new THREE.MeshStandardMaterial({ color: 0x1e3a33, metalness: 0.3, roughness: 0.5, side: THREE.DoubleSide });
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.42, 48, 1, true), shadeMat);
  shade.position.copy(lampHead).add(new THREE.Vector3(0, 0.14, 0));
  shade.lookAt(spot.target.position); shade.rotateX(-Math.PI / 2); lamp.add(shade);
  const bulbOn = new THREE.Color(0xffe2b0), bulbOff = new THREE.Color(0x3a3128);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 24, 16), new THREE.MeshBasicMaterial({ color: bulbOn.clone() }));
  bulb.position.copy(lampHead); lamp.add(bulb);
  lamp.traverse(o => { if (o.isMesh && o !== bulb) o.castShadow = true; });
  const lampGlow = [];   // emissive materials on the scanned lamp, dimmed with the switch
  if (lampModel) {
    lamp.visible = false;
    const base = new THREE.Vector3(-2.05, 0, -1.75), aim = new THREE.Vector3(0.55, 0, 0.1);
    lampModel.scale.setScalar(SCALE);
    lampModel.position.copy(base);
    lampModel.rotation.y = Math.atan2(aim.x - base.x, aim.z - base.z);
    scene.add(lampModel); lampModel.updateMatrixWorld(true);
    const b = lampModel.getObjectByName('industrial_pipe_lamp_bulb');
    const at = new THREE.Vector3(); (b || lampModel).getWorldPosition(at);
    spot.position.copy(at); glow.position.copy(at); spot.target.position.copy(aim);
    lampModel.traverse(o => {
      if (!o.isMesh) return;
      o.castShadow = o !== b && !(b && b.children.includes(o)); o.receiveShadow = true;
      const m = o.material; if (m && m.emissiveMap) { m.userData.full = 4.5; lampGlow.push(m); }
    });
  }

  // Mug and pencil, kept quiet.
  // Mug: turned from a profile so it has a real wall thickness, a rounded
  // lip and a foot, with a glossy glaze.
  const glaze = new THREE.MeshPhysicalMaterial({ color: 0xd8cfbf, roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.2 });
  const mug = new THREE.Group(); mug.position.set(2.55, 0, -1.35); scene.add(mug);
  const prof = [[0, 0.012], [0.2, 0.004], [0.228, 0.012], [0.238, 0.04], [0.252, 0.5], [0.258, 0.545], [0.252, 0.558],
    [0.243, 0.552], [0.235, 0.52], [0.222, 0.07], [0.205, 0.055], [0, 0.055]].map(([x, y]) => new THREE.Vector2(x, y));
  const body = new THREE.Mesh(new THREE.LatheGeometry(new THREE.SplineCurve(prof).getPoints(80), 72), glaze); mug.add(body);
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.233, 64), new THREE.MeshPhysicalMaterial({ color: 0x1e0f07, roughness: 0.08, clearcoat: 1 }));
  coffee.rotation.x = -Math.PI / 2; coffee.position.y = 0.455; mug.add(coffee);
  const handleCurve = new THREE.CubicBezierCurve3(new THREE.Vector3(0.24, 0.44, 0), new THREE.Vector3(0.43, 0.46, 0),
    new THREE.Vector3(0.43, 0.13, 0), new THREE.Vector3(0.24, 0.15, 0));
  const handle = new THREE.Mesh(new THREE.TubeGeometry(handleCurve, 48, 0.032, 20, false), glaze); mug.add(handle);
  mug.rotation.y = -0.5;
  mug.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

  // Steam: a few soft wisps drawn in a shader. They drift on their own and
  // sway a little more when the page is scrolled.
  const steamMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 }, uSway: { value: 0 }, uSeed: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      varying vec2 vUv; uniform float uTime, uSway, uSeed;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
      float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * n(p); p *= 2.0; a *= 0.5; } return v; }
      void main(){
        vec2 uv = vUv; float y = uv.y;
        // wisps lean and curl as they rise
        uv.x += (sin(y * 5.0 + uTime * 0.9 + uSeed) * 0.12 + uSway * y * y * 0.5) * y;
        float body = fbm(vec2(uv.x * 3.0 + uSeed, y * 2.2 - uTime * 0.35));
        float wisp = smoothstep(0.42, 0.82, body);
        float width = smoothstep(0.5, 0.12, abs(uv.x - 0.5) + y * 0.05);
        float fade = smoothstep(0.0, 0.12, y) * smoothstep(1.0, 0.35, y);
        gl_FragColor = vec4(vec3(1.0, 0.95, 0.88), wisp * width * fade * 0.26);
      }`,
  });
  const steam = [];
  for (let i = 0; i < 3; i++) {
    const m = steamMat.clone(); m.uniforms.uSeed.value = i * 3.7;
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 1.05), m);
    plane.position.set(mug.position.x + (i - 1) * 0.05, 0.48 + 0.52, mug.position.z + (i - 1) * 0.03);
    plane.renderOrder = 5; scene.add(plane); steam.push(plane);
  }
  // Pencil: lacquered hex body, sharpened wood and graphite, brass ferrule, eraser.
  const pencil = new THREE.Group(); pencil.position.set(1.95, 0.0235 * 0.866, 0.75); pencil.rotation.y = 0.55; scene.add(pencil);
  const along = geo => { geo.rotateZ(-Math.PI / 2); return geo; };   // lathe and cylinders point along +x
  const R = 0.0235;
  const paint = new THREE.MeshPhysicalMaterial({ color: 0x23463b, roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.25, flatShading: true });
  const shaft = new THREE.Mesh(along(new THREE.CylinderGeometry(R, R, 0.82, 6)), paint); shaft.rotation.x = Math.PI / 6; pencil.add(shaft);
  const sharp = new THREE.LatheGeometry([[R * 0.98, 0], [R * 0.7, 0.04], [0.008, 0.095], [0.0075, 0.098]].map(([x, y]) => new THREE.Vector2(x, y)), 24);
  const cone = new THREE.Mesh(along(sharp), new THREE.MeshStandardMaterial({ color: 0xd9b083, roughness: 0.85 }));
  cone.position.x = 0.41; pencil.add(cone);
  const lead = new THREE.Mesh(along(new THREE.LatheGeometry([[0.0076, 0], [0.004, 0.018], [0.0008, 0.03], [0, 0.031]].map(([x, y]) => new THREE.Vector2(x, y)), 16)),
    new THREE.MeshStandardMaterial({ color: 0x2b2b2e, roughness: 0.35, metalness: 0.4 }));
  lead.position.x = 0.41 + 0.097; pencil.add(lead);
  const brass2 = new THREE.MeshStandardMaterial({ color: 0xb08d57, metalness: 0.9, roughness: 0.3 });
  for (let k = 0; k < 4; k++) {
    const ring = new THREE.Mesh(along(new THREE.CylinderGeometry(R * 1.06, R * 1.06, 0.012, 24)), brass2);
    ring.position.x = -0.41 - 0.006 - k * 0.013; pencil.add(ring);
  }
  const eraser = new THREE.Mesh(along(new THREE.CylinderGeometry(R * 0.98, R * 0.98, 0.05, 24)),
    new THREE.MeshStandardMaterial({ color: 0xb98276, roughness: 0.9 }));
  eraser.position.x = -0.41 - 0.058 - 0.025; pencil.add(eraser);
  const eraserEnd = new THREE.Mesh(new THREE.SphereGeometry(R * 0.98, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), eraser.material);
  eraserEnd.rotation.z = Math.PI / 2; eraserEnd.scale.y = 0.35; eraserEnd.position.x = eraser.position.x - 0.025; pencil.add(eraserEnd);
  pencil.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  if (penModel) {
    pencil.visible = false;
    penModel.scale.setScalar(SCALE);
    penModel.position.set(2.5, 0.0048 * SCALE, 1.15); penModel.rotation.y = 0.35;
    penModel.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.position.set(0, 0, 0); } });
    scene.add(penModel);
  }

  // ---------- The book ----------
  const book = new THREE.Group(); book.rotation.y = -0.06; scene.add(book);
  const clothTex = makeTexture(clothCanvas(512, 512), renderer);
  clothTex.wrapS = clothTex.wrapT = THREE.RepeatWrapping; clothTex.repeat.set(1.5, 1.5);
  if (leatherD) [leatherN, leatherR].forEach(t => t && t.repeat.set(1.5, 1.5));
  const clothMat = leatherD
    ? new THREE.MeshStandardMaterial({ map: clothTex, normalMap: leatherN, roughnessMap: leatherR, roughness: 1 })
    : new THREE.MeshStandardMaterial({ map: clothTex, bumpMap: clothTex, bumpScale: 0.6, roughness: 0.86 });
  const shadowy = m => { m.castShadow = m.receiveShadow = true; return m; };
  const board = () => new RoundedBoxGeometry(CW, COVER_T, CH, 3, COVER_T * 0.45);

  const backCover = shadowy(new THREE.Mesh(board(), clothMat));
  backCover.position.set(CW / 2, COVER_T / 2, 0); book.add(backCover);

  // Page blocks: all pages start on the right; turned pages build up on the left.
  const edgeMat = pageEdgeMaterial();
  const rightBlock = shadowy(new THREE.Mesh(blockGeometry(BLOCK_H, 0), edgeMat));
  rightBlock.position.set(0.012, COVER_T, 0); book.add(rightBlock);
  const leftBlock = shadowy(new THREE.Mesh(blockGeometry(0.004, 1), edgeMat));
  leftBlock.position.set(-0.012, COVER_T, 0); leftBlock.scale.x = -1; leftBlock.visible = false; book.add(leftBlock);

  // Rounded spine that flattens under the gutter as the book opens.
  const spineR = (BLOCK_H + COVER_T * 2) / 2, SPINE_D = 0.045;
  const spineShape = new THREE.Shape();
  spineShape.moveTo(0.004, 0); spineShape.lineTo(0.004, spineR * 2);
  spineShape.absellipse(0, spineR, SPINE_D, spineR, Math.PI / 2, Math.PI * 1.5, false);
  spineShape.closePath();
  const spineGeo = new THREE.ExtrudeGeometry(spineShape, { depth: CH - 0.012, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.004, bevelSegments: 4, curveSegments: 24 });
  spineGeo.translate(0, 0, -(CH - 0.012) / 2);
  const spine = shadowy(new THREE.Mesh(spineGeo, clothMat));
  book.add(spine);

  const pageMat = map => new THREE.MeshStandardMaterial({ map, roughness: 0.9, side: THREE.FrontSide });
  const backMat = map => new THREE.MeshStandardMaterial({ map, roughness: 0.9, side: THREE.BackSide });
  const T = c => makeTexture(c, renderer);

  const about = { chapter: 'Chapter one', title: ['Practice', 'meets inquiry.'], n: 1,
    body: 'I am an educator exploring how computing and artificial intelligence can support careful decisions, meaningful learning and responsible professional practice.' };
  const modules = { chapter: 'Chapter two', title: ['Evidence,', 'not decoration.'], n: 2,
    body: 'Not a gallery of finished work. Evidence of decisions, mistakes, feedback and growth across a programme of study.' };
  const loop = { chapter: 'Chapter three', title: ['Across the', 'programme.'], n: 4,
    body: 'The Learning Loop will connect module reflections, professional skills and action plans into a final view of development.' };

  const pages = { endpaper: endpaperPage(), about: chapterPage(about), modules: chapterPage(modules),
    contents: contentsPage(), loop: chapterPage(loop), plan: loopPlanPage() };
  const bind = (page, mirror, flipV) => {
    const t = makeTexture(page.c, renderer, mirror);
    if (flipV) { t.wrapT = THREE.RepeatWrapping; t.repeat.y = -1; t.offset.y = 1; }
    page.textures.push(t); return t;
  };

  // Front cover: a rigid rounded board hinged at the spine, art on top, endpaper inside.
  const coverHinge = new THREE.Group(); book.add(coverHinge);
  const coverBoard = shadowy(new THREE.Mesh(board(), clothMat));
  coverBoard.position.set(CW / 2, COVER_T / 2, 0); coverHinge.add(coverBoard);
  const coverTex = T(coverCanvas());
  const coverNor = leatherN ? leatherN.clone() : null; if (coverNor) coverNor.repeat.set(1.6, 1.6);
  const art = new THREE.Mesh(new THREE.PlaneGeometry(CW - 0.014, CH - 0.014), (leatherD ? new THREE.MeshStandardMaterial({ map: coverTex, normalMap: coverNor, roughnessMap: leatherR, roughness: 1 }) : new THREE.MeshStandardMaterial({ map: coverTex, bumpMap: coverTex, bumpScale: 0.35, roughness: 0.84, metalness: 0.05 })));
  art.rotation.x = -Math.PI / 2; art.position.set(CW / 2, COVER_T + 0.0008, 0); art.receiveShadow = true; coverHinge.add(art);
  const inside = new THREE.Mesh(new THREE.PlaneGeometry(CW - 0.03, CH - 0.03), pageMat(bind(pages.endpaper, true, true)));
  inside.rotation.x = Math.PI / 2; inside.position.set(CW / 2, -0.0008, 0); inside.receiveShadow = true; coverHinge.add(inside);

  // Paper leaves bend; the cover does not.
  const leafDefs = [
    { front: bind(pages.about), back: bind(pages.modules, true) },
    { front: bind(pages.contents), back: bind(pages.loop, true) },
  ];
  const spreads = [null, [pages.endpaper, pages.about], [pages.modules, pages.contents], [pages.loop, pages.plan]]
    .map(sp => sp && { pages: sp, r: 0 });
  const N = leafDefs.length + 1;   // the cover counts as the first turn

  // The last right-hand page lies on the right block and follows its curve.
  const lastGeo = leafGeometry(PW, PH);
  const lastRight = new THREE.Mesh(lastGeo, pageMat(bind(pages.plan)));
  lastRight.receiveShadow = true; lastRight.position.x = 0.012; book.add(lastRight);

  const leaves = leafDefs.map((d, k) => {
    const geo = leafGeometry(PW, PH), g = new THREE.Group();
    const f = shadowy(new THREE.Mesh(geo, pageMat(d.front))), b = shadowy(new THREE.Mesh(geo, backMat(d.back)));
    g.position.x = 0.012; g.add(f, b); book.add(g);
    return { geo, d, i: k + 1, t: -1, group: g };
  });
  const cover = { i: 0, t: -1 };

  // ---------- The leather journal (scanned) ----------
  // Two scans of the same journal, one closed and one open. The view
  // dissolves from one to the other as the cover opens, then our pages sit
  // on its ring pad and turn over the rings.
  const J = 11.7;                       // journal scale: its pad matches our page size
  const LEAF_X = 0.011 * J;             // pages start just right of the rings
  const LIFT = 0.0023 * J;              // the scans dip 2 mm below their base; lift them onto the desk
  const PAD_Y = 0.0133 * J + 0.004 + LIFT;     // top of the paper pad
  const LEFT_Y = 0.0162 * J + 0.004 + LIFT;    // turned pages rest over the pockets
  let journal = null;
  if (journalScene) {
    const openM = journalScene.getObjectByName('binder_notebook'), closedM = journalScene.getObjectByName('binder_notebook_closed');
    if (openM && closedM) {
      journal = { open: openM, closed: closedM, k: 0 };
      for (const m of [openM, closedM]) {
        m.removeFromParent(); m.position.set(0, LIFT, 0); m.rotation.set(0, 0, 0); m.scale.setScalar(J);
        m.castShadow = m.receiveShadow = true; book.add(m);
      }
      [backCover, rightBlock, leftBlock, spine, coverHinge].forEach(o => { o.visible = false; });
      leaves.forEach(L => { L.group.position.x = LEAF_X; });
      lastRight.position.x = LEAF_X;
      bendLeaf(lastGeo, 0, 0, 0, 0, () => PAD_Y + 0.0006);
      spreads[1].pages = [pages.about];   // the left of the first spread is the journal's own pockets
      // The front panel of the closed journal gets its own sharper texture so
      // the gold lettering stays crisp up close. Triangles whose texture
      // coordinates fall on that panel are drawn with the panel material.
      if (coverD && coverN && coverA && closedM.material) {
        const U0 = 430 / 4096, V0 = 143 / 4096, U1 = 1208 / 4096, V1 = 1536 / 4096;
        for (const t of [coverD, coverN, coverA]) {
          t.flipY = false; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
          t.repeat.set(1 / (U1 - U0), 1 / (V1 - V0)); t.offset.set(-U0 / (U1 - U0), -V0 / (V1 - V0));
          t.anisotropy = renderer.capabilities.getMaxAnisotropy(); t.needsUpdate = true;
        }
        const geo = closedM.geometry, uv = geo.attributes.uv, idx = geo.index;
        const inside = i => { const u = uv.getX(i), v = uv.getY(i); return u > U0 && u < U1 && v > V0 && v < V1; };
        const rest = [], panel = [];
        for (let f = 0; f < idx.count; f += 3) {
          const a = idx.getX(f), b = idx.getX(f + 1), c = idx.getX(f + 2);
          (inside(a) && inside(b) && inside(c) ? panel : rest).push(a, b, c);
        }
        if (panel.length) {
          geo.setIndex([...rest, ...panel]); geo.clearGroups();
          geo.addGroup(0, rest.length, 0); geo.addGroup(rest.length, panel.length, 1);
          const panelMat = closedM.material.clone();
          panelMat.map = coverD; panelMat.normalMap = coverN; panelMat.roughnessMap = coverA; panelMat.metalnessMap = coverA;
          closedM.material = [closedM.material, panelMat];
        }
      }
    }
  }

  // ---------- Scroll and pointer ----------
  let progress = 0, target = 0;
  const sections = [...document.querySelectorAll('.story .scene')];
  function readScroll() {
    // progress = which section is centred, as a continuous number (0..sections-1)
    const mid = scrollY + innerHeight / 2; let p = 0;
    sections.forEach((s, i) => { const top = s.offsetTop, h = s.offsetHeight; if (mid >= top) p = i + Math.min(1, (mid - top) / h) - 0.5; });
    target = Math.max(0, Math.min(sections.length - 1, p));
  }
  // Returning from an inner page: open straight at the chapter that was left,
  // with no page turns replayed.
  try {
    const back = parseInt(sessionStorage.getItem('desk-return-done') || '', 10);
    if (!Number.isNaN(back) && sections[back]) { history.scrollRestoration = 'manual'; scrollTo({ top: sections[back].offsetTop, behavior: 'instant' }); }
  } catch {}
  addEventListener('scroll', readScroll, { passive: true }); readScroll(); progress = target;
  const pointer = { x: 0, y: 0 };
  addEventListener('pointermove', e => { pointer.x = e.clientX / innerWidth - 0.5; pointer.y = e.clientY / innerHeight - 0.5; }, { passive: true });

  // ---------- Camera framing ----------
  const look = new THREE.Vector3(), camPos = new THREE.Vector3(), dir = new THREE.Vector3();
  function frame(p) {
    const portrait = innerWidth / innerHeight < 0.85, aspect = innerWidth / innerHeight;
    const open = smooth(0.05, 0.9, p);
    // Where to look and how much width must fit on screen.
    const lookX = journal ? (portrait ? lerp(0.85, 0.88, open) : lerp(0.45, 0.05, open)) : (portrait ? lerp(0.6, 0.8, open) : lerp(0.35, 0.0, open));
    const fitW = journal ? (portrait ? lerp(3.0, 1.75, open) : lerp(4.9, 4.4, open)) : (portrait ? lerp(2.6, 1.75, open) : lerp(4.3, 3.8, open));
    const fitH = journal ? (portrait ? lerp(3.6, 3.0, open) : lerp(3.9, 2.6, open)) : (portrait ? lerp(3.4, 3.0, open) : lerp(3.6, 2.4, open));
    // Low, wide view of the desk first, then nearly overhead over the open book.
    dir.set(lerp(0.3, 0.0, open), lerp(0.5, 1.0, open), lerp(1.0, 0.42, open)).normalize();
    const usable = portrait ? 1 : 0.62;        // part of the screen width the book may use
    const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const d = Math.max(fitW / usable / (2 * tanH * aspect), fitH / (2 * tanH));
    const diveK = dive ? smooth(0, DIVE, elapsed - dive.start) : 0;
    const dd = d * lerp(1, 0.42, diveK);
    look.set(lookX, lerp(0.3, 0.12, open), lerp(-0.1, 0.18, open));
    camPos.copy(look).addScaledVector(dir, dd);
    camPos.x += pointer.x * 0.12; camPos.y -= pointer.y * 0.08;
    camera.position.copy(camPos); camera.lookAt(look);
    const W = innerWidth, H = innerHeight;
    if (portrait) camera.setViewOffset(W, H, 0, H * 0.11, W, H);    // book in the upper part, text below
    else camera.setViewOffset(W, H, W * 0.19, 0, W, H);            // book on the left, text on the right
  }

  let lastBlockKey = '';
  function updateBook(p) {
    const turn = i => smooth(i + 0.25, i + 0.8, p);
    if (journal) {
      const tc = turn(0);
      cover.t = tc;
      journal.k = smooth(0.12, 0.88, tc);                  // 0 closed, 1 open
      journal.closed.visible = journal.k < 1; journal.open.visible = journal.k > 0;
      const pagesOn = journal.k > 0;
      leaves.forEach(L => { L.group.visible = pagesOn; }); lastRight.visible = pagesOn;
      leaves.forEach(L => {
        const t = turn(L.i);
        if (Math.abs(t - L.t) < 1e-4) return;
        L.t = t;
        const stackR = (N - L.i) * GAP, stackL = L.i * GAP;
        const hinge = lerp(PAD_Y + stackR, LEFT_Y + stackL, t) + 0.02 * Math.sin(t * Math.PI);
        bendLeaf(L.geo, t, hinge, 0.95, 0.22, x => x >= 0 ? PAD_Y + stackR : LEFT_Y + stackL);
      });
      return;
    }
    const tc = turn(0), tl = leaves.map(L => turn(L.i));
    const open = smooth(0, 1, tc);
    // pages move from the right block to the left as leaves are turned
    const moved = tl.reduce((a, b) => a + b, 0) / tl.length;
    const hR = BLOCK_H * lerp(1, 0.55, moved * 0.9 + open * 0.1), hL = BLOCK_H * 0.45 * moved;
    // + EDGE clears the block's rounded bevel so pages sit on top of it
    const EDGE = 0.008;
    const surfR = x => COVER_T + EDGE + hR * lerp(1, gullWing(clamp01(x / PW)), open);
    const surfL = x => COVER_T + EDGE * Math.min(1, hL / 0.01) + hL * gullWing(clamp01(-x / PW));

    const key = `${hR.toFixed(4)}|${hL.toFixed(4)}|${open.toFixed(3)}`;
    if (key !== lastBlockKey) {
      lastBlockKey = key;
      rightBlock.geometry.dispose(); rightBlock.geometry = blockGeometry(hR, open);
      leftBlock.visible = hL > 0.003;
      if (leftBlock.visible) { leftBlock.geometry.dispose(); leftBlock.geometry = blockGeometry(hL, 1); }
      bendLeaf(lastGeo, 0, 0, 0, 0, x => surfR(x) + 0.0006);
      leaves.forEach(L => { L.t = -1; });   // pages must re-settle on the new surface
    }

    // cover: rigid swing around the spine; the hinge drops to the desk as it opens
    if (Math.abs(tc - cover.t) > 1e-4) {
      cover.t = tc;
      coverHinge.rotation.z = tc * Math.PI;
      coverHinge.position.y = lerp(COVER_T + BLOCK_H + 0.008 + GAP * N, COVER_T, smooth(0.15, 0.95, tc));
    }

    leaves.forEach((L, k) => {
      const t = tl[k];
      if (Math.abs(t - L.t) < 1e-4) return;
      L.t = t;
      const stackR = (N - L.i) * GAP, stackL = L.i * GAP;
      const hinge = lerp(surfR(0) + stackR, surfL(0) + stackL, t);
      bendLeaf(L.geo, t, hinge, 0.95, 0.22, x => x >= 0 ? surfR(x) + stackR : surfL(x) + stackL);
    });

    spine.scale.set(lerp(1, 0.25, open), lerp(1, 0.45, open), 1);
    spine.position.set(0, 0, 0);
  }

  function resize() {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize);

  let running = true;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) { clock.getDelta(); requestAnimationFrame(tick); } });
  // ---------- Leaving the book ----------
  // Clicking a link to another page of the portfolio first moves the camera
  // down into the book, then the next page loads. New tabs, modified clicks
  // and links to other sites behave normally.
  const DIVE = 0.55;
  let dive = null;
  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('.story a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
    e.preventDefault();
    dive = { start: elapsed, href: url.href };
    document.documentElement.classList.add('diving');
    setTimeout(() => { location.href = url.href; }, DIVE * 1000 + 60);
  });
  // Coming back with the browser's Back button restores the page as it was.
  addEventListener('pageshow', e => { if (e.persisted) { dive = null; document.documentElement.classList.remove('diving'); } });

  // ---------- Lamp switching on ----------
  // A click, a flicker, then the warm light settles. Skipped if the visitor
  // arrives part way down the page.
  // The lamp switches on once per visit. Coming back from another page of the
  // portfolio, it is already on.
  let seen = false;
  try { seen = sessionStorage.getItem('desk-lamp-on') === '1'; sessionStorage.setItem('desk-lamp-on', '1'); } catch {}
  const introOn = scrollY < 40 && target < 0.1 && !seen;   // never switch the lamp on over an already open journal
  const lampCurve = t => {
    if (t < 0) return 0;
    if (t < 0.07) return 0.9; if (t < 0.15) return 0.08; if (t < 0.21) return 0.7; if (t < 0.3) return 0.2;
    return lerp(0.55, 1, smooth(0.3, 1.3, t));
  };
  function setLamp(v) {
    spot.intensity = 70 * v; glow.intensity = 1.4 * v;
    hemi.intensity = 0.34 * (0.3 + 0.7 * v);
    bulb.material.color.copy(bulbOff).lerp(bulbOn, Math.min(1, v * 1.2));
    lampGlow.forEach(m => { m.emissiveIntensity = m.userData.full * v; });
  }
  setLamp(introOn ? 0 : 1);

  // ---------- Page reveals ----------
  // When a spread first lies open and nothing is turning, its ink is written
  // in over REVEAL seconds. It plays once per visit: coming back to a
  // chapter shows the finished page.
  const REVEAL = 1.2;
  try {
    const back = parseInt(sessionStorage.getItem('desk-return-done') || '', 10);
    if (!Number.isNaN(back)) spreads.forEach((sp, k) => { if (sp && k <= back) sp.r = 1; });
  } catch {}
  function updateReveals(dt) {
    spreads.forEach((sp, k) => {
      if (!sp) return;
      const turns = [cover, ...leaves];
      const before = k > 0 ? turns[k - 1].t : 1, after = k < N ? turns[k].t : 0;
      const settled = before > 0.999 && after < 0.001;
      if (settled) sp.r = Math.min(1, sp.r + dt / REVEAL);
      sp.pages.forEach(pg => pg.draw(sp.r));
    });
  }

  // While the journal changes from closed to open, both states are drawn and
  // blended on screen, like a film dissolve.
  const rtOpts = { type: THREE.HalfFloatType, samples: 4 };
  const size = new THREE.Vector2(); renderer.getDrawingBufferSize(size);
  const rtA = new THREE.WebGLRenderTarget(size.x, size.y, rtOpts), rtB = new THREE.WebGLRenderTarget(size.x, size.y, rtOpts);
  const mixMat = new THREE.ShaderMaterial({
    uniforms: { a: { value: rtA.texture }, b: { value: rtB.texture }, k: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: 'uniform sampler2D a, b; uniform float k; varying vec2 vUv; void main(){ gl_FragColor = mix(texture2D(a, vUv), texture2D(b, vUv), k);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}',
    depthTest: false, depthWrite: false });
  const quadScene = new THREE.Scene(), quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  quadScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mixMat));
  addEventListener('resize', () => { renderer.getDrawingBufferSize(size); rtA.setSize(size.x, size.y); rtB.setSize(size.x, size.y); });
  function render() {
    const k = journal ? journal.k : 0;
    if (!journal || k <= 0 || k >= 1) { renderer.setRenderTarget(null); renderer.render(scene, camera); return; }
    const set = open => { journal.closed.visible = !open; journal.open.visible = open;
      leaves.forEach(L => { L.group.visible = open; }); lastRight.visible = open; };
    set(false); renderer.setRenderTarget(rtA); renderer.render(scene, camera);
    set(true); renderer.setRenderTarget(rtB); renderer.render(scene, camera);
    renderer.setRenderTarget(null); mixMat.uniforms.k.value = k * k * (3 - 2 * k);
    renderer.render(quadScene, quadCam);
  }

  const clock = new THREE.Clock();
  let first = true, introStart = -1, elapsed = 0, steamSway = 0;
  function tick() {
    if (!running) return;
    const dt = Math.min(0.05, clock.getDelta()); elapsed += dt;
    progress += (target - progress) * 0.09;
    if (Math.abs(target - progress) < 1e-4) progress = target;
    const vel = target - progress;
    updateBook(progress); updateReveals(dt); frame(progress);
    steamSway += (THREE.MathUtils.clamp(vel * 6, -1, 1) - steamSway) * 0.05;
    steam.forEach((pl, i) => {
      pl.material.uniforms.uTime.value = elapsed + i * 1.3;
      pl.material.uniforms.uSway.value = steamSway;
      pl.rotation.y = Math.atan2(camera.position.x - pl.position.x, camera.position.z - pl.position.z) + (i - 1) * 0.5;
    });
    if (introOn && introStart >= 0) setLamp(lampCurve(elapsed - introStart));
    render();
    if (first) { first = false; document.documentElement.classList.add('webgl-ready'); introStart = elapsed + 0.7; }
    requestAnimationFrame(tick);
  }
  // test hook: lets a screenshot script jump to a section without smoothing
  window.__desk = { jump(p) { target = progress = p; }, lampOn() { introStart = -1; setLamp(1); } };
  requestAnimationFrame(tick);
}
