# Development, test installation, and rollback

## Supported development environment

CI validates Node.js 20, 22, and 24 on macOS-independent Linux runners. Use a
current release from that range with the committed npm lockfile.

```bash
npm ci
npm run check
```

`npm run check` runs ESLint, 15 Vitest cases, strict TypeScript compilation, a
production esbuild bundle, and the mobile-bundle inspection. During migration
verification, also run:

```bash
npm run verify:baseline
git diff --check
```

## Development loop

Run the watch build from the repository root:

```bash
npm run dev
```

The build writes `main.js` at the repository root. Source belongs in `src/`,
tests in `tests/`, behavior in TypeScript, and appearance in `styles.css`.

## Install in an isolated test vault

Do not use the primary personal vault for routine development. Create or choose
an isolated Obsidian vault, open it once so that `.obsidian/` exists, then run:

```bash
npm run build
npm run install:test -- /absolute/path/to/test-vault
```

The installer refuses to run without an explicit vault and an existing
`.obsidian/` directory. It copies only `main.js`, `manifest.json`, and
`styles.css` into `.obsidian/plugins/obsidian-accessibility/`; it does not copy,
read, or modify notes.

In Obsidian, reload the application, enable **Obsidian Accessibility**, and
verify activation, deactivation, active-leaf changes, Reading view, and Live
Preview. Appearance, touch, orientation, safe-area, focus, VoiceOver, or
position changes still require physical iPad validation before release.

## Roll back a development installation

1. Disable **Obsidian Accessibility** in the test vault.
2. Preserve `data.json` if the saved development settings are needed.
3. Replace only `main.js`, `manifest.json`, and `styles.css` with the assets from
   the immutable [0.1.1 release](https://github.com/mubarak-machado/obsidian-accessibility/releases/tag/0.1.1), or let BRAT reinstall that release.
4. Confirm the restored files with `shasum -a 256` against the table below,
   then reload and re-enable the plugin.

Approved rollback hashes:

| Artifact | SHA-256 |
|---|---|
| `main.js` | `97c1a6090b32f5a42813b89c560a6046b15da034ee017feaf7bb678c044c6ca0` |
| `manifest.json` | `395f7f350b53e06b98e6b8cadd08693ba914db06d091ba3e30af57213271d9cb` |
| `styles.css` | `464e5cb687f810c238510f8052f416687085a113540f20d70a4fd01b953799d4` |

The plugin stores preferences in its own `data.json`. Neither installation nor
rollback writes visual preferences into Markdown or frontmatter.
