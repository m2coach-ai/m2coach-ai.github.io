// Desk scene: a closed record book on a desk under a lamp. Scrolling opens
// the book and turns one page per section. The HTML on top stays the real,
// accessible content; this canvas is decoration and fails quietly.
import * as THREE from 'three';

const canvas = document.querySelector('#desk-canvas');
const stage = document.querySelector('.webgl-stage');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Book dimensions (scene units)
const PW = 1.5, PH = 2.1;          // page
const CW = 1.56, CH = 2.18;        // cover
const COVER_T = 0.035;             // cover board thickness
const BLOCK_H = 0.16;              // page block thickness
const GAP = 0.004;                 // spacing between loose leaves
const SEG = 36;                    // bend segments across a leaf

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
  return [c, g];
}



function coverCanvas() {
  const c = document.createElement('canvas'); c.width = TW; c.height = Math.round(TW * CH / CW);
  const g = c.getContext('2d'); const H = c.height;
  g.fillStyle = CLOTH; g.fillRect(0, 0, TW, H);
  // book cloth weave
  for (let y = 0; y < H; y += 3) { g.fillStyle = `rgba(255,255,255,${0.012 + Math.random() * 0.02})`; g.fillRect(0, y, TW, 1); }
  for (let x = 0; x < TW; x += 3) { g.fillStyle = `rgba(0,0,0,${0.03 + Math.random() * 0.03})`; g.fillRect(x, 0, 1, H); }
  // blind-stamped border
  g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 6; g.strokeRect(70, 70, TW - 140, H - 140);
  g.strokeStyle = 'rgba(255,255,255,0.06)'; g.lineWidth = 2; g.strokeRect(76, 76, TW - 152, H - 152);
  // foil title
  const foil = g.createLinearGradient(0, 380, 0, 700);
  foil.addColorStop(0, '#f0d79a'); foil.addColorStop(0.5, BRASS); foil.addColorStop(1, '#a9834a');
  g.fillStyle = foil; g.textAlign = 'center';
  g.font = '500 128px Newsreader, Georgia, serif';
  g.fillText('A record', TW / 2, 520); g.fillText('of learning.', TW / 2, 650);
  g.fillRect(TW / 2 - 60, 730, 120, 3);
  g.font = '400 52px Newsreader, Georgia, serif'; g.fillText('Mark Martin', TW / 2, 830);
  g.font = 'italic 400 36px Newsreader, Georgia, serif';
  g.fillText('MSc Computer Science (Artificial Intelligence)', TW / 2, H - 220);
  g.fillText('University of Essex Online', TW / 2, H - 170);
  g.textAlign = 'left';
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

// ---------- A bendable leaf ----------
function leafGeometry(w, h) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array((SEG + 1) * 2 * 3), uv = new Float32Array((SEG + 1) * 2 * 2), idx = [];
  for (let j = 0; j < 2; j++) for (let i = 0; i <= SEG; i++) {
    const k = j * (SEG + 1) + i;
    uv[k * 2] = i / SEG; uv[k * 2 + 1] = j === 0 ? 1 : 0;   // row 0 is the far edge (top of page)
    pos[k * 3 + 2] = j === 0 ? -h / 2 : h / 2;
  }
  for (let i = 0; i < SEG; i++) {
    const a = i, b = i + 1, c = SEG + 1 + i, d = SEG + 2 + i;
    idx.push(a, c, b, b, c, d);
  }
  geo.setIndex(idx);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.userData.w = w;
  return geo;
}

// t: 0 lying on the right, 1 lying on the left. bend: how much the free edge lags.
function bendLeaf(geo, t, yBase, bend, lift) {
  const p = geo.attributes.position.array, w = geo.userData.w, ds = w / SEG;
  const theta = t * Math.PI, curl = bend * Math.sin(t * Math.PI);
  let x = 0, y = yBase;
  for (let i = 0; i <= SEG; i++) {
    if (i > 0) {
      const s = (i - 0.5) / SEG;
      let a = theta - curl * Math.pow(s, 1.4) + lift * Math.sin(t * Math.PI) * (1 - s);
      a = Math.min(Math.PI, Math.max(0, a));
      x += Math.cos(a) * ds; y += Math.sin(a) * ds;
    }
    for (let j = 0; j < 2; j++) { const k = (j * (SEG + 1) + i) * 3; p[k] = x; p[k + 1] = y; }
  }
  geo.attributes.position.needsUpdate = true;
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
}

