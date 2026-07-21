# Development roadmap

## Operating rule

Every feature or improvement begins with external research, prioritizing GitHub, official documentation, standards, and auditable source code. Record whether an approach is adopted, adapted, or rejected.

Work directly on `main` under the single-maintainer workflow in [`AGENTS.md`](../AGENTS.md).

## Milestone 0 — Reproducible source

**Goal:** make this repository the complete source of truth without changing `0.1.1`.

- [ ] Migrate TypeScript source, tests, lockfile, scripts, and build configuration.
- [ ] Establish clean-clone `npm ci` and `npm run check`.
- [ ] Rebuild the three artifacts and compare hashes with the handoff.
- [ ] Document unavoidable build differences.
- [ ] Add CI after local reproducibility is proven.
- [ ] Document development installation and rollback.

**Exit gate:** one isolated migration commit with no behavioral or visual change.

## Milestone 1 — Presentation mode

**Goal:** enter and leave a presentation-focused state safely.

- [ ] Research current Obsidian presentation, focus, workspace, and mobile-toolbar patterns.
- [ ] Define the state captured before entry.
- [ ] Implement entry, exit, and deterministic restoration.
- [ ] Provide an obvious recovery route.
- [ ] Simulate failure and verify the interface never becomes trapped.
- [ ] Preserve reading position and the approved slider.

**Already complete:** the left/right floating button and vertical panel are the baseline.

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
