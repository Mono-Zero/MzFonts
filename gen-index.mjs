import fs from 'node:fs';
import path from 'node:path';

const DOMAIN = 'https://mzfonts.pages.dev';
const order = fs.readFileSync('fonts.txt', 'utf8').split('\n')
  .map(s => s.trim()).filter(s => s && !s.startsWith('#'));
const esc = s => s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

const fonts = [];
for (const name of order) {
  const css = path.join('dist', name, 'index.css');
  if (!fs.existsSync(css)) continue;
  const m = fs.readFileSync(css, 'utf8').match(/font-family:\s*'([^']+)'/);
  if (m) fonts.push({ name, family: m[1] });
}

const rows = fonts.map(f => `
<li data-name="${esc(f.name)}" data-css="${DOMAIN}/${esc(f.name)}/index.css" data-family="${esc(f.family)}">
  <div class="top"><b>${esc(f.name)}</b><code>${esc(f.family)}</code></div>
  <p class="prev" style="font-family:'${esc(f.family)}',serif">The quick brown fox jumps over the lazy dog</p>
  <button data-copy="link">Copy link tag</button>
  <button data-copy="family">Copy font-family</button>
</li>`).join('');

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MzFonts</title>
<style>
:root{--bg:#fff;--fg:#111;--mut:#666;--card:#f4f4f4;--line:#ddd}
@media (prefers-color-scheme:dark){:root{--bg:#111;--fg:#eee;--mut:#999;--card:#1b1b1b;--line:#333}}
body{margin:0;padding:24px;background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,sans-serif;max-width:760px;margin-inline:auto}
h1{margin:0 0 4px}.sub{color:var(--mut);margin:0 0 20px}
pre,code{font-family:ui-monospace,monospace;font-size:14px}
pre{background:var(--card);padding:12px;border-radius:8px;overflow-x:auto}
input{width:100%;box-sizing:border-box;padding:10px;font-size:16px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--fg);margin:12px 0}
ul{list-style:none;padding:0}li{background:var(--card);border-radius:8px;padding:12px 14px;margin-bottom:10px}
.top{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}.top code{color:var(--mut)}
.prev{font-size:24px;margin:8px 0}
button{font:inherit;font-size:13px;padding:5px 10px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--fg);cursor:pointer;margin-right:6px}
.bar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.btns{display:flex;gap:6px}
a.btn{font:inherit;font-size:13px;padding:5px 10px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--fg);text-decoration:none}
dialog{border:1px solid var(--line);border-radius:12px;background:var(--bg);color:var(--fg);padding:0;max-width:520px;width:calc(100% - 32px)}
dialog::backdrop{background:rgba(0,0,0,.5)}
.dbox{padding:20px 22px}
.dbox h2{margin:0 0 10px}.dbox ul{padding-left:20px}.dbox li{background:none;padding:0;margin:0 0 8px;border-radius:0}
</style></head><body>
<div class="bar"><h1>MzFonts</h1><div class="btns"><button id="pbtn" type="button">Privacy</button><a class="btn" href="mailto:support.prissy342@passmail.net">Email me</a></div></div>
<p class="sub">Open-license web fonts. No logging, no tracking, no cookies. ${fonts.length} families.</p>
<p>Paste this in your &lt;head&gt;, then use the family name in CSS:</p>
<pre>&lt;link rel="stylesheet" href="${DOMAIN}/roboto/index.css"&gt;</pre>
<input id="q" placeholder="Search fonts" autocomplete="off">
<ul id="list">${rows}</ul>
<dialog id="pdlg"><div class="dbox">
<h2>Privacy: what happens</h2>
<p>When a site loads a font from MzFonts, your browser requests a static file. That is all.</p>
<ul>
<li><b>What MzFonts does:</b> no analytics, no cookies, no tracking scripts, and no request logs kept by me.</li>
<li><b>What your browser sends anyway:</b> your IP address, the file it wants, and normal headers (including which site asked for the font). Every web request works this way.</li>
<li><b>Who sees it:</b> the files are hosted on Cloudflare, which handles requests on its network under its own privacy policy. I can't turn that off, so I won't claim nobody can see requests.</li>
<li><b>Licenses:</b> fonts keep their original open licenses (mostly SIL OFL). Each font folder includes its LICENSE file.</li>
<li><b>Blockers:</b> if your browser or an extension blocks remote fonts, they won't load from here either.</li>
</ul>
<p>Questions, license concerns, or takedown requests: use the Email me button.</p>
<button type="button" data-close>Close</button>
</div></dialog>
<script>
const items=[...document.querySelectorAll('#list li')];
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){
  const l=document.createElement('link');l.rel='stylesheet';l.href=e.target.dataset.css;
  document.head.appendChild(l);io.unobserve(e.target);}}),{rootMargin:'200px'});
items.forEach(li=>io.observe(li));
document.getElementById('q').addEventListener('input',e=>{
  const v=e.target.value.toLowerCase();
  items.forEach(li=>li.style.display=li.dataset.name.includes(v)?'':'none');});
document.getElementById('list').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  const li=b.closest('li');
  const t=b.dataset.copy==='link'
    ?'<link rel="stylesheet" href="'+li.dataset.css+'">'
    :"font-family: '"+li.dataset.family+"', sans-serif;";
  navigator.clipboard.writeText(t);const o=b.textContent;b.textContent='Copied';setTimeout(()=>b.textContent=o,1000);});
const d=document.getElementById('pdlg');
document.getElementById('pbtn').addEventListener('click',()=>d.showModal());
d.addEventListener('click',e=>{if(e.target===d||e.target.closest('[data-close]'))d.close();});
</script></body></html>`;

fs.writeFileSync('dist/index.html', html);
console.log('wrote dist/index.html with ' + fonts.length + ' fonts');
