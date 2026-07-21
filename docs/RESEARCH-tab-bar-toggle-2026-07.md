# Research — tab-bar toggle

Date: 2026-07-21

## Requirement

Add a button between the current font-size value and the increment button. It
must hide or show Obsidian's main tab bar without changing note content, remain
usable on mobile, expose its state accessibly, and restore the interface when
the plugin unloads.

## Reviewed references

| Candidate | Reviewed version | License | Mobile evidence | Classification and conclusion |
| --- | --- | --- | --- | --- |
| [Obsidian Hider](https://github.com/kepano/obsidian-hider) | [release `1.6.2`](https://github.com/kepano/obsidian-hider/releases/tag/1.6.2) | MIT | `manifest.json` declares `isDesktopOnly: false`; the release requires Obsidian 1.11.1 or newer | **adopt** the proven body-class toggle and the selector scoped through `.mod-root`, which avoids hiding sidebar tab headers |
| [Ultra Zen Mode](https://github.com/MarckFp/ultra-zen-mode) | [release `1.15.0`](https://github.com/MarckFp/ultra-zen-mode/releases/tag/1.15.0) | Apache-2.0 | its README explicitly covers desktop, tablet, and mobile | **adapt** its deterministic class cleanup and command recovery route; **reject** its broader all-workspace tab selector and unrelated zen-mode behavior |
| [Obsidian API](https://github.com/obsidianmd/obsidian-api) | npm package `1.13.1` | MIT | official cross-platform plugin API used by this project | **reject** a direct API call because the public typings expose no supported show/hide operation for the tab bar; keep the undocumented selector isolated in one CSS rule with a no-op failure mode |

The official guidance to keep `onload()` light and clean up registered behavior
was also reviewed in [Optimize plugin load time](https://docs.obsidian.md/plugins/guides/load-time)
and [Events](https://docs.obsidian.md/Plugins/Events).

## Decision

- Persist `tabBarHidden` as a normalized boolean, defaulting to `false` so
  existing users retain the visible interface.
- Toggle one plugin-owned class on `body`; CSS hides only tab-header containers
  inside the root workspace.
- Keep the DOM-dependent selector in CSS. If Obsidian changes its internal
  class, the feature safely becomes a no-op rather than manipulating or
  removing unknown DOM nodes.
- Add a command-palette toggle as a recovery route when the floating control is
  unavailable in a non-Markdown view.
- Remove the plugin-owned class during `onunload()` regardless of the persisted
  preference.
- Use a 44 px toggle button with a stable accessible name and `aria-pressed` to
  expose whether hiding is active.

## Known risk and release gate

`.workspace-tab-header-container` is not a documented public API. A future
Obsidian release or a high-specificity theme rule may stop the CSS from taking
effect. The fallback is intentionally harmless and the command remains
available. Before release, validate the default theme and the actual target
theme on a physical iPad in portrait, landscape, and Split View; confirm touch,
VoiceOver state, focus order, safe areas, hiding, recovery, and plugin unload.
