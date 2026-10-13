import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const FONT = '"Helvetica Neue", Arial, sans-serif';

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

function canvasTex(w: number, h: number, draw: Draw, srgb = true) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (ctx) draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// Inner lining: glossy black resin with the electronics showing through.
// u runs around the ring (0..1), v runs across the band width.
function drawLining(ctx: CanvasRenderingContext2D, W: number, H: number, v0: number, v1: number) {
  ctx.fillStyle = '#060607';
  ctx.fillRect(0, 0, W, H);
  const y0 = v0 * H;
  const y1 = v1 * H;
  const bh = y1 - y0;
  const rnd = (() => {
    let s = 11;
    return () => ((s = (s * 16807) % 2147483647) / 2147483647);
  })();
  const block = (x: number, w: number, inset: number, col: string, r = 6) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.roundRect(x, y0 + bh * inset, w, bh * (1 - inset * 2), r);
    ctx.fill();
  };
  // battery (long curved cell) and flex PCB, faintly visible
  block(W * 0.52, W * 0.4, 0.2, '#1c1d20', 10);
  ctx.strokeStyle = 'rgba(120,125,135,0.25)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const y = y0 + bh * (0.25 + i * 0.1);
    ctx.beginPath();
    ctx.moveTo(W * 0.54, y);
    ctx.lineTo(W * 0.9, y);
    ctx.stroke();
  }
  // sensor module area: chips and traces
  for (let i = 0; i < 26; i++) {
    const x = W * (0.02 + rnd() * 0.46);
    const w = W * (0.006 + rnd() * 0.018);
    const ins = 0.18 + rnd() * 0.25;
    const g = 45 + Math.floor(rnd() * 55);
    block(x, w, ins, `rgb(${g},${g},${g + 4})`, 3);
    if (rnd() > 0.6) {
      ctx.fillStyle = 'rgba(190,160,90,0.55)';
      ctx.fillRect(x + w * 0.2, y0 + bh * (ins + 0.05), w * 0.6, bh * 0.05);
    }
  }
  ctx.strokeStyle = 'rgba(190,165,100,0.45)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 18; i++) {
    const y = y0 + bh * (0.2 + rnd() * 0.6);
    const x = W * rnd() * 0.48;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + W * (0.02 + rnd() * 0.06), y);
    ctx.stroke();
  }
  // printed text
  ctx.fillStyle = 'rgba(225,228,232,0.85)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${bh * 0.2}px ${FONT}`;
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${bh * 0.04}px`;
  ctx.fillText('SAMSUNG', W * 0.7, y0 + bh * 0.5);
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px';
  ctx.font = `500 ${bh * 0.16}px ${FONT}`;
  ctx.fillText('CE', W * 0.6, y0 + bh * 0.5);
  ctx.fillText('8', W * 0.8, y0 + bh * 0.5);
}

function drawEmissive(ctx: CanvasRenderingContext2D, W: number, H: number, v0: number, v1: number) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  const bh = (v1 - v0) * H;
  const cy = v0 * H + bh * 0.5;
  const led = (x: number, col: string, s: number) => {
    const g = ctx.createRadialGradient(x, cy, 0, x, cy, bh * s);
    g.addColorStop(0, col);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - bh, cy - bh, bh * 2, bh * 2);
  };
  led(W * 0.12, 'rgba(60,255,120,0.95)', 0.26);
  led(W * 0.2, 'rgba(255,70,40,0.95)', 0.2);
  led(W * 0.33, 'rgba(60,255,120,0.8)', 0.2);
}

export type RingRig = {
  root: THREE.Group;
  shellMat: THREE.MeshPhysicalMaterial;
  liningMat: THREE.MeshPhysicalMaterial;
  anchors: Record<'titanium' | 'concave' | 'sensor' | 'temp', THREE.Vector3>;
};

export function buildRing(color: number, rough: number): RingRig {
  const g = new THREE.Group();
  const rIn = 9.1; // size 8, ~18.2 mm inner diameter
  const t = 2.6;
  const w = 7.0;
  const rOut = rIn + t;
  const lip = rIn + 0.95;
  const segs = 160;

  // titanium shell: concave outer face, rounded edges, short edge face toward the lining
  const P = [];
  const edgeR = 0.45;
  P.push(new THREE.Vector2(lip, w / 2 - 0.02));
  for (let i = 0; i <= 6; i++) {
    const a = (i / 6) * (Math.PI / 2);
    P.push(new THREE.Vector2(rOut - edgeR + Math.sin(a) * edgeR, w / 2 - edgeR + Math.cos(a) * edgeR));
  }
  const n = 24;
  for (let i = 1; i < n; i++) {
    const y = w / 2 - edgeR - (i / n) * (w - edgeR * 2);
    const k = y / (w / 2 - edgeR);
    P.push(new THREE.Vector2(rOut - 0.38 * (1 - k * k), y));
  }
  for (let i = 0; i <= 6; i++) {
    const a = Math.PI / 2 + (i / 6) * (Math.PI / 2);
    P.push(new THREE.Vector2(rOut - edgeR + Math.sin(a) * edgeR, -w / 2 + edgeR + Math.cos(a) * edgeR));
  }
  P.push(new THREE.Vector2(lip, -w / 2 + 0.02));
  const shellGeo = new THREE.LatheGeometry(P.reverse(), segs);
  const shellMat = new THREE.MeshPhysicalMaterial({ color, metalness: 1, roughness: rough, envMapIntensity: 1.1, clearcoat: 0.4, clearcoatRoughness: 0.15 });
  g.add(new THREE.Mesh(shellGeo, shellMat));

  // inner lining (glossy resin) — edge lip, inner wall, edge lip
  const L: THREE.Vector2[] = [];
  const pts: [number, number][] = [];
  pts.push([lip + 0.05, w / 2 - 0.05]);
  for (let i = 1; i <= 4; i++) {
    const a = (i / 4) * (Math.PI / 2);
    pts.push([rIn + 0.55 - Math.sin(a) * 0.55 + (lip - rIn - 0.55) * Math.cos(a), w / 2 - 0.05 - Math.sin(a) * 0.55]);
  }
  const innerTop = w / 2 - 0.6;
  const m = 20;
  for (let i = 1; i < m; i++) pts.push([rIn, innerTop - (i / m) * innerTop * 2]);
  for (let i = 0; i <= 4; i++) {
    const a = Math.PI / 2 - (i / 4) * (Math.PI / 2);
    pts.push([rIn + 0.55 - Math.sin(a) * 0.55 + (lip - rIn - 0.55) * Math.cos(a), -w / 2 + 0.05 + Math.sin(a) * 0.55]);
  }
  pts.push([lip + 0.05, -w / 2 + 0.05]);
  pts.forEach(([x, y]) => L.push(new THREE.Vector2(x, y)));
  const v0 = 5 / (L.length - 1);
  const v1 = (L.length - 6) / (L.length - 1);
  const liningGeo = new THREE.LatheGeometry(L, segs);
  const liningMap = canvasTex(2048, 256, (c, W, H) => drawLining(c, W, H, v0, v1));
  const liningEm = canvasTex(2048, 256, (c, W, H) => drawEmissive(c, W, H, v0, v1));
  const liningMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    map: liningMap,
    emissive: 0xffffff,
    emissiveMap: liningEm,
    emissiveIntensity: 1.2,
    roughness: 0.12,
    metalness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    side: THREE.DoubleSide,
  });
  g.add(new THREE.Mesh(liningGeo, liningMat));

  // three sensor bumps on the inner wall
  const bumpMat = new THREE.MeshPhysicalMaterial({ color: 0x0b0b0c, roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.03 });
  [0.16, 0.25, 0.42].forEach((u, i) => {
    const a = u * Math.PI * 2;
    const b = new THREE.Mesh(new RoundedBoxGeometry(i === 2 ? 2.6 : 2.0, 2.6, 0.5, 3, 0.22), bumpMat);
    b.position.set(Math.sin(a) * (rIn - 0.12), 0, Math.cos(a) * (rIn - 0.12));
    b.rotation.y = a;
    g.add(b);
  });

  const at = (u: number, r: number, y = 0) => new THREE.Vector3(Math.sin(u * Math.PI * 2) * r, y, Math.cos(u * Math.PI * 2) * r);
  return {
    root: g,
    shellMat,
    liningMat,
    anchors: { titanium: at(0.62, rOut, 2.4), concave: at(0.75, rOut - 0.3, -0.6), sensor: at(0.16, rIn - 0.4), temp: at(0.42, rIn - 0.4) },
  };
}

// ----- charging case -----

function drawCaseLogo(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = `700 ${H * 0.6}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${H * 0.12}px`;
  ctx.fillText('SAMSUNG', W / 2, H / 2);
}

function drawPuckTop(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const c = W / 2;
  const g = ctx.createRadialGradient(c, c, 0, c, c, c);
  g.addColorStop(0, '#f4f4f2');
  g.addColorStop(1, '#e2e2e0');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = W * 0.008;
  ctx.beginPath();
  ctx.arc(c, c, c * 0.32, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#ff8a1a';
  ctx.beginPath();
  ctx.roundRect(c - W * 0.012, c + c * 0.52, W * 0.024, W * 0.07, W * 0.012);
  ctx.fill();
}

function roundedSquare(size: number, r: number) {
  const h = size / 2;
  const sh = new THREE.Shape();
  sh.moveTo(-h + r, -h);
  sh.lineTo(h - r, -h);
  sh.quadraticCurveTo(h, -h, h, -h + r);
  sh.lineTo(h, h - r);
  sh.quadraticCurveTo(h, h, h - r, h);
  sh.lineTo(-h + r, h);
  sh.quadraticCurveTo(-h, h, -h, h - r);
  sh.lineTo(-h, -h + r);
  sh.quadraticCurveTo(-h, -h, -h + r, -h);
  return sh;
}

export type CaseRig = { root: THREE.Group; hinge: THREE.Group; discTop: number; materials: THREE.Material[] };

export function buildCase(): CaseRig {
  const g = new THREE.Group();
  const S = 46;
  const baseH = 19;
  const lidH = 11;
  const acrylic = new THREE.MeshPhysicalMaterial({
    color: 0xeef4f7,
    metalness: 0,
    roughness: 0.02,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    envMapIntensity: 2.4,
    transparent: true,
    opacity: 0.2,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const edge = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.1, envMapIntensity: 3, depthWrite: false });
  const white = new THREE.MeshPhysicalMaterial({ color: 0xf1f1ef, roughness: 0.45, clearcoat: 0.3, clearcoatRoughness: 0.3 });
  const chrome = new THREE.MeshPhysicalMaterial({ color: 0xd8dce0, metalness: 1, roughness: 0.08, envMapIntensity: 1.6, side: THREE.DoubleSide });

  // ----- base: clear block, white core, white top disc, charging puck
  const base = new THREE.Mesh(new RoundedBoxGeometry(S, baseH, S, 6, 8), acrylic);
  base.position.y = baseH / 2;
  g.add(base);
  const baseIn = new THREE.Mesh(new RoundedBoxGeometry(S - 4, baseH - 3, S - 4, 6, 6.5), edge);
  baseIn.position.y = baseH / 2;
  g.add(baseIn);
  const core = new THREE.Mesh(new THREE.CylinderGeometry(16.5, 16.5, baseH - 5, 96), white);
  core.position.y = 2.5 + (baseH - 5) / 2;
  g.add(core);
  const discTop = baseH + 0.5;
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(19.8, 19.8, 1.6, 128), white);
  disc.position.y = discTop - 0.8;
  g.add(disc);
  const discEdge = new THREE.Mesh(new THREE.TorusGeometry(19.8, 0.3, 12, 128), white);
  discEdge.rotation.x = Math.PI / 2;
  discEdge.position.y = discTop - 0.3;
  g.add(discEdge);
  const puckMat = new THREE.MeshPhysicalMaterial({ map: canvasTex(512, 512, drawPuckTop), roughness: 0.4, clearcoat: 0.3 });
  const puck = new THREE.Mesh(new THREE.CylinderGeometry(8.5, 8.7, 6.4, 96), [white, puckMat, white]);
  puck.position.y = discTop + 3.2;
  g.add(puck);
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(17, 2.3), new THREE.MeshBasicMaterial({ map: canvasTex(512, 64, drawCaseLogo), transparent: true, depthWrite: false, color: 0x9aa0a6 }));
  logo.position.set(0, 5.5, S / 2 + 0.02);
  g.add(logo);

  // ----- lid: clear block with an embedded white plate, round window and chrome rim
  const hinge = new THREE.Group();
  hinge.position.set(0, baseH, -S / 2 + 1.5);
  g.add(hinge);
  const lid = new THREE.Group();
  lid.position.set(0, lidH / 2, S / 2 - 1.5);
  hinge.add(lid);
  lid.add(new THREE.Mesh(new RoundedBoxGeometry(S, lidH, S, 6, 8), acrylic));
  lid.add(new THREE.Mesh(new RoundedBoxGeometry(S - 4, lidH - 3, S - 4, 6, 6.5), edge));
  const plateShape = roundedSquare(S - 6, 9);
  const hole = new THREE.Path();
  hole.absarc(0, 0, 13.2, 0, Math.PI * 2, true);
  plateShape.holes.push(hole);
  const plateGeo = new THREE.ExtrudeGeometry(plateShape, { depth: 2, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.3, bevelSegments: 2, curveSegments: 64 });
  plateGeo.translate(0, 0, -1);
  const plate = new THREE.Mesh(plateGeo, white);
  plate.rotation.x = -Math.PI / 2;
  plate.position.y = -lidH / 2 + 3.2;
  lid.add(plate);
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(13.2, 13.2, 2.6, 128, 1, true), chrome);
  rim.position.y = plate.position.y;
  lid.add(rim);
  [1.3, -1.3].forEach((dy) => {
    const t = new THREE.Mesh(new THREE.TorusGeometry(13.2, 0.35, 12, 128), chrome);
    t.rotation.x = Math.PI / 2;
    t.position.y = plate.position.y + dy;
    lid.add(t);
  });
  const hingeBar = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 16, 24), chrome);
  hingeBar.rotation.z = Math.PI / 2;
  hingeBar.position.z = -0.6;
  hinge.add(hingeBar);
  const materials: THREE.Material[] = [];
  g.traverse((o) => {
    const m = (o as THREE.Mesh).material;
    if (!m) return;
    (Array.isArray(m) ? m : [m]).forEach((x) => !materials.includes(x) && materials.push(x));
  });

  return { root: g, hinge, discTop, materials };
}
