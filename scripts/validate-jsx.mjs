import fs from 'node:fs';
import process from 'node:process';
import { parse } from '@babel/parser';

const path = process.argv[2];
if (!path) {
  console.error('Usage: node scripts/validate-jsx.mjs <path-to-jsx>');
  process.exit(2);
}

const code = fs.readFileSync(path, 'utf8');
try {
  parse(code, { sourceType: 'module', plugins: ['jsx'] });
  console.log('VALID');
} catch (e) {
  const line = e?.loc?.line;
  console.log('ERROR:', e.message, 'Line:', line);
  const lines = code.split('\n');
  const l = line ? line - 1 : 0;
  for (let i = Math.max(0, l - 3); i <= Math.min(lines.length - 1, l + 3); i++) {
    console.log((i === l ? '>>>' : '   '), i + 1, lines[i]);
  }
  process.exit(1);
}

