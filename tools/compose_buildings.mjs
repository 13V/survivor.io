// Canonical iso-building composer (outputs public/assets/sprites/env/buildings_v2/*.png).
//
// Buildings are assembled as TRUE isometric prisms: the footprint W×D and height (floors×FH)
// define the prism corners, and each real wall/roof tile face is affine-mapped onto destination
// parallelograms derived from those corners. Because the three visible faces (roof, front-left,
// front-right) share corners by construction, walls and roof are FLUSH with no recess/overhang —
// unlike blitting the pre-sliced tiles at fixed offsets. The composer screen scale (SX=64, SY=32
// px/cell) matches one in-game iso cell, so buildings drop in at scale 1 and their footprint lines
// up with a block's 4×4 lot. The manifest records each PNG's near-corner anchor + footprint so the
// game can seat and depth-sort them.
//
// Requires the source "Isometric Tiles" tileset extracted to SRC below (not committed). Run with:
//   node tools/compose_buildings.mjs
import pw from '/home/user/survivor.io/node_modules/playwright/index.js';
const { chromium } = pw.default ?? pw;
import fs from 'fs';

const SRC = "/tmp/envpack/iso/Isometric Tiles/";
const OUT = "/home/user/survivor.io/public/assets/sprites/env/buildings_v2/";

// projection: one cell vertex V(i,j) = (Ox + (i-j)*SX, Oy + (i+j)*SY)
const SX = 64, SY = 32, FH = 129;

const MAT = {
  brick:    { plain: "Wall D1", win: ["Wall D18", "Wall D20"], door: "Wall D11" },
  concrete: { plain: "Wall B1", win: ["Wall B21"],             door: "Wall B23" },
  dark:     { plain: "Wall A1", win: ["Wall A19"],             door: "Wall A23" },
};
const ROOF = "Roof B1";
const PARAPET = "Roof A3";
const PROPS = ["Object4", "Object5", "Object6"];
const BLOOD = ["Splat 1", "Splat 2", "Splat 3"];

const BUILDINGS = [
  { slug: "brick_3x3_f2",    material: "brick",    W: 3, D: 3, floors: 2, door: true  },
  { slug: "brick_4x3_f1",    material: "brick",    W: 4, D: 3, floors: 1, door: true  },
  { slug: "brick_4x4_f2",    material: "brick",    W: 4, D: 4, floors: 2, door: false },
  { slug: "concrete_3x3_f1", material: "concrete", W: 3, D: 3, floors: 1, door: true  },
  { slug: "concrete_4x4_f2", material: "concrete", W: 4, D: 4, floors: 2, door: false },
  { slug: "concrete_3x4_f2", material: "concrete", W: 3, D: 4, floors: 2, door: false },
  { slug: "dark_4x3_f2",     material: "dark",     W: 4, D: 3, floors: 2, door: true  },
  { slug: "dark_3x4_f1",     material: "dark",     W: 3, D: 4, floors: 1, door: true  },
  { slug: "dark_4x4_f1",     material: "dark",     W: 4, D: 4, floors: 1, door: false },
];

function neededFiles() {
  const set = new Set();
  const addSE = (b) => { set.add(b + "_S.png"); set.add(b + "_E.png"); };
  for (const m of Object.values(MAT)) { addSE(m.plain); addSE(m.door); m.win.forEach(addSE); }
  addSE(ROOF); addSE(PARAPET);
  PROPS.forEach(addSE); BLOOD.forEach(addSE);
  return [...set];
}
const toURL = (f) => "data:image/png;base64," + fs.readFileSync(SRC + f).toString("base64");

const browser = await chromium.launch();
const page = await browser.newPage();
const files = neededFiles();
const data = {};
for (const f of files) { try { data[f] = toURL(f); } catch {} }

