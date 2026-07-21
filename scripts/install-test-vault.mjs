import { access, copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const requestedVault = process.argv[2] ?? process.env.OBSIDIAN_TEST_VAULT;
if (!requestedVault) {
  throw new Error(
    'Informe um cofre isolado: npm run install:test -- /caminho/do/cofre',
  );
}

const vaultRoot = resolve(requestedVault);
const obsidianDirectory = resolve(vaultRoot, '.obsidian');
await access(obsidianDirectory);
const destination = resolve(obsidianDirectory, 'plugins/obsidian-accessibility');

await mkdir(destination, { recursive: true });
await Promise.all(
  ['main.js', 'manifest.json', 'styles.css'].map((file) =>
    copyFile(resolve(pluginRoot, file), resolve(destination, file)),
  ),
);

console.log(`Plugin instalado no cofre isolado: ${destination}`);
