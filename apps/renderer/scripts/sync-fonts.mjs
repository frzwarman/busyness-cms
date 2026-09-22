// Copies self-hosted variable fonts (SIL OFL, @fontsource-variable) into public/fonts as static files.
// Static files work identically in `astro dev` (workerd runtime) and on Cloudflare; nothing is fetched from third parties.
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = dirname(fileURLToPath(import.meta.url));
const out = join(root, '..', 'public', 'fonts');
const families = [
  'inter',
  'manrope',
  'dm-sans',
  'space-grotesk',
  'fraunces',
  'playfair-display',
  'lora',
];

mkdirSync(out, { recursive: true });
for (const id of families) {
  const pkgDir = dirname(require.resolve(`@fontsource-variable/${id}/package.json`));
  const css = readFileSync(join(pkgDir, 'index.css'), 'utf8').replaceAll(
    'url(./files/',
    `url(/fonts/${id}/files/`,
  );
  writeFileSync(
    join(out, `${id}.css`),
    `/* @fontsource-variable/${id} — SIL Open Font License 1.1 */\n${css}`,
  );
  const filesDir = join(pkgDir, 'files');
  if (existsSync(filesDir)) cpSync(filesDir, join(out, id, 'files'), { recursive: true });
}
writeFileSync(
  join(out, 'LICENSES.md'),
  `# Fonts\n\nAll families here are variable fonts distributed under the SIL Open Font License 1.1, copied from the \`@fontsource-variable/*\` packages:\n\n${families.map((f) => `- ${f}`).join('\n')}\n`,
);
console.log(`synced ${families.length} font families → public/fonts`);
