# Research — recoverable Zen mode

Date: 2026-07-21

## Requirement

Transform the existing tab-bar visibility button into an accessible Zen mode
for reading and presenting long-form notes on iPad. The mode must reduce
navigation chrome without trapping the user, changing note content, changing
the current reading/editing mode, or losing the previous sidebar state.

The right mobile drawer is a required navigation route: its active Outline must
remain selected and the native right-edge swipe must still be able to show the
drawer over the note while Zen mode is active.

## Reviewed references

| Candidate | Reviewed release | License | Mobile evidence | Classification and conclusion |
| --- | --- | --- | --- | --- |
| [Obsidian API](https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts) | npm package `1.13.1` used by the project | MIT | the public API exposes `collapsed`, `collapse()`, and `expand()` on both `WorkspaceMobileDrawer` and `WorkspaceSidedock` | **adopt** the public sidebar state and methods; do not execute undocumented core command IDs or remove drawer DOM |
| [Obsidian Hider](https://github.com/kepano/obsidian-hider) | release `1.6.2` | MIT | `isDesktopOnly: false`; UI features use independently scoped body classes | **adapt** temporary body classes for tab bar, ribbon, and status bar; **reject** the broad settings matrix and hiding scrollbars or document metadata in the first slice |
| [Ultra Zen Mode](https://github.com/MarckFp/ultra-zen-mode) | release `1.15.0` | Apache-2.0 | README explicitly covers desktop, tablet, and mobile | **adapt** deterministic class cleanup and an always-available recovery route; **reject** locking notes, changing view mode, hiding properties/title, and adding another floating exit button |
| [Zen Mode](https://github.com/paperbenni/obsidian-zenmode) | release `1.6.8` | GPL-2.0 | community release supports desktop and mobile and documents an exit button | **adapt** capture-and-restore semantics for sidebars; **reject** full-screen, draggable controls, and optional UI expansion for this version |

No source code or CSS rules are copied from these projects.

## Decision

Replace the persistent `tabBarHidden` preference with a session-only
`ZenModeController`:

1. Capture the collapsed state of both sidebars.
2. Add one plugin-owned `oa-zen-mode` class to `body`.
3. Collapse both sidebars through the public Obsidian API.
4. Hide only the main tab bar, left ribbon, and status bar through scoped CSS.
5. On exit, remove the class and restore each sidebar to the exact captured
   state, including collapsing a drawer that was originally closed but opened
   temporarily during Zen mode.

There must be no Zen CSS selector for `.workspace-drawer` or a sidedock. On
iPad, collapsing closes the overlaid drawer but leaves the drawer and its active
Outline intact for Obsidian's native edge gesture. Selecting a heading must
navigate within the note without leaving Zen mode.

Zen mode does not persist across plugin reloads. Settings schema version `2`
drops the legacy `tabBarHidden` field while preserving profiles, scales, line
height, enabled state, and control side.

## Interaction and recovery

- Inactive button: Lucide `focus`, `Ativar modo zen`, `aria-pressed=false`.
- Active button: Lucide `minimize-2`, `Sair do modo zen`, `aria-pressed=true`.
- Activating or leaving from the panel closes the temporary panel.
- The universal accessibility launcher stays mounted and announces when Zen
  mode is active.
- `Escape` closes an open panel first; with the panel closed it leaves Zen mode.
- A command-palette toggle remains available.
- Changing to a non-Markdown view or unloading the plugin exits automatically.
- Sidebar API errors are isolated; plugin-owned CSS is always removed.

## Validation contract

Automated coverage must include all four initial open/closed sidebar
combinations, opening the right drawer during Zen mode, exact restoration,
repeated toggles, API failure, accessible state and icon changes, Escape,
settings migration, scoped CSS, and absence of drawer-hiding rules.

Physical iPad validation remains mandatory because the native edge gesture is
not guaranteed by the TypeScript API contract. Test portrait, landscape, Split
View, Reading view, Live Preview, software keyboard, left/right control
placement, safe areas, touch, VoiceOver, and the actual target theme. The
release must remain a pre-release until right-to-left swipe opens the overlaid
right drawer, the Outline navigates headings without leaving Zen mode, and all
recovery routes work.
