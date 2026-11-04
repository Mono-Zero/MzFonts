import fs from 'node:fs';

const N = parseInt(process.argv[2] || '300', 10);
const res = await fetch('https://fonts.google.com/metadata/fonts');
if (!res.ok) { console.log('fetch failed: ' + res.status); process.exit(1); }
let txt = await res.text();
txt = txt.replace(/^\)\]\}'\s*/, ''); // strip a possible anti-JSON prefix
const list = JSON.parse(txt).familyMetadataList;

const slug = f => f.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const ranked = list
  .filter(f => !/^Material (Symbols|Icons)/.test(f.family))
  .sort((a, b) => a.popularity - b.popularity)
  .map(f => slug(f.family));

const existing = fs.existsSync('fonts.txt')
  ? fs.readFileSync('fonts.txt', 'utf8').split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#'))
  : [];
const out = [...new Set([...existing, ...ranked.slice(0, N)])];
fs.writeFileSync('fonts.txt', '# most popular first\n' + out.join('\n') + '\n');
console.log('fonts.txt now has ' + out.length + ' entries');
