import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const approved = {
  'main.js': '97c1a6090b32f5a42813b89c560a6046b15da034ee017feaf7bb678c044c6ca0',
  'manifest.json': '395f7f350b53e06b98e6b8cadd08693ba914db06d091ba3e30af57213271d9cb',
  'styles.css': '464e5cb687f810c238510f8052f416687085a113540f20d70a4fd01b953799d4',
};

const failures = [];
for (const [file, expected] of Object.entries(approved)) {
  const contents = await readFile(file);
  const actual = createHash('sha256').update(contents).digest('hex');
  if (actual !== expected) failures.push(`${file}: esperado ${expected}, obtido ${actual}`);
  else console.log(`${file}: ${actual}`);
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`FALHA: ${failure}`);
  process.exitCode = 1;
} else {
  console.log('Artefatos 0.1.1 idênticos à baseline aprovada.');
}
