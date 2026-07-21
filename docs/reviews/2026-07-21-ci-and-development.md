# Code Review: CI and development workflow

## Summary

The change adds a read-only GitHub Actions check matrix, makes isolated-vault
installation explicit and portable, documents rollback, and closes Milestone 0
without changing the plugin runtime or release artifacts.

## Critical issues

None.

## Resolved during review

The first workflow draft ran the immutable `0.1.1` hash verifier on every
future change. That would incorrectly reject a legitimate later version. The
workflow now runs the complete general pipeline and checks that the generated
artifacts match the files committed by the current change. The historical
baseline verifier remains an explicit migration-audit command.

The first rollback draft also referred to the verifier from tag `0.1.1`, where
the script did not yet exist. Rollback now uses direct SHA-256 comparison with
the documented approved hashes.

The first remote matrix run passed on Node.js 24 but npm 10 on Node.js 20 and
22 rejected the archived lockfile while attempting to introduce esbuild 0.28
for Vite's peer range. The workflow now installs the recorded npm `11.11.0`
before `npm ci` on every Node version. This fixes tool-version drift without
changing the dependency graph or approved bundle.

## Review dimensions

### Security

- Workflow permissions are limited to read-only repository contents.
- Third-party Actions are official GitHub Actions pinned to immutable commit
  SHAs corresponding to `checkout@v6` and `setup-node@v6`.
- No repository secret, release write, cache write beyond setup-node's npm
  cache, or privileged event is used.
- The test installer requires an explicit vault with an existing `.obsidian/`
  directory and copies only the three public release artifacts.

### Correctness

- CI covers Node.js 20, 22, and 24 with npm `11.11.0`, then runs install, lint,
  tests, TypeScript, production build, mobile inspection, and
  generated-artifact drift checking.
- A temporary isolated vault installation reproduced all three approved hashes.
- README, operating contract, roadmap, development instructions, and the
  immutable handoff now describe consistent project states.

### Performance

- The matrix has three bounded jobs with npm caching and no redundant release
  build or deployment.
- The installer copies three small files once and performs no directory scan.

### Maintainability

- The test-vault path is supplied by argument or `OBSIDIAN_TEST_VAULT`; no
  archived private-project path remains in public tooling.
- General CI does not encode a permanent dependency on the `0.1.1` hashes.
- Roadmap completion links to the research, migration, and reproduction
  evidence instead of relying on conversation history.

## Verdict

Approve, subject to the first remote CI run completing successfully after push.

Local validation: `npm ci`, `npm run check`, `npm run verify:baseline`, isolated
test-vault installation, artifact SHA-256 comparison, and `git diff --check`.
