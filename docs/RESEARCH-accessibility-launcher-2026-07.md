# Research — universal accessibility launcher

Date: 2026-07-21

## Requirement

Replace the typography-specific `A↕` floating trigger with an icon-only launcher
that can remain stable as Obsidian Accessibility grows beyond text scaling. Keep
the current 72 px touch target, left/right placement, safe-area handling, focus
behavior, panel behavior, and mobile-safe runtime.

## Reviewed references

| Candidate | Reviewed release or page | License | Mobile relevance | Classification and conclusion |
| --- | --- | --- | --- | --- |
| [Apple AssistiveTouch for iPad](https://support.apple.com/guide/ipad/use-assistivetouch-ipad9a2466d3/ipados) | current iPad User Guide, reviewed 2026-07-21 | Apple documentation terms | establishes a persistent floating launcher that opens an expandable accessibility menu | **adapt** the stable floating gateway and circular form; **reject** dragging and idle-opacity behavior for this slice because they add gesture complexity and can reduce discoverability |
| [Apple Human Interface Guidelines: Icons](https://developer.apple.com/design/human-interface-guidelines/icons) | living guidance, reviewed 2026-07-21 | Apple documentation terms | recommends simple, recognizable symbols and accessible descriptions | **adopt** a familiar universal symbol with a separate accessible name rather than encoding meaning in decorative text |
| [Material Design: Floating action button](https://m2.material.io/components/buttons-floating-action-button) | Material Design 2 guidance, reviewed 2026-07-21 | Google documentation terms | documents icon-only floating controls, minimum target expectations, and accessible descriptions | **adapt** the high-discoverability floating form; **reject** treating the launcher as a conventional single primary action because it opens a growing collection of controls |
| [Material Design Icons `accessibility_new`, rounded](https://github.com/google/material-design-icons/blob/abd7f5c0e179c83f068c770650bd14ebac5d5a09/android/action/accessibility_new/materialiconsround/black/res/drawable/round_accessibility_new_24.xml) | commit `abd7f5c0e179c83f068c770650bd14ebac5d5a09`, reviewed 2026-07-21 | Apache-2.0 | filled silhouette has fewer internal gaps and stronger visual mass than the existing outline at the same distance | **adopt** the 24-unit path as a local inline SVG, enlarged to 42 px; retain attribution in source, bundle, and third-party notice |
| [Lucide `person-standing`](https://lucide.dev/icons/person-standing) | release `1.25.0`, reviewed 2026-07-21 | ISC | simple outline remains available through Obsidian without another asset | **adapt** only as a fallback candidate; **reject** for the launcher because it can be read as a generic person rather than accessibility |
| [Font Awesome `universal-access`](https://fontawesome.com/icons/universal-access) | release `7.3.1`, reviewed 2026-07-21 | CC BY 4.0 for icons | familiar filled symbol is strong at distance | **reject** for this circular trigger because its second circle reduces the usable person silhouette and adds attribution complexity |
| [Lucide `accessibility` icon](https://lucide.dev/icons/accessibility) | release `1.25.0`, reviewed 2026-07-21 | ISC | existing universal human-centered accessibility symbol is available through Obsidian | **reject** as the final launcher after low-vision review: intersecting curves and separated limbs are harder to identify at distance |
| [Obsidian API](https://github.com/obsidianmd/obsidian-api) | API package `1.13.1` used by the project | MIT | `setIcon` supplies Lucide icons without a Node.js or Electron runtime dependency | **adopt** the existing compatibility path already used by the tab-bar control |

The selected Material path data is copied from the pinned Apache-2.0 source and
retains its license notice. No other candidate's source code or SVG path data is
copied.

## Alternatives

| Alternative | Classification | Conclusion |
| --- | --- | --- |
| `A↕`, `Aa`, book, or eye | **reject** as top-level launcher | each anchors the product to typography or reading; these symbols may remain suitable for future internal categories |
| sliders or settings icon | **reject** | broad but generic; communicates configuration more strongly than accessibility |
| custom `OA` mark | **defer** | could support a future public brand, but has no learned meaning today and requires a separate visual asset contract |
| extended icon plus `Acessibilidade` text | **defer** | improves first-use discovery but increases note occlusion; consider only as optional onboarding evidence emerges |
| remove the persistent launcher | **reject** | reduces reachability and discoverability on iPad; commands can remain a secondary route |

## Decision

Render Material Design Icons' filled, rounded `accessibility_new` silhouette at
42 px inside the existing circular 72 px trigger. The filled shape replaces the
33 px Lucide outline because its larger contiguous form remains identifiable at
a greater viewing distance. It is embedded with SVG DOM APIs, requires no
network access or runtime dependency, inherits the current theme color, and is
decorative to assistive technology; the native button carries a dynamic
`Abrir controles de acessibilidade` or `Fechar controles de acessibilidade`
name together with `aria-expanded` and `aria-controls`.

The launcher represents the product, not the current panel implementation. The
panel remains the first focused module and can later evolve into a hub without
changing the user's learned entry point. Do not add dragging, automatic fading,
hidden gestures, an external icon request, or another dependency in this change.

## Risk and validation

Automated tests verify the local icon identifier, filled path, decorative-icon
semantics, expanded state, dynamic accessible name, absence of visible text, and
unchanged control behavior.
The production build and mobile-bundle inspection must continue to pass.

Because shape and icon recognition are visual and assistive-technology concerns,
a physical iPad gate remains required before release: check portrait, landscape,
Split View, left/right placement, light/dark themes, touch, keyboard focus, and
VoiceOver announcement and focus return.