if (canvas && stage && !reducedMotion) {
  start().catch(err => { console.warn('Desk scene unavailable; poster stays visible.', err); });
}

async function start() {
  // Page artwork needs the web fonts before drawing.
  try { await Promise.all(['500 100px Newsreader', 'italic 400 40px Newsreader', '400 40px Newsreader'].map(f => document.fonts.load(f))); } catch {}

  const mobile = matchMedia('(max-width: 700px)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 1.75));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0e0a07);
  scene.fog = new THREE.Fog(0x0e0a07, 6, 13);
  const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 0.05, 40);

  // ---------- Light: one warm lamp does almost all the work ----------
  const hemi = new THREE.HemisphereLight(0x9fb4c8, 0x24160d, 0.34); scene.add(hemi);
  const lampHead = new THREE.Vector3(-2.15, 2.55, -1.15);
  const spot = new THREE.SpotLight(0xffc684, 70, 10, 0.72, 0.7, 1.6);
  spot.position.copy(lampHead);
  spot.target.position.set(0.6, 0, 0.1);
  spot.castShadow = true;
  spot.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  spot.shadow.bias = -0.0004; spot.shadow.radius = 4;
  scene.add(spot, spot.target);
  const glow = new THREE.PointLight(0xffb266, 1.4, 3.5, 2);
  glow.position.copy(lampHead).add(new THREE.Vector3(0, 0.05, 0));
  scene.add(glow);

  // ---------- Room ----------
  const woodTex = makeTexture(woodCanvas(), renderer);
  woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping; woodTex.repeat.set(2, 2);
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(14, 9), new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.62, metalness: 0 }));
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

  // Mug and pencil, kept quiet.
  const ceramic = new THREE.MeshStandardMaterial({ color: 0xd9d2c4, roughness: 0.45, side: THREE.DoubleSide });
  const mug = new THREE.Group(); mug.position.set(2.55, 0, -1.35); scene.add(mug);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.24, 0.55, 48, 1, true), ceramic); body.position.y = 0.275; mug.add(body);
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(0.24, 48), ceramic); bottom.rotation.x = -Math.PI / 2; bottom.position.y = 0.01; mug.add(bottom);
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.245, 48), new THREE.MeshStandardMaterial({ color: 0x2b170c, roughness: 0.2 }));
  coffee.rotation.x = -Math.PI / 2; coffee.position.y = 0.48; mug.add(coffee);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.03, 12, 32, Math.PI * 1.2), ceramic);
  handle.position.set(0.27, 0.28, 0); handle.rotation.z = -Math.PI * 0.6; mug.add(handle);
  mug.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  const pencil = new THREE.Group(); pencil.position.set(1.95, 0.025, 0.75); pencil.rotation.y = 0.55; scene.add(pencil);
  const wood = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.0, 6), new THREE.MeshStandardMaterial({ color: 0x29463d, roughness: 0.6 }));
  wood.rotation.z = Math.PI / 2; pencil.add(wood);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.09, 6), new THREE.MeshStandardMaterial({ color: 0xd8b98a, roughness: 0.8 }));
  tip.rotation.z = Math.PI / 2; tip.position.x = 0.545; pencil.add(tip);
  pencil.traverse(o => { if (o.isMesh) o.castShadow = true; });

  // ---------- The book ----------
  const book = new THREE.Group(); book.rotation.y = -0.06; scene.add(book);
  const clothMat = new THREE.MeshStandardMaterial({ color: CLOTH, roughness: 0.85 });
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0xe2d8c2, roughness: 0.95 });
  const backCover = new THREE.Mesh(new THREE.BoxGeometry(CW, COVER_T, CH), clothMat);
  backCover.position.set(CW / 2, COVER_T / 2, 0); backCover.castShadow = backCover.receiveShadow = true; book.add(backCover);
  const block = new THREE.Mesh(new THREE.BoxGeometry(PW, BLOCK_H, PH), edgeMat);
  block.position.set(PW / 2 + 0.01, COVER_T + BLOCK_H / 2, 0); block.castShadow = block.receiveShadow = true; book.add(block);
  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.05, BLOCK_H + COVER_T * 2, CH), clothMat);
  spine.position.set(-0.015, (BLOCK_H + COVER_T * 2) / 2, 0); spine.castShadow = true; book.add(spine);

  const pageMat = map => new THREE.MeshStandardMaterial({ map, roughness: 0.9, side: THREE.FrontSide });
  const backMat = map => new THREE.MeshStandardMaterial({ map, roughness: 0.9, side: THREE.BackSide });
  const T = c => makeTexture(c, renderer), TM = c => makeTexture(c, renderer, true);

  const about = { chapter: 'Chapter one', title: ['Practice', 'meets inquiry.'], n: 1,
    body: 'I am an educator exploring how computing and artificial intelligence can support careful decisions, meaningful learning and responsible professional practice.' };
  const modules = { chapter: 'Chapter two', title: ['Evidence,', 'not decoration.'], n: 2,
    body: 'Not a gallery of finished work. Evidence of decisions, mistakes, feedback and growth across a programme of study.' };
  const loop = { chapter: 'Chapter three', title: ['Across the', 'programme.'], n: 4,
    body: 'The Learning Loop will connect module reflections, professional skills and action plans into a final view of development.' };

  // leaves[0] is the front cover. Each leaf: front (right page before turning), back (left page after).
  const pages = { endpaper: endpaperPage(), about: chapterPage(about), modules: chapterPage(modules),
    contents: contentsPage(), loop: chapterPage(loop), plan: loopPlanPage() };
  const bind = (page, mirror) => { const t = makeTexture(page.c, renderer, mirror); page.textures.push(t); return t; };
  const leafDefs = [
    { w: CW, h: CH, front: T(coverCanvas()), back: bind(pages.endpaper, true), bend: 0.0, cover: true },
    { w: PW, h: PH, front: bind(pages.about), back: bind(pages.modules, true), bend: 0.9 },
    { w: PW, h: PH, front: bind(pages.contents), back: bind(pages.loop, true), bend: 0.9 },
  ];
  // spreads[k] is what you see when k leaves have been turned
  const spreads = [null, [pages.endpaper, pages.about], [pages.modules, pages.contents], [pages.loop, pages.plan]]
    .map(sp => sp && { pages: sp, r: 0 });
  const lastRight = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), pageMat(bind(pages.plan)));
  lastRight.rotation.x = -Math.PI / 2; lastRight.position.set(PW / 2 + 0.01, COVER_T + BLOCK_H + 0.001, 0);
  lastRight.receiveShadow = true; book.add(lastRight);

  const N = leafDefs.length, rightTop = COVER_T + BLOCK_H;
  const leaves = leafDefs.map((d, i) => {
    const geo = leafGeometry(d.w, d.h);
    const g = new THREE.Group();
    const f = new THREE.Mesh(geo, d.cover ? new THREE.MeshStandardMaterial({ map: d.front, roughness: 0.85 }) : pageMat(d.front));
    const b = new THREE.Mesh(geo, backMat(d.back));
    f.castShadow = b.castShadow = true; f.receiveShadow = b.receiveShadow = true;
    if (!d.cover) g.position.x = 0.01;
    g.add(f, b); book.add(g);
    return { geo, d, i, t: -1 };
  });

  // ---------- Scroll and pointer ----------
  let progress = 0, target = 0;
  const sections = [...document.querySelectorAll('.story .scene')];
  function readScroll() {
    // progress = which section is centred, as a continuous number (0..sections-1)
    const mid = scrollY + innerHeight / 2; let p = 0;
    sections.forEach((s, i) => { const top = s.offsetTop, h = s.offsetHeight; if (mid >= top) p = i + Math.min(1, (mid - top) / h) - 0.5; });
    target = Math.max(0, Math.min(sections.length - 1, p));
  }
  addEventListener('scroll', readScroll, { passive: true }); readScroll(); progress = target;
  const pointer = { x: 0, y: 0 };
  addEventListener('pointermove', e => { pointer.x = e.clientX / innerWidth - 0.5; pointer.y = e.clientY / innerHeight - 0.5; }, { passive: true });

  // ---------- Camera framing ----------
  const look = new THREE.Vector3(), camPos = new THREE.Vector3(), dir = new THREE.Vector3();
  function frame(p) {
    const portrait = innerWidth / innerHeight < 0.85, aspect = innerWidth / innerHeight;
    const open = smooth(0.05, 0.9, p);
    // Where to look and how much width must fit on screen.
    const lookX = portrait ? lerp(0.6, 0.8, open) : lerp(0.35, 0.0, open);
    const fitW = portrait ? lerp(2.6, 1.75, open) : lerp(4.3, 3.8, open);
    const fitH = portrait ? lerp(3.4, 3.0, open) : lerp(3.6, 2.4, open);
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

  function updateBook(p) {
    leaves.forEach(L => {
      // each section turns one leaf; the turn happens in the middle of the scroll between sections
      const t = smooth(L.i + 0.25, L.i + 0.8, p);
      if (Math.abs(t - L.t) < 1e-4) return;
      L.t = t;
      const yRight = rightTop + (N - L.i) * GAP;
      const yLeft = L.d.cover ? COVER_T * 0.5 : COVER_T + (L.i + 1) * GAP;
      bendLeaf(L.geo, t, lerp(yRight, yLeft, t), L.d.bend, L.d.cover ? 0 : 0.25);
    });
    spine.scale.y = lerp(1, 0.25, smooth(0.25, 0.8, p));
    spine.position.y = spine.scale.y * (BLOCK_H + COVER_T * 2) / 2;
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
  const introOn = scrollY < 40;
  const lampCurve = t => {
    if (t < 0) return 0;
    if (t < 0.07) return 0.9; if (t < 0.15) return 0.08; if (t < 0.21) return 0.7; if (t < 0.3) return 0.2;
    return lerp(0.55, 1, smooth(0.3, 1.3, t));
  };
  function setLamp(v) {
    spot.intensity = 70 * v; glow.intensity = 1.4 * v;
    hemi.intensity = 0.34 * (0.3 + 0.7 * v);
    bulb.material.color.copy(bulbOff).lerp(bulbOn, Math.min(1, v * 1.2));
  }
  setLamp(introOn ? 0 : 1);

  // ---------- Page reveals ----------
  // When a spread first lies open and nothing is turning, its ink is written
  // in over REVEAL seconds. It plays once per visit: coming back to a
  // chapter shows the finished page.
  const REVEAL = 1.2;
  function updateReveals(dt) {
    spreads.forEach((sp, k) => {
      if (!sp) return;
      const before = k > 0 ? leaves[k - 1].t : 1, after = k < N ? leaves[k].t : 0;
      const settled = before > 0.999 && after < 0.001;
      if (settled) sp.r = Math.min(1, sp.r + dt / REVEAL);
      sp.pages.forEach(pg => pg.draw(sp.r));
    });
  }

  const clock = new THREE.Clock();
  let first = true, introStart = -1, elapsed = 0;
  function tick() {
    if (!running) return;
    const dt = Math.min(0.05, clock.getDelta()); elapsed += dt;
    progress += (target - progress) * 0.09;
    if (Math.abs(target - progress) < 1e-4) progress = target;
    updateBook(progress); updateReveals(dt); frame(progress);
    if (introOn && introStart >= 0) setLamp(lampCurve(elapsed - introStart));
    renderer.render(scene, camera);
    if (first) { first = false; document.documentElement.classList.add('webgl-ready'); introStart = elapsed + 0.7; }
    requestAnimationFrame(tick);
  }
  // test hook: lets a screenshot script jump to a section without smoothing
  window.__desk = { jump(p) { target = progress = p; }, lampOn() { introStart = -1; setLamp(1); } };
  requestAnimationFrame(tick);
}
