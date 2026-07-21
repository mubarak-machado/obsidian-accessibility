# Development roadmap

## Operating rule

Every feature or improvement begins with external research, prioritizing GitHub, official documentation, standards, and auditable source code. Record whether an approach is adopted, adapted, or rejected.

Work directly on `main` under the single-maintainer workflow in [`AGENTS.md`](../AGENTS.md).

## Milestone 0 — Reproducible source

**Goal:** make this repository the complete source of truth without changing `0.1.1`.

- [x] Migrate TypeScript source, tests, lockfile, scripts, and build configuration.
- [x] Establish clean-clone `npm ci` and `npm run check`.
- [x] Rebuild the three artifacts and compare hashes with the handoff.
- [x] Document unavoidable build differences (none were found).
- [x] Add CI after local reproducibility is proven.
- [x] Document development installation and rollback.

**Exit gate:** one isolated migration commit with no behavioral or visual change.

**Completed 2026-07-21:** research `ce127a8`, isolated source migration
`f176807`, and reproducibility evidence `f658a96`. The production bundle and
release assets remained byte-identical to `0.1.1`; CI and development guidance
were added only after the clean-clone gate passed. CI commits `6de769c` and
`c4b983a` culminated in successful GitHub Actions run `29852766796` across
Node.js 20, 22, and 24.

## Milestone 1 — Presentation mode

**Goal:** enter and leave a presentation-focused state safely.

- [ ] Research current Obsidian presentation, focus, workspace, and mobile-toolbar patterns.
- [ ] Define the state captured before entry.
- [ ] Implement entry, exit, and deterministic restoration.
- [ ] Provide an obvious recovery route.
- [ ] Simulate failure and verify the interface never becomes trapped.
- [ ] Preserve reading position and the approved slider.
- [x] Add the first presentation control: a persistent tab-bar toggle inside the approved slider panel.

**Already complete:** the left/right floating button and vertical panel are the baseline.

**First feature slice completed 2026-07-21:** the tab-bar toggle adapts the
body-class and scoped-CSS pattern documented in
[`RESEARCH-tab-bar-toggle-2026-07.md`](RESEARCH-tab-bar-toggle-2026-07.md). It
keeps a command-palette recovery route and restores the tab bar on unload.

**Human gate:** rehearse with a real long-form note on iPad without modifying it.

## Milestone 2 — Interaction safety

- [ ] Research safe editing and keyboard protection.
- [ ] Implement protection with immediate recovery.
- [ ] Integrate commands with the mobile toolbar.
- [ ] Validate external-keyboard shortcuts.
- [ ] Retest VoiceOver, focus order, labels, values, and adjustable actions.
- [ ] Test orientation, split view, safe areas, and context switching.

**Human gate:** complete an end-to-end rehearsal before adding more controls.

## Milestone 3 — Optional reading aids

Prototype independently and keep disabled until approved:

- [ ] paragraph focus or reading ruler;
- [ ] block navigation and temporary position marker;
- [ ] Bluetooth presenter support;
- [ ] reliable screen-wake prevention;
- [ ] isolated pinch-to-scale experiment;
- [ ] optional timer or remaining-time estimate.

Each module must fail independently, avoid note writes, and not depend only on color.

## Milestone 4 — Robustness and distribution

- [ ] Expand automated and physical-device tests.
- [ ] Formalize configuration versioning and migrations.
- [ ] Test BRAT update and rollback.
- [ ] Verify removal and restricted-mode recovery.
- [ ] Establish Obsidian and iPadOS compatibility baselines.
- [ ] Keep release assets, tag, manifest, and `versions.json` coherent.
- [ ] Decide whether official catalog submission is desirable.

## Continuous refinement

- Promote friction only after evidence from real use.
- Remove unused options before adding configuration.
- Retest after relevant Obsidian or iPadOS updates.
- Preserve presentation reliability over convenience.
- Update this roadmap when scope or sequencing changes.
