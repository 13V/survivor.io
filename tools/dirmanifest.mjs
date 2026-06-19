// Generate a simple {tiles:[{file}]} manifest listing the PNGs in a directory.
// Usage: node tools/dirmanifest.mjs <dir>
import { readdirSync, writeFileSync } from 'node:fs';
const dir = process.argv[2];
const files = readdirSync(dir)
  .filter((f) => f.endsWith('.png'))
  .sort();
writeFileSync(`${dir}/manifest.json`, JSON.stringify({ tiles: files.map((f) => ({ file: f })) }, null, 0));
console.log(`${dir}: ${files.length} tiles`);
