# Research — 150% control scale

Date: 2026-07-21

## Requirement

Increase the complete floating control to 150% of its approved original size:
the closed trigger, panel, labels, icon, buttons, vertical range, track, thumb,
separators, spacing, borders, focus ring, edge offset, and shadows. Preserve the
current behavior, order, positioning, safe areas, and note isolation.

## Reviewed references

| Candidate | Reviewed release | License | Mobile relevance | Classification and conclusion |
| --- | --- | --- | --- | --- |
| [CSS Transforms Module Level 1](https://www.w3.org/TR/css-transforms-1/) | W3C Recommendation, 14 February 2019 | W3C Document License | normative CSS behavior applies to the iPad WebView | **reject** `transform: scale(1.5)` because transforms change client rectangles but not layout flow, complicating the existing viewport-fit and overflow contract |
| [WCAG 2.2 target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced) | WCAG 2.2 Recommendation with 12 December 2024 errata | W3C Document License | explicitly addresses touch targets and limited dexterity | **adopt** the target-size principle; scaling the 44 px controls to 66 px remains comfortably above the 44 × 44 px enhanced target |
| [Obsidian sample plugin](https://github.com/obsidianmd/obsidian-sample-plugin) | release `1.0.0` | 0BSD | the official manifest declares `isDesktopOnly: false` | **reject** as an implementation source because it offers no uniform control-scaling pattern; retain the existing mobile-safe plugin structure |

No source code is copied from these references.

## Decision

Use explicit layout dimensions rather than `transform`, `zoom`, or a new
runtime mechanism. This makes intrinsic layout, `getBoundingClientRect()`, panel
positioning, hit areas, focus outlines, and overflow agree on the same size.

The 150% mapping is mechanical:

| Component | Original | New |
| --- | ---: | ---: |
| Trigger | 48 px | 72 px |
| Panel width | 50 px | 75 px |
| Buttons and range cross-axis | 44 px | 66 px |
| Default range length | 148–170 px | 222–255 px |
| Compact range length | 120 px | 180 px |
| Icon | 22 px | 33 px |
| Step text | 30 px | 45 px |
| Supporting text | 11 px | 16.5 px |
| Panel viewport edge | 8 px | 12 px |

Spacing, radii, borders, focus rings, shadows, and safe-area edge offsets are
also multiplied by 1.5. Percentages, relative color tokens, and the pressed
animation remain unchanged because they already scale proportionally.

## Risk and validation

The taller panel may need scrolling in short Split View or when the software
keyboard reduces the viewport. Preserve `max-height`, `overflow-y: auto`, and a
compact-height media query whose range is also 150% of the original. Automated
checks verify the mechanical dimensions, but a physical iPad remains required
before release to validate portrait, landscape, Split View, software keyboard,
touch, VoiceOver focus order, safe areas, and reachability of every control.
