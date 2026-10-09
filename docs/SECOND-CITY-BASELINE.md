# Second City baseline: lessons carried forward, not a cloned metropolis

The reference system is [Swarm Home Hub](https://github.com/hometradescompany-director/Swarm-Home-Hub). Source review covered its README, architecture map, event contract, journal, residence projection, transition policy and federation docs. No claim of exhaustive historical recovery is made.

## What is shared by doctrine

- Opaque agent references, local residence lifecycle, append-only attributable events and derived current-state projections.
- Evidence is not authority. Atlas owns global identity and authority; cities own local admission, residence and capacity.
- Fail closed for absent evidence, transport, permissions or replay durability.
- Federation relationships do not copy canonical mutable state.

## What changes in Second City

- Distinct event namespace (`second.residence.*`) and district-scoped residences, rather than mirroring City A's habitat identifiers.
- Travel infrastructure is first-class, with risk-tiered checkpoints and explicit refusal receipts.
- The Commons Pub is sandbox-only and opt-in. It is not a residence admission substitute.
- Canonical Causality Gundam skill names are used as evidence checkpoints, not as a plugin runtime or a new authority.
- Breathalyzer challenges ungrounded handoff claims at crossings; it never grants rights.

## The first population milestone

Target **functional breadth roughly 10% of City A**, not 10% of lines or fabricated 10% completion. Proposed measurable acceptance: (1) append-only local journal; (2) deterministic residence projection; (3) typed transition policy; (4) a district/capacity admission policy; (5) a ready-to-travel capsule; (6) peer recognition and replay guard; (7) coherent crossing evidence gates; (8) sandbox Pub admission; (9) regression tests and CI; (10) clear Atlas/transport typed absences. These are a milestone rubric, not all completed claims.

The original's long PR train, architecture decisions and historical timelines should inform further slices. Do not import source history into the Second City as if it occurred there.

## Known gaps

No durable storage, real authentication, production Atlas gateway, deployed crossing, visual 3D city, verified skill evaluator provider, or live second-city runtime. The local journal is process memory only.