const result = await page.evaluate(async ({ data, BUILDINGS, MAT, ROOF, PARAPET, PROPS, BLOOD, SX, SY, FH }) => {
  const load = (src) => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = src; });
  const IMG = {};
  for (const [n, s] of Object.entries(data)) IMG[n] = await load(s);
  const S = (b) => IMG[b + "_S.png"];
  const E = (b) => IMG[b + "_E.png"];

  // --- detect a tile's face quad once, cached ---
  const QCACHE = new Map();
  function wallQuad(img) {
    // walls have vertical side edges -> bl/tl at x_min column, br/tr at x_max column
    if (QCACHE.has(img)) return QCACHE.get(img);
    const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
    const ctx = cv.getContext('2d'); ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, img.width, img.height).data;
    const W = img.width, H = img.height; const A = (x, y) => d[(y * W + x) * 4 + 3];
    let xmin = 1e9, xmax = -1;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (A(x, y) > 40) { if (x < xmin) xmin = x; if (x > xmax) xmax = x; }
    const colExtent = (x0, x1) => { let top = 1e9, bot = -1; for (let x = x0; x <= x1; x++) for (let y = 0; y < H; y++) if (A(x, y) > 40) { if (y < top) top = y; if (y > bot) bot = y; } return [top, bot]; };
    const [lt, lb] = colExtent(xmin, xmin + 2);
    const [rt, rb] = colExtent(xmax - 2, xmax);
    const q = { bl: [xmin, lb], tl: [xmin, lt], br: [xmax, rb], tr: [xmax, rt] };
    QCACHE.set(img, q); return q;
  }
  function diamondQuad(img) {
    if (QCACHE.has(img)) return QCACHE.get(img);
    const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
    const ctx = cv.getContext('2d'); ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, img.width, img.height).data;
    const W = img.width, H = img.height; const A = (x, y) => d[(y * W + x) * 4 + 3];
    let top = [0, 1e9], bot = [0, -1], left = [1e9, 0], right = [-1, 0];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (A(x, y) > 40) {
      if (y < top[1]) top = [x, y]; if (y > bot[1]) bot = [x, y];
      if (x < left[0]) left = [x, y]; if (x > right[0]) right = [x, y];
    }
    const q = { top, bot, left, right }; QCACHE.set(img, q); return q;
  }

  // affine map: src triangle (s0,s1,s2) -> dst (d0,d1,d2); draw whole image
  function drawAffine(ctx, img, s0, s1, s2, d0, d1, d2) {
    const us = [s1[0] - s0[0], s1[1] - s0[1]], vs = [s2[0] - s0[0], s2[1] - s0[1]];
    const ud = [d1[0] - d0[0], d1[1] - d0[1]], vd = [d2[0] - d0[0], d2[1] - d0[1]];
    const det = us[0] * vs[1] - us[1] * vs[0];
    // inv(M_s) where M_s = [us vs]
    const i00 = vs[1] / det, i01 = -vs[0] / det, i10 = -us[1] / det, i11 = us[0] / det;
    // A = [ud vd] * inv(M_s)
    const a = ud[0] * i00 + vd[0] * i10, b = ud[1] * i00 + vd[1] * i10;
    const c = ud[0] * i01 + vd[0] * i11, dd = ud[1] * i01 + vd[1] * i11;
    const e = d0[0] - (a * s0[0] + c * s0[1]);
    const f = d0[1] - (b * s0[0] + dd * s0[1]);
    ctx.save(); ctx.setTransform(a, b, c, dd, e, f); ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, 0, 0); ctx.restore();
  }

  function mulberry32(seed) { return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  function compose({ material, W, D, floors, door, seedBase }) {
    const mat = MAT[material];
    const rnd = mulberry32(seedBase);
    const CW = 1400, CH = 1400, Ox = 700, Oy = 1050;
    const cv = document.createElement('canvas'); cv.width = CW; cv.height = CH;
    const ctx = cv.getContext('2d');
    const V = (i, j) => [Ox + (i - j) * SX, Oy + (i + j) * SY];
    const up = (p, dy) => [p[0], p[1] - dy];

    const R = floors * FH;

    // ---------- WALLS, back-to-front by (i+j) ----------
    // Face/tile correspondence is by BASE-EDGE DIRECTION (must match the source tile):
    //   _E base slopes DOWN-right  -> front-LEFT face  (j==D, cells i=0..W-1), BL=V(i,D),  BR=V(i+1,D)
    //   _S base slopes UP-right    -> front-RIGHT face (i==W, cells j=0..D-1), BL=V(W,j+1), BR=V(W,j)
    const wallCells = [];
    for (let i = 0; i < W; i++) wallCells.push({ kind: 'L', a: i, key: i + D });          // front-left along j=D
    for (let j = 0; j < D; j++) wallCells.push({ kind: 'R', a: j, key: W + j });          // front-right along i=W
    wallCells.sort((u, v) => u.key - v.key);

    const doorI = W - 1; // near corner on the front-left face

    const drawFace = (tileImg, BL, BR) => {
      const TL = up(BL, FH), TR = up(BR, FH);
      const q = wallQuad(tileImg);
      drawAffine(ctx, tileImg, q.bl, q.br, q.tl, BL, BR, TL);
    };

    for (let f = 0; f < floors; f++) {
      for (const wc of wallCells) {
        if (wc.kind === 'L') {
          const i = wc.a;
          const BL = up(V(i, D), f * FH), BR = up(V(i + 1, D), f * FH);
          drawFace(E(mat.plain), BL, BR);               // opaque underlay
          let ov = null;
          if (door && f === 0 && i === doorI) ov = E(mat.door);
          else { const r = rnd(); if ((f > 0 ? r < 0.65 : r < 0.4)) ov = E(mat.win[Math.floor(rnd() * mat.win.length)]); else rnd(); }
          if (ov) drawFace(ov, BL, BR);
        } else {
          const j = wc.a;
          const BL = up(V(W, j + 1), f * FH), BR = up(V(W, j), f * FH);
          drawFace(S(mat.plain), BL, BR);
          let ov = null; const r = rnd(); if ((f > 0 ? r < 0.65 : r < 0.4)) ov = S(mat.win[Math.floor(rnd() * mat.win.length)]); else rnd();
          if (ov) drawFace(ov, BL, BR);
        }
      }
    }

    // ---------- ROOF slabs over every cell, back-to-front ----------
    const roofImg = S(ROOF); const rq = diamondQuad(roofImg);
    const cells = [];
    for (let i = 0; i < W; i++) for (let j = 0; j < D; j++) cells.push({ i, j });
    cells.sort((a, b) => (a.i + a.j) - (b.i + b.j));
    for (const c of cells) {
      const T = up(V(c.i, c.j), R), Rr = up(V(c.i + 1, c.j), R), B = up(V(c.i + 1, c.j + 1), R), L = up(V(c.i, c.j + 1), R);
      // map src (top,right,left) -> (T,Rr,L); 4th (bot) follows
      drawAffine(ctx, roofImg, rq.top, rq.right, rq.left, T, Rr, L);
    }

    // ---------- PARAPET: the building's own wall extending a touch above the roof deck.
    // Same material as the walls -> seamless lip (the roof deck at R sits recessed PH below the
    // wall top). We map the TOP slice of the wall tile so brick/block scale isn't squished.
    const PH = 30; // parapet height in px
    const topSliceQuad = (q) => {
      // q.bl/br/tl/tr are the wall face corners; take the top PH px (in dest scale ~1:1) of the face.
      const tl = q.tl, tr = q.tr;
      const bl = [q.tl[0], q.tl[1] + PH], br = [q.tr[0], q.tr[1] + PH];
      return { bl, br, tl, tr };
    };
    const drawPara = (tileImg, BL, BR) => {
      const q = topSliceQuad(wallQuad(tileImg));
      const TL = up(BL, PH), TR = up(BR, PH);
      drawAffine(ctx, tileImg, q.bl, q.br, q.tl, BL, BR, TL);
    };
    const paraCells = [];
    for (let i = 0; i < W; i++) paraCells.push({ kind: 'L', a: i, key: i + D });
    for (let j = 0; j < D; j++) paraCells.push({ kind: 'R', a: j, key: W + j });
    paraCells.sort((u, v) => u.key - v.key);
    for (const pc of paraCells) {
      if (pc.kind === 'L') { const i = pc.a; drawPara(E(mat.plain), up(V(i, D), R), up(V(i + 1, D), R)); }
      else { const j = pc.a; drawPara(S(mat.plain), up(V(W, j + 1), R), up(V(W, j), R)); }
    }

    // ---------- rooftop props (interior cells), simple translate at cell base-center on roof ----------
    {
      const interior = [];
      for (let i = 0; i < W - 1; i++) for (let j = 0; j < D - 1; j++) interior.push({ i, j });
      interior.sort((a, b) => (a.i + a.j) - (b.i + b.j));
      const nProps = 1 + (rnd() < 0.6 ? 1 : 0);
      const pick = new Set();
      const order = interior.slice().sort(() => rnd() - 0.5);
      for (let k = 0; k < nProps && k < order.length; k++) pick.add(order[k].i + ',' + order[k].j);
      for (const c of interior) {
        if (!pick.has(c.i + ',' + c.j)) continue;
        const propImg = S(PROPS[Math.floor(rnd() * PROPS.length)]);
        // object tiles share the (64,208) base-center convention; sit on the roof cell-center, lifted by R
        const cx = Ox + (c.i + 0.5 - (c.j + 0.5)) * SX;
        const cy = Oy + (c.i + 0.5 + (c.j + 0.5)) * SY - R;
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(propImg, cx - 64, cy - 208);
        ctx.restore();
      }
    }

    // ---------- ground blood at near corner ----------
    {
      const g = S(BLOOD[Math.floor(rnd() * BLOOD.length)]); const gq = diamondQuad(g);
      const i = W - 1, j = D - 1;
      const T = V(i, j), Rr = V(i + 1, j), B = V(i + 1, j + 1), L = V(i, j + 1);
      drawAffine(ctx, g, gq.top, gq.right, gq.left, T, Rr, L);
    }

    // ---------- alpha-trim ----------
    const id = ctx.getImageData(0, 0, CW, CH).data;
    let minX = 1e9, minY = 1e9, maxX = -1, maxY = -1;
    for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) if (id[(y * CW + x) * 4 + 3] > 8) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
    const tw = maxX - minX + 1, th = maxY - minY + 1;
    const out = document.createElement('canvas'); out.width = tw; out.height = th;
    out.getContext('2d').drawImage(cv, minX, minY, tw, th, 0, 0, tw, th);
    const near = V(W, D); // front/near ground corner (footprint outer vertex)
    return { dataURL: out.toDataURL('image/png'), w: tw, h: th, anchorX: near[0] - minX, anchorY: near[1] - minY, W, D, floors };
  }

  const outputs = [];
  let seed = 4242;
  for (const b of BUILDINGS) { outputs.push({ slug: b.slug, material: b.material, ...compose({ ...b, seedBase: seed }) }); seed += 137; }
  return outputs;
}, { data, BUILDINGS, MAT, ROOF, PARAPET, PROPS, BLOOD, SX, SY, FH });

for (const f of fs.readdirSync(OUT)) if (f.endsWith(".png")) fs.unlinkSync(OUT + f);
const manifest = { tiles: [] };
for (const o of result) {
  const file = `building_${o.slug}.png`;
  fs.writeFileSync(OUT + file, Buffer.from(o.dataURL.split(',')[1], 'base64'));
  manifest.tiles.push({ file, w: o.w, h: o.h, anchorX: Math.round(o.anchorX), anchorY: Math.round(o.anchorY), W: o.W, D: o.D, floors: o.floors });
  console.log(`${file}  ${o.w}x${o.h}  anchor(${o.anchorX.toFixed(0)},${o.anchorY.toFixed(0)})`);
}
fs.writeFileSync(OUT + "manifest.json", JSON.stringify(manifest, null, 2));
fs.writeFileSync("/tmp/bv2_anchors.json", JSON.stringify(result.map(o => ({ slug: o.slug, w: o.w, h: o.h, anchorX: o.anchorX, anchorY: o.anchorY, W: o.W, D: o.D, floors: o.floors })), null, 2));
await browser.close();
console.log("done");
