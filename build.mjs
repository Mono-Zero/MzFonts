import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const CAP = 19000; // free plan limit is 20,000, leave some headroom
const force = process.argv.includes('--force');
const names = fs.readFileSync('fonts.txt', 'utf8')
  .split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#'));

function countFiles(dir) {
  let n = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    n += e.isDirectory() ? countFiles(path.join(dir, e.name)) : 1;
  }
  return n;
}

function fetchPkg(pkg) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mzf-'));
  try {
    execFileSync('npm', ['pack', pkg, '--pack-destination', tmp, '--silent'],
      { stdio: 'ignore' });
    const tgz = fs.readdirSync(tmp).find(f => f.endsWith('.tgz'));
    execFileSync('tar', ['-xzf', path.join(tmp, tgz), '-C', tmp]);
    return path.join(tmp, 'package');
  } catch {
    fs.rmSync(tmp, { recursive: true, force: true });
    return null;
  }
}

fs.mkdirSync('dist', { recursive: true });
let total = countFiles('dist');
const woffRe = /,\s*url\([^)]*\.woff\)\s*format\('woff'\)/g;

for (const name of names) {
  const dest = path.join('dist', name);
  if (fs.existsSync(dest)) {
    if (!force) { console.log(`skip  ${name} (already built, use --force to redo)`); continue; }
    total -= countFiles(dest);
    fs.rmSync(dest, { recursive: true, force: true });
  }

  let kind = 'variable';
  let src = fetchPkg(`@fontsource-variable/${name}`);
  if (!src) { kind = 'static'; src = fetchPkg(`@fontsource/${name}`); }
  if (!src) { console.log(`MISS  ${name} (not found on Fontsource)`); continue; }

  fs.mkdirSync(path.join(dest, 'files'), { recursive: true });
  for (const f of fs.readdirSync(path.join(src, 'files'))) {
    if (f.endsWith('.woff2'))
      fs.copyFileSync(path.join(src, 'files', f), path.join(dest, 'files', f));
  }
  for (const f of fs.readdirSync(src)) {
    if (f.endsWith('.css')) {
      const css = fs.readFileSync(path.join(src, f), 'utf8').replace(woffRe, '');
      fs.writeFileSync(path.join(dest, f), css);
    }
  }
  if (kind === 'static') {
    const parts = fs.readdirSync(dest)
      .filter(f => /^\d{3}(-italic)?\.css$/.test(f)).sort();
    if (parts.length) {
      fs.writeFileSync(path.join(dest, 'index.css'),
        parts.map(f => fs.readFileSync(path.join(dest, f), 'utf8')).join('\n'));
    }
  }
  if (fs.existsSync(path.join(src, 'LICENSE')))
    fs.copyFileSync(path.join(src, 'LICENSE'), path.join(dest, 'LICENSE'));
  fs.rmSync(path.dirname(src), { recursive: true, force: true });

  const n = countFiles(dest);
  if (total + n > CAP) {
    fs.rmSync(dest, { recursive: true, force: true });
    console.log(`STOP  ${name} would reach ${total + n}/${CAP}. Remove it or split the project.`);
    break;
  }
  total += n;
  console.log(`ok    ${name} (${kind}) +${n} files, total ${total}/${CAP}`);
}
