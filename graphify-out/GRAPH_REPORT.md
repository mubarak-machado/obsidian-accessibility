# Graph Report - .  (2026-07-21)

## Corpus Check
- Corpus is ~2,170 words - fits in a single context window. You may not need a graph.

## Summary
- 120 nodes · 198 edges · 14 communities (9 shown, 5 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Floating Control Behavior|Floating Control Behavior]]
- [[_COMMUNITY_Baseline Contract and Roadmap|Baseline Contract and Roadmap]]
- [[_COMMUNITY_Persisted Settings Store|Persisted Settings Store]]
- [[_COMMUNITY_Plugin Lifecycle Integration|Plugin Lifecycle Integration]]
- [[_COMMUNITY_Migration Milestones and Validation|Migration Milestones and Validation]]
- [[_COMMUNITY_Mobile Accessibility Architecture|Mobile Accessibility Architecture]]
- [[_COMMUNITY_Scale Application and Anchoring|Scale Application and Anchoring]]
- [[_COMMUNITY_Plugin Manifest Metadata|Plugin Manifest Metadata]]
- [[_COMMUNITY_Settings Tab Controls|Settings Tab Controls]]
- [[_COMMUNITY_Research and Compatibility|Research and Compatibility]]
- [[_COMMUNITY_Active Leaf Mounting|Active Leaf Mounting]]
- [[_COMMUNITY_Behavior Style Separation|Behavior Style Separation]]
- [[_COMMUNITY_Lifecycle Cleanup|Lifecycle Cleanup]]
- [[_COMMUNITY_Main Branch Workflow|Main Branch Workflow]]

## God Nodes (most connected - your core abstractions)
1. `p()` - 12 edges
2. `constructor()` - 12 edges
3. `onload()` - 10 edges
4. `update()` - 8 edges
5. `toggle()` - 6 edges
6. `render()` - 6 edges
7. `close()` - 6 edges
8. `scheduleApply()` - 6 edges
9. `replace()` - 6 edges
10. `Obsidian Accessibility` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Source Migration First` --semantically_similar_to--> `Isolated Source Migration`  [INFERRED] [semantically similar]
  AGENTS.md → docs/HANDOFF-v0.1.1.md
- `Note Content Integrity` --semantically_similar_to--> `Local Privacy and Scope`  [INFERRED] [semantically similar]
  AGENTS.md → README.md
- `Approved Floating Accessibility Control` --semantically_similar_to--> `Mobile Accessibility Controls`  [INFERRED] [semantically similar]
  AGENTS.md → README.md
- `Reading Position Preservation` --semantically_similar_to--> `Reading Anchor`  [INFERRED] [semantically similar]
  AGENTS.md → docs/HANDOFF-v0.1.1.md
- `Mandatory Source Migration` --semantically_similar_to--> `Milestone 0 Reproducible Source`  [INFERRED] [semantically similar]
  README.md → docs/ROADMAP.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Preserved Plugin Architecture** — docs_handoff_v0_1_1_scale_store, docs_handoff_v0_1_1_scale_controller, docs_handoff_v0_1_1_font_scale_control, docs_handoff_v0_1_1_positioning, docs_handoff_v0_1_1_reading_anchor, docs_handoff_v0_1_1_settings_model_and_tab [EXTRACTED 1.00]
- **Source Migration Gate** — agents_source_migration_first, readme_mandatory_source_migration, docs_handoff_v0_1_1_isolated_source_migration, docs_handoff_v0_1_1_successful_handoff_gate, docs_roadmap_reproducible_source [INFERRED 0.95]
- **Sequenced Product Roadmap** — docs_roadmap_reproducible_source, docs_roadmap_presentation_mode, docs_roadmap_interaction_safety, docs_roadmap_optional_reading_aids, docs_roadmap_robustness_and_distribution [EXTRACTED 1.00]

## Communities (14 total, 5 thin omitted)

### Community 0 - "Floating Control Behavior"
Cohesion: 0.16
Nodes (21): alignResetLabel(), close(), constructor(), destroy(), H(), onKeyDown(), onOutsidePointer(), positionPanel() (+13 more)

### Community 1 - "Baseline Contract and Roadmap"
Cohesion: 0.15
Nodes (15): Approved Baseline 0.1.1, Mobile-First Runtime, Note Content Integrity, Obsidian Accessibility Operating Contract, Physical iPad Validation, Source Migration First, Validation Contract, Maintainer-Authorized TypeScript Source (+7 more)

### Community 2 - "Persisted Settings Store"
Cohesion: 0.18
Nodes (15): b(), dispose(), ee(), F(), flush(), M(), notify(), p() (+7 more)

### Community 3 - "Plugin Lifecycle Integration"
Cohesion: 0.19
Nodes (14): applyProfileClass(), destroyControl(), I(), O(), observeExternalProfileChanges(), onload(), onunload(), profileLabel() (+6 more)

### Community 4 - "Migration Milestones and Validation"
Cohesion: 0.15
Nodes (13): Coherent Release Metadata and Assets, Approved Artifact Hashes, Behavioral Non-Regression Contract, Successful Handoff Gate, Validated 0.1.1 Baseline, VoiceOver Human Test Gap, Milestone 2 Interaction Safety, Milestone 3 Optional Reading Aids (+5 more)

### Community 5 - "Mobile Accessibility Architecture"
Cohesion: 0.20
Nodes (10): Approved Floating Accessibility Control, Reading Position Preservation, FontScaleControl, Native Rotated HTML Range, Positioning and Safe Areas, Reading Anchor, ScaleController, ScaleStore (+2 more)

### Community 6 - "Scale Application and Anchoring"
Cohesion: 0.29
Nodes (8): applyScaleWithAnchor(), applyToContainer(), cleanContainer(), mount(), refresh(), restore(), scheduleApply(), unmount()

### Community 7 - "Plugin Manifest Metadata"
Cohesion: 0.25
Nodes (7): author, description, id, isDesktopOnly, minAppVersion, name, version

### Community 8 - "Settings Tab Controls"
Cohesion: 0.40
Nodes (5): addProfileSettings(), addScaleSetting(), display(), v(), Z()

## Knowledge Gaps
- **16 isolated node(s):** `id`, `name`, `version`, `minAppVersion`, `description` (+11 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Obsidian Accessibility` connect `Baseline Contract and Roadmap` to `Mobile Accessibility Architecture`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Why does `Mobile Accessibility Controls` connect `Mobile Accessibility Architecture` to `Baseline Contract and Roadmap`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **What connects `id`, `name`, `version` to the rest of the system?**
  _24 weakly-connected nodes found - possible documentation gaps or missing edges._