import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const destination = resolve(
  pluginRoot,
  '../prototypes/f1-test-vault/.obsidian/plugins/obsidian-accessibility',
);

await mkdir(destination, { recursive: true });
await Promise.all(
  ['main.js', 'manifest.json', 'styles.css'].map((file) =>
    copyFile(resolve(pluginRoot, file), resolve(destination, file)),
  ),
);

console.log(`Plugin instalado no cofre isolado: ${destination}`);
