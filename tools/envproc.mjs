// Environment-tile processor: trims transparent padding, downscales, writes a manifest.
//
//   node tools/envproc.mjs <outDir> <maxSize> <listFile>
//
// <listFile> is a newline-delimited list of absolute source PNG paths. Each is alpha-
// trimmed to its content bbox, downscaled so its longest side <= <maxSize>, written to
// <outDir>/<sanitized>.png, and recorded in <outDir>/manifest.json as
//   { tiles: [{ file, w, h }] }   (w/h are the trimmed+downscaled pixel dims)
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';

const [outDir, maxStr, listFile] = process.argv.slice(2);
if (!outDir || !maxStr || !listFile) {
  console.error('usage: node tools/envproc.mjs <outDir> <maxSize> <listFile>');
  process.exit(1);
}
const MAX = Number(maxStr);
const files = readFileSync(listFile, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
mkdirSync(outDir, { recursive: true });

const sanitize = (p) => p.split('/').pop().replace(/\.png$/i, '').replace(/[^A-Za-z0-9]+/g, '_');

const b = await chromium.launch({ args: ['--no-sandbox'] });
const page = await b.newPage();
const tiles = [];
let skipped = 0;
for (const f of files) {
  const u = 'data:image/png;base64,' + readFileSync(f).toString('base64');
  const out = await page.evaluate(
    async ({ u, MAX }) => {
      const img = new Image();
      img.src = u;
      await img.decode();
      const cv = document.createElement('canvas');
      cv.width = img.width;
      cv.height = img.height;
      const ctx = cv.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
      let x0 = cv.width, y0 = cv.height, x1 = 0, y1 = 0, any = 0;
      for (let y = 0; y < cv.height; y++)
        for (let x = 0; x < cv.width; x++)
          if (d[(y * cv.width + x) * 4 + 3] > 10) {
            any++;
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
          }
      if (any < 30) return null; // effectively empty
      const cw = x1 - x0 + 1, ch = y1 - y0 + 1;
      const scale = Math.min(1, MAX / Math.max(cw, ch));
      const W = Math.max(1, Math.round(cw * scale)), H = Math.max(1, Math.round(ch * scale));
      const o = document.createElement('canvas');
      o.width = W;
      o.height = H;
      const oc = o.getContext('2d');
      oc.imageSmoothingEnabled = true;
      oc.imageSmoothingQuality = 'high';
      oc.drawImage(img, x0, y0, cw, ch, 0, 0, W, H);
      return { data: o.toDataURL('image/png'), w: W, h: H };
    },
    { u, MAX },
  );
  if (!out) {
    skipped++;
    continue;
  }
  const name = sanitize(f) + '.png';
  writeFileSync(`${outDir}/${name}`, Buffer.from(out.data.split(',')[1], 'base64'));
  tiles.push({ file: name, w: out.w, h: out.h });
}
await b.close();
writeFileSync(`${outDir}/manifest.json`, JSON.stringify({ tiles }, null, 0));
console.log(`processed ${tiles.length} -> ${outDir} (skipped ${skipped} empty); files now: ${readdirSync(outDir).length}`);
