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
| [Lucide `accessibility` icon](https://lucide.dev/icons/accessibility) | Lucide icon set, reviewed 2026-07-21 | ISC | provides a universal human-centered accessibility symbol as a scalable SVG | **adopt** through Obsidian's built-in `setIcon` API; no copied SVG or new runtime dependency |
| [Obsidian API](https://github.com/obsidianmd/obsidian-api) | API package `1.13.1` used by the project | MIT | `setIcon` supplies Lucide icons without a Node.js or Electron runtime dependency | **adopt** the existing compatibility path already used by the tab-bar control |

No source code or SVG path data is copied from these references.

## Alternatives

| Alternative | Classification | Conclusion |
| --- | --- | --- |
| `A↕`, `Aa`, book, or eye | **reject** as top-level launcher | each anchors the product to typography or reading; these symbols may remain suitable for future internal categories |
| sliders or settings icon | **reject** | broad but generic; communicates configuration more strongly than accessibility |
| custom `OA` mark | **defer** | could support a future public brand, but has no learned meaning today and requires a separate visual asset contract |
| extended icon plus `Acessibilidade` text | **defer** | improves first-use discovery but increases note occlusion; consider only as optional onboarding evidence emerges |
| remove the persistent launcher | **reject** | reduces reachability and discoverability on iPad; commands can remain a secondary route |

## Decision

Render Lucide's `accessibility` icon inside a circular 72 px trigger. The icon is
decorative to assistive technology; the native button carries a dynamic
`Abrir controles de acessibilidade` or `Fechar controles de acessibilidade`
name together with `aria-expanded` and `aria-controls`.

The launcher represents the product, not the current panel implementation. The
panel remains the first focused module and can later evolve into a hub without
changing the user's learned entry point. Do not add dragging, automatic fading,
hidden gestures, a custom SVG, or another dependency in this change.

## Risk and validation

Automated tests verify the icon name, decorative-icon semantics, expanded state,
dynamic accessible name, absence of visible text, and unchanged control behavior.
The production build and mobile-bundle inspection must continue to pass.

Because shape and icon recognition are visual and assistive-technology concerns,
a physical iPad gate remains required before release: check portrait, landscape,
Split View, left/right placement, light/dark themes, touch, keyboard focus, and
VoiceOver announcement and focus return.
