# Reproducibility record for 0.1.1

Validation date: 2026-07-21.

## Result

Version `0.1.1` is reproducible from a clean clone. No behavioral, visual,
metadata, or artifact difference was found after the authorized TypeScript
source migration.

## Clean-clone procedure

The public `main` branch at source-migration commit `f176807` was cloned into a
new temporary directory. The following commands completed successfully:

```bash
npm ci
npm run check
shasum -a 256 main.js manifest.json styles.css
git status -sb
```

The resulting hashes were then encoded in `scripts/verify-release-baseline.mjs`.
After adding that verifier, `npm ci`, `npm run check`, and
`npm run verify:baseline` passed again in the working repository.

Environment used for the recorded run:

- Node.js `v25.8.0`;
- npm `11.11.0`;
- 362 installed packages;
- 0 vulnerabilities reported by npm audit;
- clean working tree after the production build.

## Pipeline evidence

- ESLint: passed;
- Vitest: 3 files and 15 cases passed;
- TypeScript: strict no-emit compilation passed;
- esbuild: production build passed;
- mobile inspection: passed with no Node.js/Electron runtime dependency or
  note-writing route;
- production `main.js`: 17,543 bytes.

## Artifact comparison

| Artifact | Approved SHA-256 | Clean-clone SHA-256 | Result |
|---|---|---|---|
| `main.js` | `97c1a6090b32f5a42813b89c560a6046b15da034ee017feaf7bb678c044c6ca0` | `97c1a6090b32f5a42813b89c560a6046b15da034ee017feaf7bb678c044c6ca0` | identical |
| `manifest.json` | `395f7f350b53e06b98e6b8cadd08693ba914db06d091ba3e30af57213271d9cb` | `395f7f350b53e06b98e6b8cadd08693ba914db06d091ba3e30af57213271d9cb` | identical |
| `styles.css` | `464e5cb687f810c238510f8052f416687085a113540f20d70a4fd01b953799d4` | `464e5cb687f810c238510f8052f416687085a113540f20d70a4fd01b953799d4` | identical |

## Differences

None. The archived lockfile, source, tests, build configuration, manifest,
styles, and versions were transferred without dependency or version changes.

## Scope of physical validation

The migration does not change appearance, touch behavior, orientation, safe
areas, focus, VoiceOver semantics, or control position. Therefore it does not
create a new physical-iPad release gate. The approved `0.1.1` runtime artifact
is exactly the same file already validated on iPad; VoiceOver remains the
documented human retest gap for a later behavioral release.
