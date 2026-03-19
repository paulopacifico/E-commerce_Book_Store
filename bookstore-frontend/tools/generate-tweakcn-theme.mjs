/**
 * Generates src/styles/tweakcn-modern-minimal.css from tools/themes/*.json
 * (same shape as https://tweakcn.com/r/themes/modern-minimal.json)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const themePath = path.join(root, 'tools/themes/modern-minimal.json');
const outPath = path.join(root, 'src/tweakcn-modern-minimal.css');

const data = JSON.parse(fs.readFileSync(themePath, 'utf8'));
const { theme: themeVars, light, dark } = data.cssVars;

function emitVars(obj) {
  return Object.entries(obj)
    .map(([k, v]) => `    --${k}: ${v};`)
    .join('\n');
}

const rootVars = { ...themeVars, ...light };

const themeColors = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'destructive-foreground',
  'border',
  'input',
  'ring',
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
];

let css = `/* Auto-generated from tools/themes/modern-minimal.json — run: npm run theme:generate */
@import "tailwindcss";

/* Scan Angular templates + TS (host bindings) for utility classes */
@source "./**/*.{html,ts}";

@layer base {
  :root {
${emitVars(rootVars)}
  }

  .dark {
${emitVars(dark)}
  }

  * {
    border-color: var(--border);
  }

  body {
    background-color: var(--background);
    color: var(--foreground);
    font-family: var(--font-sans);
    letter-spacing: var(--tracking-normal);
  }
}

@theme inline {
`;

for (const name of themeColors) {
  css += `  --color-${name}: var(--${name});\n`;
}

css += `  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: var(--radius);
  --radius-lg: calc(var(--radius) + 4px);
  --radius-xl: calc(var(--radius) + 8px);
}
`;

fs.writeFileSync(outPath, css);
console.log('Wrote', path.relative(root, outPath));
