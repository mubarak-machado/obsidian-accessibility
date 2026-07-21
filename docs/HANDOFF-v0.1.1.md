# Version 0.1.1 development handoff

## Purpose

Version `0.1.1` was installed through BRAT and approved on macOS and iPad. It is the behavioral and visual baseline.

The repository currently contains distributable artifacts only. The approved TypeScript source, tests, and build tooling must be migrated before any functional change.

## Validated baseline

| Item | Approved value |
|---|---|
| Plugin | `0.1.1` |
| Obsidian | `1.12.7` on macOS and iPad |
| Minimum Obsidian | `1.12.0` |
| Manifest | `isDesktopOnly: false` |
| iPad | iPad Pro 11-inch M2, iPadOS 26.5 |
| Bundle | 17,543 bytes |
| Tests | 3 files, 15 cases |
| Dependency audit | 0 known vulnerabilities on 2026-07-21 |
| Release | [`0.1.1`](https://github.com/mubarak-machado/obsidian-accessibility/releases/tag/0.1.1) |

### Approved artifact hashes

| File | SHA-256 |
|---|---|
| `main.js` | `97c1a6090b32f5a42813b89c560a6046b15da034ee017feaf7bb678c044c6ca0` |
| `manifest.json` | `395f7f350b53e06b98e6b8cadd08693ba914db06d091ba3e30af57213271d9cb` |
| `styles.css` | `464e5cb687f810c238510f8052f416687085a113540f20d70a4fd01b953799d4` |

The hashes matched the approved build, the macOS installation, and an independent release download.

## Mandatory first task: migrate the source

1. Research the current [Obsidian sample plugin](https://github.com/obsidianmd/obsidian-sample-plugin) and comparable mobile plugins.
2. Obtain the maintainer-authorized archival TypeScript snapshot that produced `0.1.1`; do not treat reverse-engineered `main.js` as source.
3. Move source, tests, lockfile, scripts, and build configuration into this repository.
4. Prefer conventional root folders such as `src/`, `tests/`, and `scripts/`, subject to current official guidance.
5. Do not change behavior, CSS, dependencies, manifest version, or release assets during migration.
6. Run the complete check pipeline and rebuild the distributable artifacts.
7. Compare rebuilt hashes with the baseline and explain every difference.
8. Add CI only after local reproducibility is proven.
9. Commit the migration separately from later improvements.

## Preserved architecture

```text
main
  ├── ScaleStore: schema, normalization, persistence, and migration
  ├── ScaleController: CSS tokens and active-leaf lifecycle
  ├── FontScaleControl: button, panel, and input handling
  ├── positioning: side, containment, and safe areas
  ├── reading-anchor: position preservation while scaling
  └── settings model/tab: preferences and validation
```

- `onload()` registers commands and mounts one root in the active Markdown leaf.
- `onunload()` removes the root, listeners, timers, observers, classes, and CSS variables.
- TypeScript owns behavior; CSS owns appearance.
- A native HTML range is rotated for reliable vertical behavior.
- The mobile bundle is inspected for Node/Electron imports and note-writing routes.

## Behavior that must not regress

- Reading and Live Preview retain independent sizes.
- The control supports left and right placement.
- Only the button remains visible while closed.
- The open panel overlays the button and never reflows the note.
- Minimum is at the bottom and maximum at the top.
- The thumb remains centered and keeps breathing room at both limits.
- `+` and `−` are vertically aligned.
- The value and text-only `Reset` share typography and visual weight.
- Outside interaction and `Escape` close the panel.
- Scaling preserves position and never modifies the note.
- Deactivation and reload leave no residual UI or styling.

## Known limits

- VoiceOver lacks a separate final human test record and must be explicitly retested.
- The plugin is not in the official Obsidian community catalog.
- Future Obsidian and iPadOS versions need fresh compatibility research.
- Presentation mode, editing protection, toolbar integration, and advanced reading aids are future work.

## Successful handoff gate

Migration is complete only when a clean clone runs all checks, TypeScript becomes the source of truth, production assets are generated, behavior matches `0.1.1`, hash differences are accepted explicitly, and the migration commit contains no feature or visual change.

Continue with [the roadmap](ROADMAP.md) only after this gate.
