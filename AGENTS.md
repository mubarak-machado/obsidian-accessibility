# AGENTS.md

This file defines the operating contract for agents working on **Obsidian Accessibility**.

## Project state

- The approved baseline is version `0.1.1`.
- The authorized TypeScript source migration is complete and reproduces the approved artifacts byte for byte.
- Preserve the migration evidence in [the research record](docs/RESEARCH-source-migration-2026-07.md) and [reproducibility record](docs/REPRODUCIBILITY-v0.1.1.md).
- Do not combine a feature with a refactor, dependency upgrade, source migration, or version bump.

## Git workflow

This is a single-maintainer project.

- Work directly on `main` unless Mubarak explicitly requests another workflow.
- Do not create branches or pull requests by default.
- Before editing, run `git status -sb`, fetch `origin`, and verify `HEAD...origin/main`.
- Treat pre-existing changes as user-owned until their scope is understood.
- Stage only intended files, commit them together, push `main`, and verify divergence is `0 0`.

## Research before implementation

Every new feature or improvement begins with external research.

1. Prioritize GitHub, official documentation, standards, and auditable source code.
2. Record the repository, reviewed commit or release, license, mobile compatibility, and conclusion.
3. Classify each candidate as `adopt`, `adapt`, or `reject`.
4. Prefer proven approaches; create a new mechanism only after documenting why alternatives do not satisfy the requirement.
5. Isolate undocumented Obsidian internals behind a compatibility layer with a fallback and recorded risk.

Primary references:

- [Obsidian sample plugin](https://github.com/obsidianmd/obsidian-sample-plugin)
- [Obsidian community plugin requirements](https://github.com/obsidianmd/obsidian-releases)
- [BRAT developer guide](https://github.com/TfTHacker/obsidian42-brat/blob/main/BRAT-DEVELOPER-GUIDE.md)

## Product invariants

- Mobile-first; keep `isDesktopOnly: false`.
- No Node.js or Electron dependency in the mobile runtime bundle.
- Never write visual preferences into Markdown, frontmatter, or note content.
- Mount one plugin root, limited to the active Markdown leaf.
- Keep `onload()` light and make `onunload()` remove UI, classes, variables, events, observers, and timers.
- Normalize invalid persisted configuration to safe values.
- Keep appearance in CSS and behavior in TypeScript.
- Isolate DOM-dependent behavior so it can fail without breaking the plugin.
- Preserve safe areas, reduced motion, keyboard focus, touch usability, and left/right placement.

## Approved control baseline

- One small persistent floating button.
- A narrow vertical panel opens temporarily over the button without reserving page width.
- Order: current value, separator, `+`, vertical range, `−`, separator, text-only `Reset`.
- Minimum is at the bottom; maximum is at the top.
- Reading range: 32–75 px. Live Preview range: 40–60 px.
- Outside interaction, `Escape`, repeated activation, or context change closes the panel.
- Scaling preserves reading position and never modifies the note.

## Validation contract

Every code change must pass the equivalent of:

```bash
npm ci
npm run check
git diff --check
```

The pipeline must cover lint, tests, TypeScript, production build, and mobile-bundle inspection for Node/Electron imports and note-writing routes.

Appearance, touch, orientation, safe-area, focus, VoiceOver, or position changes require physical iPad validation before release.

## Release and documentation

- Keep `manifest.json`, `versions.json`, package version, tag, and release name coherent.
- Release assets must include `manifest.json`, `main.js`, and `styles.css`.
- Preserve release `0.1.1` as the immutable first-version baseline.
- Keep [the handoff](docs/HANDOFF-v0.1.1.md) immutable.
- Update [the roadmap](docs/ROADMAP.md) when work is completed, reordered, or rejected.
- Do not leave an important decision only in a conversation.
