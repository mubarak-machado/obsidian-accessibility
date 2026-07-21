# Obsidian Accessibility

Mobile-friendly accessibility controls for Obsidian, designed primarily for reading and presenting long-form notes on iPad.

## Features

- a persistent circular accessibility button with a high-visibility filled icon that opens a compact vertical control;
- a recoverable Zen mode that reduces navigation chrome without blocking the right-side Outline drawer;
- independent scales for Reading view and Live Preview;
- configurable left or right placement;
- persistent settings with a one-tap reset;
- no changes to Markdown files;
- no Node.js or Electron dependency in the mobile bundle.

## Install on iPad with BRAT

1. In Obsidian, install and enable **BRAT** from Community plugins.
2. Open **Settings → BRAT** and choose **Add beta plugin**.
3. Enter `mubarak-machado/obsidian-accessibility`.
4. Let BRAT install the latest release.
5. Open **Settings → Community plugins** and enable **Obsidian Accessibility**.

BRAT handles installation and updates. Obsidian Sync can continue syncing the vault and the plugin settings normally.

## Privacy and scope

The plugin runs locally, does not collect analytics, does not send note contents over the network, and does not write visual preferences into notes.

This repository is the development source of truth and also keeps the three distributable plugin files required by Obsidian releases. It does not include private project records or note contents.

## Development

Version `0.1.1` is the approved behavioral and visual baseline. The authorized TypeScript source, tests, lockfile, build, and CI are reproducible in this repository. Before changing it, read:

- [AGENTS.md](AGENTS.md) — repository workflow, safety constraints, and validation rules;
- [Version 0.1.1 handoff](docs/HANDOFF-v0.1.1.md) — technical baseline and mandatory source-migration task;
- [Development and rollback](docs/DEVELOPMENT.md) — clean setup, isolated test-vault installation, and recovery;
- [Roadmap](docs/ROADMAP.md) — sequenced improvements and human validation gates.

```bash
npm ci
npm run check
```

The source migration reproduced `main.js`, `manifest.json`, and `styles.css` byte for byte; see the [reproducibility record](docs/REPRODUCIBILITY-v0.1.1.md).

## License

[MIT](LICENSE)
