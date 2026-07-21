# Obsidian Accessibility

Mobile-friendly accessibility controls for Obsidian, designed primarily for reading and presenting long-form notes on iPad.

## Features

- a small floating button that opens a compact vertical font-size control;
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

This repository contains only the distributable plugin files. Development records and the private project repository are not included.

## License

[MIT](LICENSE)
