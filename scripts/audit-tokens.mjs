// Token audit (Frontend Bible §10): fails if raw design values leak outside the
// primitives layer in src/styles/tokens.css. Run: npm run audit:tokens
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('../src/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const TOKENS = 'styles/tokens.css';
const files = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(astro|css|ts|tsx|js|mjs)$/.test(f)) files.push(p);
  }
})(ROOT);

const rules = [
  [/#[0-9a-fA-F]{3,8}\b(?![\w-])/g, 'hard-coded hex colour'],
  [/\brgba?\(|\bhsla?\(/g, 'raw rgb()/hsl() colour'],
  [/font-size:\s*[\d.]+px/g, 'px font-size'],
  [/font-family:(?!\s*var\()/g, 'raw font-family'],
  [/border-radius:\s*[\d.]+(px|rem)/g, 'raw border-radius'],
  [/box-shadow:\s*(?!inset 0 0 0 1px var\()[^;]*\d+px/g, 'raw box-shadow'],
  [/\b(?:bg|text|border|fill|stroke|from|to|via|ring|outline|decoration)-\[(?:#|rgb|hsl)/g, 'arbitrary colour utility'],
  [/\btext-\[\d/g, 'arbitrary font-size utility'],
  [/\b(?:rounded|shadow|font)-\[/g, 'arbitrary radius/shadow/font utility'],
  [/var\(--p-/g, 'primitive token used outside tokens.css'],
];

let fails = 0;
for (const file of files) {
  const rel = relative(ROOT, file).split('\\').join('/');
  if (rel === TOKENS) continue;
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (line.includes('audit-ignore')) return;
    for (const [re, why] of rules) {
      re.lastIndex = 0;
      if (re.test(line)) {
        fails++;
        console.log(`src/${rel}:${i + 1}  ${why}\n    ${line.trim()}`);
      }
    }
  });
}
if (fails) {
  console.error(`\nToken audit failed: ${fails} issue(s).`);
  process.exit(1);
}
console.log(`Token audit passed (${files.length} files).`);
