# TypeScript source migration research

Research date: 2026-07-21.

## Decision

Migrate the maintainer-authorized `0.1.1` TypeScript snapshot into the public
repository root without changing behavior, dependencies, release metadata, or
distribution assets. Preserve the snapshot lockfile and tool versions until a
clean-clone build has been compared with the approved artifacts.

The migration adopts the current official repository shape, but it does not
upgrade the archived source to newer APIs or introduce code from another
plugin.

## Reviewed sources

| Source | Reviewed commit | License | Mobile evidence | Classification and conclusion |
|---|---|---|---|---|
| [Obsidian sample plugin](https://github.com/obsidianmd/obsidian-sample-plugin/tree/23c165fd362d4049330cb3edad6a52914ff2007a) | `23c165fd362d4049330cb3edad6a52914ff2007a` | 0BSD | `manifest.json` has `isDesktopOnly: false`; the build emits CommonJS for `es2021` and keeps Obsidian/runtime modules external | **adopt** the root `src/`, TypeScript, esbuild, ESLint, manifest, and lockfile layout; **reject** changing the archived dependency graph during migration |
| [Obsidian releases registry](https://github.com/obsidianmd/obsidian-releases/tree/df00d76b5ddc5c90595fec38c54ef00102d61076) | `df00d76b5ddc5c90595fec38c54ef00102d61076` | no repository license; policy/data reference only | compatibility is selected from `manifest.json` and `versions.json`; installation downloads `manifest.json`, `main.js`, and `styles.css` from a matching release | **adopt** the release and compatibility contract; no source code is copied |
| [BRAT developer guide](https://github.com/TfTHacker/obsidian42-brat/blob/e0908d3b8bf83397abcca3c70106c2236b861d71/BRAT-DEVELOPER-GUIDE.md) | `e0908d3b8bf83397abcca3c70106c2236b861d71` | MIT | BRAT `2.2.0` has `isDesktopOnly: false` and installs matching GitHub release assets | **adapt** the release verification contract; BRAT remains a distribution channel, not a runtime dependency |
| [Note Toolbar](https://github.com/chrisgurney/obsidian-note-toolbar/tree/34e91c21565b2a9a790e9027b4619d16cdf7880f) | `34e91c21565b2a9a790e9027b4619d16cdf7880f` | GPL-3.0 | version `1.34.11` declares `isDesktopOnly: false` | **adapt concepts only** for active-leaf lifecycle, safe areas, and contained floating UI; no GPL code is copied |
| [Mobile Pinch Zoom](https://github.com/hata-suriiken/obsidian-mobile-pinch-zoom/tree/8fe3152eb82c2084fbb847e1c445312145134b66) | `8fe3152eb82c2084fbb847e1c445312145134b66` | MIT | version `0.6.1` declares `isDesktopOnly: false` and explicitly supports iPad, iPhone, and Android | **adapt** the already-approved scheduling, debounce, and scroll-anchoring concepts; pinch gestures remain outside `0.1.1` and no dependency is added |

## Authorized source provenance

The source of truth is the archived private project at commit
`49a5e8583c97bd4d94be41d1e01c1923e8c6a993`. The plugin implementation was
last changed at `ce8bea637a55764b2894d03cfb431287762cbb7c`; later changes only extended
its archival README. The authorized `plugin/` snapshot contains:

- eight TypeScript source modules under `src/`;
- three Vitest suites with 15 approved cases and one Obsidian mock;
- `package.json`, `package-lock.json`, TypeScript, ESLint, Vitest, and esbuild
  configuration;
- mobile-bundle and isolated test-vault scripts;
- the approved `manifest.json`, `styles.css`, and `versions.json`.

The public `0.1.1` baseline currently matches the archived approved hashes:

| Artifact | SHA-256 |
|---|---|
| `main.js` | `97c1a6090b32f5a42813b89c560a6046b15da034ee017feaf7bb678c044c6ca0` |
| `manifest.json` | `395f7f350b53e06b98e6b8cadd08693ba914db06d091ba3e30af57213271d9cb` |
| `styles.css` | `464e5cb687f810c238510f8052f416687085a113540f20d70a4fd01b953799d4` |

## Migration constraints

1. Copy the authorized snapshot into conventional root folders; do not derive
   source from the bundled `main.js`.
2. Keep package and manifest version `0.1.1`, `isDesktopOnly: false`, and the
   existing dependency lock unchanged.
3. Keep appearance in CSS and behavior in TypeScript.
4. Preserve the active-leaf-only root, complete lifecycle cleanup, reading
   anchor, safe areas, reduced motion, focus, touch targets, and left/right
   placement.
5. Make `npm ci` followed by `npm run check` the clean-clone validation path.
6. Compare all rebuilt distributable artifacts with the approved hashes and
   explain any unavoidable difference before adding CI.

## Rejected alternatives

- Reverse engineering `main.js`: it would lose source intent and violate the
  handoff provenance requirement.
- Starting from the sample plugin and recreating behavior: unnecessary and
  likely to drift from the approved iPad build.
- Updating dependencies during migration: mixes reproducibility work with an
  upgrade and makes artifact differences ambiguous.
- Adopting Note Toolbar or Mobile Pinch Zoom as dependencies: both are broader
  than the required control, and Note Toolbar's GPL license is incompatible
  with copying code into this MIT repository without changing obligations.
